import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import prisma from "../../lib/prisma";
import { cleanupTestData, cookieFrom, jsonRequest, readJson, uniqueEmail } from "../helpers";
import { POST as register } from "../../app/api/auth/register/route";
import { GET as listInquiries, POST as createInquiry } from "../../app/api/inquiries/route";

let cookieA = "";
let cookieB = "";
let customerIdA = 0;

const validBody = {
  requestType: "Quà biếu doanh nghiệp",
  products: "Chè Shan tuyết",
  quantity: "50 hộp",
  contactName: "Người Liên Hệ",
  contactPhone: "0912 345 678",
  contactEmail: "LienHe@Example.com",
};

before(async () => {
  const resA = await register(
    jsonRequest("/api/auth/register", { body: { name: "Khách A", email: uniqueEmail("inqA"), phone: "0912345678", password: "matkhau123" } }),
  );
  cookieA = cookieFrom(resA, "customer_token");
  customerIdA = (await readJson(resA)).data.id;
  const resB = await register(
    jsonRequest("/api/auth/register", { body: { name: "Khách B", email: uniqueEmail("inqB"), phone: "0912345678", password: "matkhau123" } }),
  );
  cookieB = cookieFrom(resB, "customer_token");
});

after(async () => {
  await cleanupTestData();
});

test("POST /api/inquiries cần đăng nhập", async () => {
  const res = await createInquiry(jsonRequest("/api/inquiries", { body: validBody }));
  assert.equal(res.status, 401);
});

test("POST thiếu requestType hoặc chuỗi quá dài → 400", async () => {
  const missing = await createInquiry(jsonRequest("/api/inquiries", { cookie: cookieA, body: { ...validBody, requestType: "" } }));
  assert.equal(missing.status, 400);
  const tooLong = await createInquiry(jsonRequest("/api/inquiries", { cookie: cookieA, body: { ...validBody, notes: "x".repeat(2001) } }));
  assert.equal(tooLong.status, 400);
});

test("POST hợp lệ → 201, status new, đúng khách", async () => {
  const res = await createInquiry(jsonRequest("/api/inquiries", { cookie: cookieA, body: validBody }));
  const { data } = await readJson(res);
  assert.equal(res.status, 201);
  assert.equal(data.status, "new");
  assert.equal(data.customerId, customerIdA);
  assert.equal(data.contactPhone, "0912345678");
  assert.equal(data.contactEmail, "lienhe@example.com");
});

test("GET chỉ trả yêu cầu của khách đang đăng nhập", async () => {
  const resA = await listInquiries(jsonRequest("/api/inquiries", { cookie: cookieA }));
  const dataA = (await readJson(resA)).data;
  assert.equal(resA.status, 200);
  assert.ok(dataA.length >= 1);
  assert.ok(dataA.every((item: any) => item.customerId === customerIdA));

  const resB = await listInquiries(jsonRequest("/api/inquiries", { cookie: cookieB }));
  assert.equal((await readJson(resB)).data.length, 0);
});

test("API khách không trả ghi chú nội bộ adminNote (POST, GET)", async () => {
  const res = await createInquiry(jsonRequest("/api/inquiries", { cookie: cookieA, body: validBody }));
  const { data } = await readJson(res);
  assert.equal(res.status, 201);
  assert.ok(!("adminNote" in data), "POST trả adminNote");

  await prisma.inquiry.update({ where: { id: data.id }, data: { adminNote: "Ghi chú nội bộ bí mật" } });
  const list = (await readJson(await listInquiries(jsonRequest("/api/inquiries", { cookie: cookieA })))).data;
  assert.ok(list.length >= 1);
  assert.ok(list.every((item: object) => !("adminNote" in item)), "GET trả adminNote");
  assert.ok(!JSON.stringify(list).includes("Ghi chú nội bộ bí mật"));
});
