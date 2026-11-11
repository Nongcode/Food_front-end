import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import prisma from "../../lib/prisma";
import { cleanupTestData, cookieFrom, jsonRequest, readJson, uniqueEmail, uniqueSlug } from "../helpers";
import { POST as register } from "../../app/api/auth/register/route";
import { GET as listOrders, POST as createOrder } from "../../app/api/orders/route";
import { PATCH as patchOrder } from "../../app/api/orders/[code]/route";
import { GET as getOrderSettings } from "../../app/api/public/order-settings/route";

const pkgSlug = uniqueSlug("pkg");
const spSlug = uniqueSlug("sp");
const closedSlug = uniqueSlug("closed");
let cookieA = "";
let cookieB = "";

async function registerCustomer(prefix: string) {
  const res = await register(
    jsonRequest("/api/auth/register", { body: { name: "Khách Đơn", email: uniqueEmail(prefix), phone: "0912345678", password: "matkhau123" } }),
  );
  return cookieFrom(res, "customer_token");
}

const receiver = { receiverName: "Người Nhận", phone: "0987654321", address: "Sơn La" };

function orderBody(items: unknown[]) {
  return { ...receiver, items };
}

function patch(code: string, body: unknown, cookie: string) {
  return patchOrder(jsonRequest(`/api/orders/${code}`, { method: "PATCH", body, cookie }), { params: Promise.resolve({ code }) });
}

before(async () => {
  await prisma.package.create({ data: { slug: pkgSlug, name: "Gói Test", price: 100000, status: "Đang mở bán" } });
  await prisma.package.create({ data: { slug: closedSlug, name: "Gói Đóng", price: 50000, status: "Đã đóng" } });
  await prisma.localSpecialty.create({ data: { slug: spSlug, name: "Đặc sản Test", type: "food", price: null, status: "Hiển thị" } });
  cookieA = await registerCustomer("orderA");
  cookieB = await registerCustomer("orderB");
});

after(async () => {
  await cleanupTestData();
});

test("POST /api/orders cần đăng nhập", async () => {
  const res = await createOrder(jsonRequest("/api/orders", { body: orderBody([{ itemType: "package", slug: pkgSlug, quantity: 1 }]) }));
  assert.equal(res.status, 401);
});

test("POST tính giá từ DB, bỏ giá gửi lên", async () => {
  const res = await createOrder(
    jsonRequest("/api/orders", {
      cookie: cookieA,
      body: orderBody([
        { itemType: "package", slug: pkgSlug, quantity: 2, unitPrice: 1 },
        { itemType: "specialty", slug: spSlug, quantity: 1 },
      ]),
    }),
  );
  const { data } = await readJson(res);
  assert.equal(res.status, 201);
  assert.equal(data.subtotal, 200000);
  assert.equal(data.total, 200000 + data.packingFee);
  assert.equal(data.hasUnpricedItems, true);
  assert.match(data.code, /^SLF-\d{8}-\d{4}$/);
  const pkgItem = data.items.find((item: any) => item.slug === pkgSlug);
  assert.equal(pkgItem.name, "Gói Test");
  assert.equal(pkgItem.unitPrice, 100000);
});

test("POST với sản phẩm ẩn hoặc không tồn tại → 400", async () => {
  for (const slug of [closedSlug, "khong-ton-tai-xyz"]) {
    const res = await createOrder(jsonRequest("/api/orders", { cookie: cookieA, body: orderBody([{ itemType: "package", slug, quantity: 1 }]) }));
    const data = await readJson(res);
    assert.equal(res.status, 400);
    assert.ok(data.error.includes(slug) || data.error.includes("Gói Đóng"), data.error);
  }
});

test("hai đơn song song có mã khác nhau", async () => {
  const body = orderBody([{ itemType: "package", slug: pkgSlug, quantity: 1 }]);
  const [r1, r2] = await Promise.all([
    createOrder(jsonRequest("/api/orders", { cookie: cookieA, body })),
    createOrder(jsonRequest("/api/orders", { cookie: cookieA, body })),
  ]);
  assert.equal(r1.status, 201);
  assert.equal(r2.status, 201);
  const [d1, d2] = [await readJson(r1), await readJson(r2)];
  assert.notEqual(d1.data.code, d2.data.code);
});

test("GET /api/orders chỉ trả đơn của khách, mới nhất trước", async () => {
  const resA = await listOrders(jsonRequest("/api/orders", { cookie: cookieA }));
  const { data } = await readJson(resA);
  assert.equal(resA.status, 200);
  assert.ok(data.length >= 3);
  const times = data.map((order: any) => new Date(order.createdAt).getTime());
  assert.deepEqual(times, [...times].sort((a, b) => b - a));
  assert.ok(Array.isArray(data[0].items));

  const resB = await listOrders(jsonRequest("/api/orders", { cookie: cookieB }));
  assert.equal((await readJson(resB)).data.length, 0);
});

test("PATCH: khách khác 404, sửa khi pending, huỷ cần lý do, huỷ rồi 409", async () => {
  const created = await createOrder(jsonRequest("/api/orders", { cookie: cookieA, body: orderBody([{ itemType: "package", slug: pkgSlug, quantity: 1 }]) }));
  const { code } = (await readJson(created)).data;

  assert.equal((await patch(code, { address: "Của B" }, cookieB)).status, 404);

  const edited = await patch(code, { address: "Mới" }, cookieA);
  assert.equal(edited.status, 200);
  assert.equal((await readJson(edited)).data.address, "Mới");

  assert.equal((await patch(code, { action: "cancel" }, cookieA)).status, 400);

  const cancelled = await patch(code, { action: "cancel", reason: "Đặt nhầm" }, cookieA);
  const data = (await readJson(cancelled)).data;
  assert.equal(cancelled.status, 200);
  assert.equal(data.status, "cancelled");
  assert.equal(data.cancelledBy, "customer");

  assert.equal((await patch(code, { address: "Lần nữa" }, cookieA)).status, 409);
});

test("GET /api/public/order-settings trả phí đóng gói", async () => {
  const setting = await prisma.siteSetting.findUnique({ where: { settingKey: "order_packing_fee" } });
  const expected = setting && Number.isFinite(Number(setting.settingValue)) ? Number(setting.settingValue) : 30000;
  const res = await getOrderSettings();
  assert.equal(res.status, 200);
  assert.deepEqual((await readJson(res)).data, { packingFee: expected });
});
