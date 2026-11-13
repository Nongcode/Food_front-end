import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fail, getCustomerSession, readBody } from "@/lib/customerAuth";
import { OrderInputError, createOrder, toCustomerOrder } from "@/lib/orders";

export async function GET(request: NextRequest) {
  const customer = await getCustomerSession(request);
  if (!customer) return fail("Vui lòng đăng nhập.", 401);
  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: { items: true },
  });
  return NextResponse.json({ success: true, data: orders.map(toCustomerOrder) });
}

export async function POST(request: NextRequest) {
  try {
    const customer = await getCustomerSession(request);
    if (!customer) return fail("Vui lòng đăng nhập để đặt hàng.", 401);
    const order = await createOrder(customer.id, await readBody(request));
    return NextResponse.json({ success: true, data: toCustomerOrder(order) }, { status: 201 });
  } catch (error) {
    if (error instanceof OrderInputError) return fail(error.message, 400);
    console.error("Lỗi tạo đơn hàng:", error);
    return fail("Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.", 500);
  }
}
