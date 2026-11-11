import "dotenv/config";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../lib/prisma";

export const TEST_EMAIL_DOMAIN = "@sonlafood.local";

export function jsonRequest(url: string, init: { method?: string; body?: unknown; cookie?: string } = {}): NextRequest {
  const headers: Record<string, string> = {};
  if (init.body !== undefined) headers["content-type"] = "application/json";
  if (init.cookie) headers.cookie = init.cookie;
  return new NextRequest(new URL(url, "http://localhost:3001"), {
    method: init.method || (init.body !== undefined ? "POST" : "GET"),
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
}

export async function readJson(res: Response): Promise<any> {
  return res.json();
}

// Trả "name=value" để gắn vào header cookie của request tiếp theo
export function cookieFrom(res: NextResponse, name: string): string {
  const cookie = res.cookies.get(name);
  if (!cookie) throw new Error(`Response không set cookie ${name}`);
  return `${name}=${cookie.value}`;
}

export function uniqueEmail(prefix = "test"): string {
  return `${prefix}+${crypto.randomBytes(5).toString("hex")}${TEST_EMAIL_DOMAIN}`;
}

export function uniqueSlug(prefix: string): string {
  return `test-${prefix}-${crypto.randomBytes(4).toString("hex")}`;
}

async function ignoreMissingTable(run: () => Promise<unknown>) {
  try {
    await run();
  } catch (error: any) {
    // Bảng chưa tồn tại (trước khi db push) thì bỏ qua
    if (error?.code !== "P2021" && !(error instanceof TypeError)) throw error;
  }
}

export async function cleanupTestData(): Promise<void> {
  const customerWhere = { email: { endsWith: TEST_EMAIL_DOMAIN, mode: "insensitive" as const } };
  const db = prisma as any;
  await ignoreMissingTable(() => db.order.deleteMany({ where: { customer: customerWhere } }));
  await ignoreMissingTable(() => db.inquiry.deleteMany({ where: { customer: customerWhere } }));
  await prisma.customer.deleteMany({ where: customerWhere });
  await prisma.package.deleteMany({ where: { slug: { startsWith: "test-" } } });
  await prisma.localSpecialty.deleteMany({ where: { slug: { startsWith: "test-" } } });
}
