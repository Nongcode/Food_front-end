import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cleanText, fail, getCustomerSession, readBody } from "@/lib/customerAuth";
import { OrderInputError, readReceiver, toCustomerOrder } from "@/lib/orders";

// Khách chỉ sửa / huỷ đơn của mình khi đơn còn "pending"
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const customer = await getCustomerSession(request);
    if (!customer) return fail("Vui lòng đăng nhập.", 401);

    const { code } = await params;
    const order = await prisma.order.findUnique({ where: { code } });
    if (!order || order.customerId !== customer.id) return fail("Không tìm thấy đơn hàng.", 404);
    if (order.status !== "pending") return fail("Đơn hàng đã được xử lý, không thể thay đổi.", 409);

    const body = await readBody(request);
    const data =
      body.action === "cancel"
        ? (() => {
            const reason = cleanText(body.reason, 500);
            if (!reason) throw new OrderInputError("Vui lòng nhập lý do huỷ đơn.");
            return { status: "cancelled", cancelReason: reason, cancelledBy: "customer", cancelledAt: new Date() };
          })()
        : readReceiver(body, true);

    // Điều kiện status trong where để hai yêu cầu đồng thời không cùng sửa một đơn đã đổi trạng thái
    const result = await prisma.order.updateMany({ where: { id: order.id, status: "pending" }, data });
    if (result.count === 0) return fail("Đơn hàng đã được xử lý, không thể thay đổi.", 409);

    const updated = await prisma.order.findUnique({ where: { id: order.id }, include: { items: true } });
    return NextResponse.json({ success: true, data: updated ? toCustomerOrder(updated) : null });
  } catch (error) {
    if (error instanceof OrderInputError) return fail(error.message, 400);
    console.error("Lỗi cập nhật đơn hàng:", error);
    return fail("Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.", 500);
  }
}
