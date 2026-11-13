import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cleanText, fail, readBody } from "@/lib/customerAuth";
import { INQUIRY_STATUSES } from "@/lib/orderStatus";
import { customerSummarySelect, parseId, requireAdmin } from "@/lib/adminOrders";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const denied = requireAdmin(request);
    if (denied) return denied;
    const id = parseId((await params).id);
    const inquiry = id ? await prisma.inquiry.findUnique({ where: { id } }) : null;
    if (!inquiry) return fail("Không tìm thấy yêu cầu tư vấn.", 404);

    const body = await readBody(request);
    const data: { status?: string; adminNote?: string | null } = {};
    if (body.status !== undefined) {
      if (typeof body.status !== "string" || !(INQUIRY_STATUSES as readonly string[]).includes(body.status)) {
        return fail("Trạng thái không hợp lệ.", 400);
      }
      data.status = body.status;
    }
    if (body.adminNote !== undefined) data.adminNote = cleanText(body.adminNote);
    if (Object.keys(data).length === 0) return fail("Không có thay đổi.", 400);

    const updated = await prisma.inquiry.update({
      where: { id: inquiry.id },
      data,
      include: { customer: { select: customerSummarySelect } },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Lỗi cập nhật yêu cầu tư vấn:", error);
    return fail("Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.", 500);
  }
}
