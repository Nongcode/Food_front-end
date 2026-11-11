import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cleanText, fail, getCustomerSession, normalizePhone, readBody, toPublicCustomer } from "@/lib/customerAuth";

export async function GET(request: NextRequest) {
  const customer = await getCustomerSession(request);
  if (!customer) return fail("Vui lòng đăng nhập.", 401);
  return NextResponse.json({ success: true, data: toPublicCustomer(customer) });
}

// Sửa hồ sơ; email không đổi được
export async function PATCH(request: NextRequest) {
  try {
    const customer = await getCustomerSession(request);
    if (!customer) return fail("Vui lòng đăng nhập.", 401);

    const body = await readBody(request);
    const data: { name?: string; phone?: string; address?: string | null; birthday?: string | null } = {};
    if (body.name !== undefined) {
      const name = cleanText(body.name, 120);
      if (!name) return fail("Vui lòng nhập họ và tên.", 400);
      data.name = name;
    }
    if (body.phone !== undefined) {
      const phone = normalizePhone(body.phone);
      if (!phone) return fail("Số điện thoại không hợp lệ.", 400);
      data.phone = phone;
    }
    if (body.address !== undefined) data.address = cleanText(body.address, 500);
    if (body.birthday !== undefined) data.birthday = cleanText(body.birthday, 20);

    const updated = await prisma.customer.update({ where: { id: customer.id }, data });
    return NextResponse.json({ success: true, data: toPublicCustomer(updated) });
  } catch (error) {
    console.error("Lỗi cập nhật hồ sơ khách hàng:", error);
    return fail("Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.", 500);
  }
}
