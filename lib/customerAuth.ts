import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import type { Customer } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getJwtSecret } from "@/lib/auth";

// Token khách hàng: khoá và aud khác token admin nên không dùng thay nhau được
export const CUSTOMER_COOKIE = "customer_token";
const CUSTOMER_TOKEN_AUDIENCE = "customer";
const CUSTOMER_TOKEN_DAYS = 30;

function sign(input: string) {
  return crypto.createHmac("sha256", `${getJwtSecret()}:customer`).update(input).digest("base64url");
}

export function signCustomerToken(customerId: number): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + CUSTOMER_TOKEN_DAYS * 24 * 60 * 60;
  const payload = Buffer.from(JSON.stringify({ sub: customerId, aud: CUSTOMER_TOKEN_AUDIENCE, exp })).toString("base64url");
  return `${header}.${payload}.${sign(`${header}.${payload}`)}`;
}

export function verifyCustomerToken(token: string): { sub: number } | null {
  try {
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) return null;
    const expected = sign(`${header}.${payload}`);
    if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (decoded.aud !== CUSTOMER_TOKEN_AUDIENCE) return null;
    if (!decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) return null;
    if (!Number.isInteger(decoded.sub)) return null;
    return { sub: decoded.sub };
  } catch {
    return null;
  }
}

export async function getCustomerSession(request: NextRequest): Promise<Customer | null> {
  const token = request.cookies.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  const verified = verifyCustomerToken(token);
  if (!verified) return null;
  const customer = await prisma.customer.findUnique({ where: { id: verified.sub } });
  return customer?.passwordHash ? customer : null;
}

export function setCustomerCookie(res: NextResponse, token: string): void {
  res.cookies.set({
    name: CUSTOMER_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: CUSTOMER_TOKEN_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export function clearCustomerCookie(res: NextResponse): void {
  res.cookies.set({ name: CUSTOMER_COOKIE, value: "", httpOnly: true, sameSite: "lax", maxAge: 0, path: "/" });
}

export function toPublicCustomer(customer: Customer) {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    birthday: customer.birthday,
  };
}

export function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

// Số điện thoại 9–11 chữ số sau khi bỏ khoảng trắng, dấu chấm, gạch
export function normalizePhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const digits = value.replace(/[\s.\-]/g, "");
  return /^\d{9,11}$/.test(digits) ? digits : null;
}

// Chuỗi đã trim; rỗng hoặc dài quá maxLength → null
export function cleanText(value: unknown, maxLength = 2000): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= maxLength ? trimmed : null;
}

export function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function readBody(request: NextRequest): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? body : {};
  } catch {
    return {};
  }
}
