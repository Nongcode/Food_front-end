import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cleanText, fail, readBody } from "@/lib/customerAuth";
import { canTransition, isOrderStatus } from "@/lib/orderStatus";
import { customerSummarySelect, parseId, requireAdmin } from "@/lib/adminOrders";

type Context = { params: Promise<{ id: string }> };

function findOrder(id: number) {
  return prisma.order.findUnique({ where: { id }, include: { items: true, customer: { select: customerSummarySelect } } });
}

export async function GET(request: NextRequest, { params }: Context) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const id = parseId((await params).id);
  const order = id ? await findOrder(id) : null;
  if (!order) return fail("Không tìm thấy đơn hàng.", 404);
  return NextResponse.json({ success: true, data: order });
}

// Đổi trạng thái theo NEXT_ORDER_STATUS; huỷ bắt buộc lý do; ghi chú nội bộ sửa tự do
export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    const denied = requireAdmin(request);
    if (denied) return denied;
    const id = parseId((await params).id);
    const order = id ? await prisma.order.findUnique({ where: { id } }) : null;
    if (!order) return fail("Không tìm thấy đơn hàng.", 404);

    const body = await readBody(request);
    const data: { status?: string; cancelReason?: string; cancelledBy?: string; cancelledAt?: Date; adminNote?: string | null } = {};
    if (body.adminNote !== undefined) data.adminNote = cleanText(body.adminNote);

    if (body.status !== undefined) {
      if (!isOrderStatus(body.status)) return fail("Trạng thái không hợp lệ.", 400);
      if (!isOrderStatus(order.status) || !canTransition(order.status, body.status)) {
        return fail("Không thể chuyển đơn sang trạng thái này.", 409);
      }
      data.status = body.status;
      if (body.status === "cancelled") {
        const reason = cleanText(body.cancelReason, 500);
        if (!reason) return fail("Vui lòng nhập lý do huỷ đơn.", 400);
        Object.assign(data, { cancelReason: reason, cancelledBy: "admin", cancelledAt: new Date() });
      }
    }
    if (Object.keys(data).length === 0) return fail("Không có thay đổi.", 400);

    // Điều kiện status trong where để hai thao tác đồng thời không ghi đè nhau
    const result = await prisma.order.updateMany({ where: { id: order.id, status: order.status }, data });
    if (result.count === 0) return fail("Đơn hàng vừa được cập nhật, vui lòng tải lại.", 409);
    return NextResponse.json({ success: true, data: await findOrder(order.id) });
  } catch (error) {
    console.error("Lỗi cập nhật đơn hàng (admin):", error);
    return fail("Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.", 500);
  }
}
