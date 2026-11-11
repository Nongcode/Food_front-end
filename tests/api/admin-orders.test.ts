import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import prisma from "../../lib/prisma";
import { signToken } from "../../lib/auth";
import { cleanupTestData, cookieFrom, jsonRequest, readJson, uniqueEmail, uniqueSlug } from "../helpers";
import { POST as register } from "../../app/api/auth/register/route";
import { POST as createOrder } from "../../app/api/orders/route";
import { POST as createInquiry } from "../../app/api/inquiries/route";
import { GET as listOrders } from "../../app/api/admin/orders/route";
import { GET as getOrder, PATCH as patchOrder } from "../../app/api/admin/orders/[id]/route";
import { GET as listInquiries } from "../../app/api/admin/inquiries/route";
import { PATCH as patchInquiry } from "../../app/api/admin/inquiries/[id]/route";
import { GET as listCustomers } from "../../app/api/admin/customers/route";
import { POST as saveSettings } from "../../app/api/admin/settings/route";

const adminCookie = `admin_token=${signToken({ id: 1, email: "admin", fullName: "Admin Test", role: "admin" })}`;
const pkgSlug = uniqueSlug("admpkg");
const phone = `09${String(Date.now()).slice(-8)}`;
let customerCookie = "";

async function newOrder() {
  const res = await createOrder(
    jsonRequest("/api/orders", {
      cookie: customerCookie,
      body: { receiverName: "Người Nhận Admin", phone, address: "Sơn La", items: [{ itemType: "package", slug: pkgSlug, quantity: 1 }] },
    }),
  );
  return (await readJson(res)).data;
}

function idParams(id: number | string) {
  return { params: Promise.resolve({ id: String(id) }) };
}

function adminPatch(id: number, body: unknown) {
  return patchOrder(jsonRequest(`/api/admin/orders/${id}`, { method: "PATCH", body, cookie: adminCookie }), idParams(id));
}

before(async () => {
  await prisma.package.create({ data: { slug: pkgSlug, name: "Gói Admin", price: 120000, status: "Đang mở bán" } });
  const res = await register(
    jsonRequest("/api/auth/register", { body: { name: "Khách Admin", email: uniqueEmail("adm"), phone: "0912345678", password: "matkhau123" } }),
  );
  customerCookie = cookieFrom(res, "customer_token");
});

after(async () => {
  await cleanupTestData();
});

test("route admin từ chối khi không có hoặc dùng token khách", async () => {
  const customerToken = customerCookie.split("=")[1];
  for (const cookie of [undefined, `admin_token=${customerToken}`]) {
    assert.equal((await listOrders(jsonRequest("/api/admin/orders", { cookie }))).status, 401);
    assert.equal((await getOrder(jsonRequest("/api/admin/orders/1", { cookie }), idParams(1))).status, 401);
    assert.equal((await listInquiries(jsonRequest("/api/admin/inquiries", { cookie }))).status, 401);
    assert.equal(
      (await patchInquiry(jsonRequest("/api/admin/inquiries/1", { method: "PATCH", body: { status: "closed" }, cookie }), idParams(1))).status,
      401,
    );
  }
});

test("chuyển trạng thái đơn theo đúng luồng", async () => {
  const order = await newOrder();
  assert.equal((await adminPatch(order.id, { status: "shipping" })).status, 409);
  for (const status of ["confirmed", "shipping", "delivered"]) {
    const res = await adminPatch(order.id, { status });
    assert.equal(res.status, 200, status);
    assert.equal((await readJson(res)).data.status, status);
  }
  assert.equal((await adminPatch(order.id, { status: "cancelled", cancelReason: "Muộn" })).status, 409);
  assert.equal((await adminPatch(order.id, { status: "abc" })).status, 400);
});

