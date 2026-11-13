import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import prisma from "../../lib/prisma";
import { cleanupTestData, jsonRequest, readJson, uniqueSlug } from "../helpers";
import { POST as cartPrices } from "../../app/api/public/cart-prices/route";

const pkgSlug = uniqueSlug("cp-pkg");
const spSlug = uniqueSlug("cp-sp");
const closedSlug = uniqueSlug("cp-closed");

type Quote = { itemType: string; slug: string; name: string | null; unitPrice: number | null; unit: string | null; available: boolean };

before(async () => {
  await prisma.package.create({ data: { slug: pkgSlug, name: "Gói Giá", price: 123000, status: "Đang mở" } });
  await prisma.package.create({ data: { slug: closedSlug, name: "Gói Đóng", price: 50000, status: "Đã đóng" } });
  await prisma.localSpecialty.create({ data: { slug: spSlug, name: "Đặc sản Giá", type: "FOOD", price: 45000, priceUnit: "hũ", status: "Hiển thị" } });
});

after(async () => {
  await cleanupTestData();
});

test("POST /api/public/cart-prices trả giá hiện tại từ DB", async () => {
  const res = await cartPrices(
    jsonRequest("/api/public/cart-prices", {
      body: { items: [{ itemType: "package", slug: pkgSlug }, { itemType: "specialty", slug: spSlug }] },
    }),
  );
  assert.equal(res.status, 200);
  const data: Quote[] = (await readJson(res)).data;
  assert.deepEqual(data, [
    { itemType: "package", slug: pkgSlug, name: "Gói Giá", unitPrice: 123000, unit: null, available: true },
    { itemType: "specialty", slug: spSlug, name: "Đặc sản Giá", unitPrice: 45000, unit: "hũ", available: true },
  ]);
});

test("món đã đóng hoặc không tồn tại → available false, không có giá", async () => {
  const res = await cartPrices(
    jsonRequest("/api/public/cart-prices", {
      body: { items: [{ itemType: "package", slug: closedSlug }, { itemType: "specialty", slug: "khong-ton-tai-xyz" }] },
    }),
  );
  assert.equal(res.status, 200);
  const data: Quote[] = (await readJson(res)).data;
  assert.equal(data.length, 2);
  assert.ok(data.every((item) => item.available === false && item.unitPrice === null));
});

test("dữ liệu sai → 400", async () => {
  for (const body of [{}, { items: "x" }, { items: [{ itemType: "tour", slug: "a" }] }, { items: Array.from({ length: 31 }, (_, i) => ({ itemType: "package", slug: `s${i}` })) }]) {
    const res = await cartPrices(jsonRequest("/api/public/cart-prices", { body }));
    assert.equal(res.status, 400, JSON.stringify(body).slice(0, 60));
  }
});
