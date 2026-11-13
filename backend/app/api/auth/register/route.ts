import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { cleanText, fail, normalizeEmail, normalizePhone, parseBirthday, readBody, setCustomerCookie, signCustomerToken, toPublicCustomer } from "@/lib/customerAuth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await readBody(request);
    const name = cleanText(body.name, 120);
    const email = normalizeEmail(body.email);
    const phone = normalizePhone(body.phone);
    const password = typeof body.password === "string" ? body.password : "";

    if (!name) return fail("Vui lòng nhập họ và tên.", 400);
    if (!EMAIL_PATTERN.test(email)) return fail("Email không hợp lệ.", 400);
    if (!phone) return fail("Số điện thoại không hợp lệ.", 400);
    if (password.length < 6) return fail("Mật khẩu cần ít nhất 6 ký tự.", 400);
    const birthday = parseBirthday(body.birthday);
    if (!birthday.ok) return fail(birthday.error, 400);

    const profile = {
      name,
      email,
      phone,
      passwordHash: hashPassword(password),
      address: cleanText(body.address, 500),
      birthday: birthday.value,
      lastLoginAt: new Date(),
    };

    // Email có sẵn trong bảng (khách cũ) nhưng chưa có mật khẩu → kích hoạt dòng đó
    const existing = await prisma.customer.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
    if (existing?.passwordHash) return fail("Email này đã được đăng ký. Vui lòng đăng nhập.", 409);

    const customer = existing
      ? await prisma.customer.update({ where: { id: existing.id }, data: profile })
      : await prisma.customer.create({ data: profile });

    const res = NextResponse.json({ success: true, data: toPublicCustomer(customer) }, { status: 201 });
    setCustomerCookie(res, signCustomerToken(customer.id));
    return res;
  } catch (error) {
    console.error("Lỗi đăng ký khách hàng:", error);
    return fail("Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.", 500);
  }
}
