import { after, test } from "node:test";
import assert from "node:assert/strict";
import prisma from "../../lib/prisma";
import { cleanupTestData, cookieFrom, jsonRequest, readJson, uniqueEmail } from "../helpers";
import { POST as register } from "../../app/api/auth/register/route";
import { POST as login } from "../../app/api/auth/login/route";
import { POST as logout } from "../../app/api/auth/logout/route";
import { GET as getMe, PATCH as patchMe } from "../../app/api/auth/me/route";
import { GET as getAdminMe } from "../../app/api/admin/me/route";

after(async () => {
  await cleanupTestData();
});

const password = "matkhau123";

function registerBody(email: string, extra: Record<string, unknown> = {}) {
  return { name: "Khách Test", email, phone: "0912 345 678", password, ...extra };
}

test("đăng ký chuẩn hoá email, set cookie", async () => {
  const raw = uniqueEmail("An");
  const res = await register(jsonRequest("/api/auth/register", { body: registerBody(`  ${raw.toUpperCase()} `) }));
  const data = await readJson(res);
  assert.equal(res.status, 201);
  assert.equal(data.success, true);
  assert.equal(data.data.email, raw.toLowerCase());
  assert.equal(data.data.phone, "0912345678");
  assert.ok(cookieFrom(res, "customer_token"));
  assert.equal("passwordHash" in data.data, false);
});

test("đăng ký trùng email (khác hoa/thường) → 409", async () => {
  const email = uniqueEmail();
  await register(jsonRequest("/api/auth/register", { body: registerBody(email) }));
  const res = await register(jsonRequest("/api/auth/register", { body: registerBody(email.toUpperCase()) }));
  assert.equal(res.status, 409);
});

test("kích hoạt khách cũ chưa có mật khẩu", async () => {
  const email = uniqueEmail("Old");
  const old = await prisma.customer.create({ data: { name: "Cũ", email, phone: "0900000000" } });
  const res = await register(jsonRequest("/api/auth/register", { body: registerBody(email.toLowerCase(), { name: "Mới" }) }));
  const data = await readJson(res);
  assert.equal(res.status, 201);
  assert.equal(data.data.id, old.id);
  const updated = await prisma.customer.findUniqueOrThrow({ where: { id: old.id } });
  assert.equal(updated.name, "Mới");
  assert.equal(updated.phone, "0912345678");
  assert.ok(updated.passwordHash);
});

test("đăng ký sai dữ liệu → 400", async () => {
  const short = await register(jsonRequest("/api/auth/register", { body: registerBody(uniqueEmail(), { password: "12345" }) }));
  assert.equal(short.status, 400);
  const badPhone = await register(jsonRequest("/api/auth/register", { body: registerBody(uniqueEmail(), { phone: "12345" }) }));
  assert.equal(badPhone.status, 400);
  const noName = await register(jsonRequest("/api/auth/register", { body: registerBody(uniqueEmail(), { name: " " }) }));
  assert.equal(noName.status, 400);
});

test("đăng nhập sai trả cùng thông báo 401; đúng thì cập nhật lastLoginAt", async () => {
  const email = uniqueEmail();
  await register(jsonRequest("/api/auth/register", { body: registerBody(email) }));
  const wrongPass = await login(jsonRequest("/api/auth/login", { body: { email, password: "sai-mat-khau" } }));
  const noUser = await login(jsonRequest("/api/auth/login", { body: { email: uniqueEmail(), password } }));
  assert.equal(wrongPass.status, 401);
  assert.equal(noUser.status, 401);
  assert.equal((await readJson(wrongPass)).error, (await readJson(noUser)).error);

  const ok = await login(jsonRequest("/api/auth/login", { body: { email: ` ${email.toUpperCase()}`, password } }));
  assert.equal(ok.status, 200);
  assert.ok(cookieFrom(ok, "customer_token"));
  const customer = await prisma.customer.findUniqueOrThrow({ where: { email } });
  assert.ok(customer.lastLoginAt);
});

test("/me: GET chưa đăng nhập trả data null (không log lỗi 401 trên mọi trang), PATCH 401; PATCH không đổi email", async () => {
  const anonymous = await getMe(jsonRequest("/api/auth/me"));
  assert.equal(anonymous.status, 200);
  assert.equal((await readJson(anonymous)).data, null);
  assert.equal((await patchMe(jsonRequest("/api/auth/me", { method: "PATCH", body: { name: "X" } }))).status, 401);

  const email = uniqueEmail();
  const reg = await register(jsonRequest("/api/auth/register", { body: registerBody(email) }));
  const cookie = cookieFrom(reg, "customer_token");
  const me = await getMe(jsonRequest("/api/auth/me", { cookie }));
  const meData = await readJson(me);
  assert.equal(me.status, 200);
  assert.equal(meData.data.email, email);
  assert.equal("passwordHash" in meData.data, false);

  const patched = await patchMe(jsonRequest("/api/auth/me", { method: "PATCH", cookie, body: { name: "Tên mới", address: "Mộc Châu", email: "khac@x.com" } }));
  const patchedData = await readJson(patched);
  assert.equal(patched.status, 200);
  assert.equal(patchedData.data.name, "Tên mới");
  assert.equal(patchedData.data.address, "Mộc Châu");
  assert.equal(patchedData.data.email, email);
});

test("token khách không dùng được làm token admin", async () => {
  const reg = await register(jsonRequest("/api/auth/register", { body: registerBody(uniqueEmail()) }));
  const token = cookieFrom(reg, "customer_token").split("=")[1];
  const res = await getAdminMe(jsonRequest("/api/admin/me", { cookie: `admin_token=${token}` }));
  assert.equal(res.status, 401);
});

test("logout xoá cookie", async () => {
  const res = await logout();
  assert.equal(res.status, 200);
  const cookie = res.cookies.get("customer_token");
  assert.ok(cookie);
  assert.equal(cookie.value, "");
});
