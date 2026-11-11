import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { fail } from "@/lib/customerAuth";
import { INQUIRY_STATUSES } from "@/lib/orderStatus";
import { customerSummarySelect, requireAdmin } from "@/lib/adminOrders";

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const params = request.nextUrl.searchParams;
  const status = params.get("status") || "";
  const q = (params.get("q") || "").trim();
  if (status && !(INQUIRY_STATUSES as readonly string[]).includes(status)) return fail("Trạng thái không hợp lệ.", 400);

  const where: Prisma.InquiryWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { contactName: { contains: q, mode: "insensitive" } },
            { contactPhone: { contains: q } },
            { requestType: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const inquiries = await prisma.inquiry.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: { customer: { select: customerSummarySelect } },
  });
  return NextResponse.json({ success: true, data: inquiries });
}
