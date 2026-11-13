import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { toCustomerInquiry } from "@/lib/orders";
import { cleanText, fail, getCustomerSession, normalizeEmail, normalizePhone, readBody } from "@/lib/customerAuth";

const MAX_TEXT = 2000;
const OPTIONAL_FIELDS = ["products", "quantity", "budget", "occasion", "deliveryArea", "notes"] as const;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request: NextRequest) {
  const customer = await getCustomerSession(request);
  if (!customer) return fail("Vui lòng đăng nhập.", 401);
  const inquiries = await prisma.inquiry.findMany({
    where: { customerId: customer.id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  return NextResponse.json({ success: true, data: inquiries.map(toCustomerInquiry) });
}

export async function POST(request: NextRequest) {
  try {
    const customer = await getCustomerSession(request);
    if (!customer) return fail("Vui lòng đăng nhập để gửi yêu cầu tư vấn.", 401);

    const body = await readBody(request);
    const tooLong = Object.values(body).some((value) => typeof value === "string" && value.length > MAX_TEXT);
    if (tooLong) return fail(`Mỗi trường tối đa ${MAX_TEXT} ký tự.`, 400);

    const requestType = cleanText(body.requestType);
    const contactName = cleanText(body.contactName, 120);
    const contactPhone = normalizePhone(body.contactPhone);
    const contactEmail = normalizeEmail(body.contactEmail);
    if (!requestType) return fail("Vui lòng chọn nhu cầu tư vấn.", 400);
    if (!contactName) return fail("Vui lòng nhập tên người liên hệ.", 400);
    if (!contactPhone) return fail("Số điện thoại không hợp lệ.", 400);
    if (contactEmail && !EMAIL_PATTERN.test(contactEmail)) return fail("Email không hợp lệ.", 400);

    const optional = Object.fromEntries(OPTIONAL_FIELDS.map((field) => [field, cleanText(body[field])]));
    const inquiry = await prisma.inquiry.create({
      data: { ...optional, requestType, contactName, contactPhone, contactEmail: contactEmail || null, customerId: customer.id },
    });
    return NextResponse.json({ success: true, data: toCustomerInquiry(inquiry) }, { status: 201 });
  } catch (error) {
    console.error("Lỗi tạo yêu cầu tư vấn:", error);
    return fail("Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.", 500);
  }
}
