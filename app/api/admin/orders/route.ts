import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { fail } from "@/lib/customerAuth";
import { isOrderStatus } from "@/lib/orderStatus";
import { ADMIN_PAGE_SIZE, requireAdmin } from "@/lib/adminOrders";

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const params = request.nextUrl.searchParams;
  const status = params.get("status") || "";
  const q = (params.get("q") || "").trim();
  const page = Math.max(1, Number.parseInt(params.get("page") || "1", 10) || 1);
  if (status && !isOrderStatus(status)) return fail("Trạng thái không hợp lệ.", 400);

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { code: { contains: q, mode: "insensitive" } },
            { receiverName: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      include: { items: true },
    }),
    prisma.order.count({ where }),
  ]);
  return NextResponse.json({ success: true, data: { items, total, page, pageSize: ADMIN_PAGE_SIZE } });
}
