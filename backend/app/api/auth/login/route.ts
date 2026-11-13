import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { fail, normalizeEmail, readBody, setCustomerCookie, signCustomerToken, toPublicCustomer } from "@/lib/customerAuth";

const INVALID_LOGIN = "Email hoặc mật khẩu không đúng.";

export async function POST(request: NextRequest) {
  try {
    const body = await readBody(request);
    const email = normalizeEmail(body.email);
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) return fail(INVALID_LOGIN, 401);

    const customer = await prisma.customer.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
    if (!customer?.passwordHash || !verifyPassword(password, customer.passwordHash)) return fail(INVALID_LOGIN, 401);

    const updated = await prisma.customer.update({ where: { id: customer.id }, data: { lastLoginAt: new Date() } });
    const res = NextResponse.json({ success: true, data: toPublicCustomer(updated) });
    setCustomerCookie(res, signCustomerToken(updated.id));
    return res;
  } catch (error) {
    console.error("Lỗi đăng nhập khách hàng:", error);
    return fail("Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.", 500);
  }
}