test("huỷ cần lý do; ghi chú nội bộ không đổi trạng thái", async () => {
  const order = await newOrder();
  assert.equal((await adminPatch(order.id, { status: "cancelled" })).status, 400);

  const noted = await adminPatch(order.id, { adminNote: "Gọi lại sau 17h" });
  const notedData = (await readJson(noted)).data;
  assert.equal(noted.status, 200);
  assert.equal(notedData.adminNote, "Gọi lại sau 17h");
  assert.equal(notedData.status, "pending");

  const cancelled = await adminPatch(order.id, { status: "cancelled", cancelReason: "Hết hàng" });
  const data = (await readJson(cancelled)).data;
  assert.equal(cancelled.status, 200);
  assert.equal(data.cancelledBy, "admin");
  assert.ok(data.cancelledAt);

  const detail = await getOrder(jsonRequest(`/api/admin/orders/${order.id}`, { cookie: adminCookie }), idParams(order.id));
  const detailData = (await readJson(detail)).data;
  assert.equal(detail.status, 200);
  assert.equal(detailData.items.length, 1);
  assert.ok(detailData.customer);
  assert.equal("passwordHash" in detailData.customer, false);
});

test("lọc đơn theo trạng thái và 4 số cuối SĐT", async () => {
  const order = await newOrder();
  const res = await listOrders(jsonRequest(`/api/admin/orders?status=pending&q=${phone.slice(-4)}`, { cookie: adminCookie }));
  const { data } = await readJson(res);
  assert.equal(res.status, 200);
  assert.equal(data.pageSize, 20);
  assert.ok(data.items.some((item: any) => item.id === order.id));
  assert.ok(data.items.every((item: any) => item.status === "pending"));
});

test("đổi trạng thái yêu cầu tư vấn", async () => {
  const created = await createInquiry(
    jsonRequest("/api/inquiries", { cookie: customerCookie, body: { requestType: "Quà Tết", contactName: "Liên Hệ", contactPhone: phone } }),
  );
  const inquiry = (await readJson(created)).data;
  const patch = (body: unknown) =>
    patchInquiry(jsonRequest(`/api/admin/inquiries/${inquiry.id}`, { method: "PATCH", body, cookie: adminCookie }), idParams(inquiry.id));

  const ok = await patch({ status: "contacted", adminNote: "Đã gọi" });
  assert.equal(ok.status, 200);
  assert.equal((await readJson(ok)).data.status, "contacted");
  assert.equal((await patch({ status: "abc" })).status, 400);

  const list = await listInquiries(jsonRequest(`/api/admin/inquiries?status=contacted&q=${phone.slice(-4)}`, { cookie: adminCookie }));
  assert.ok((await readJson(list)).data.some((item: any) => item.id === inquiry.id));
});

test("danh sách khách có hasAccount, orderCount, không lộ passwordHash", async () => {
  const res = await listCustomers(jsonRequest("/api/admin/customers", { cookie: adminCookie }));
  const { customers } = await readJson(res);
  const mine = customers.find((item: any) => item.email.startsWith("adm") && item.email.endsWith("@sonlafood.local"));
  assert.ok(mine);
  assert.equal(mine.hasAccount, true);
  assert.ok(mine.orderCount >= 1);
  assert.equal("passwordHash" in mine, false);
});

test("cấu hình order_packing_fee chỉ nhận số nguyên ≥ 0", async () => {
  const save = (value: string) => saveSettings(jsonRequest("/api/admin/settings", { cookie: adminCookie, body: { settings: { order_packing_fee: value } } }));
  assert.equal((await save("abc")).status, 400);
  assert.equal((await save("-5")).status, 400);

  const original = await prisma.siteSetting.findUnique({ where: { settingKey: "order_packing_fee" } });
  try {
    assert.equal((await save("25000")).status, 200);
  } finally {
    if (original) await prisma.siteSetting.update({ where: { settingKey: "order_packing_fee" }, data: { settingValue: original.settingValue } });
    else await prisma.siteSetting.delete({ where: { settingKey: "order_packing_fee" } });
  }
});
