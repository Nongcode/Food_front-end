import { test } from "node:test";
import assert from "node:assert/strict";
import { OrderInputError, computeTotals, formatOrderCode, isOrderablePackage, mergeOrderItems } from "../../lib/orders";

test("mergeOrderItems gộp cùng loại + slug", () => {
  const items = mergeOrderItems([
    { itemType: "package", slug: "a", quantity: 2 },
    { itemType: "package", slug: "a", quantity: 3 },
    { itemType: "specialty", slug: "a", quantity: 1 },
  ]);
  assert.equal(items.length, 2);
  assert.equal(items.find((item) => item.itemType === "package")?.quantity, 5);
});

test("mergeOrderItems từ chối dữ liệu sai", () => {
  const many = Array.from({ length: 31 }, (_, i) => ({ itemType: "package", slug: `s${i}`, quantity: 1 }));
  const bad: unknown[] = [
    "x",
    [],
    many,
    [{ itemType: "package", slug: "a", quantity: 0 }],
    [{ itemType: "package", slug: "a", quantity: 100 }],
    [{ itemType: "package", slug: "a", quantity: 1.5 }],
    [{ itemType: "package", slug: "a", quantity: 60 }, { itemType: "package", slug: "a", quantity: 40 }],
    [{ itemType: "tour", slug: "a", quantity: 1 }],
  ];
  for (const raw of bad) assert.throws(() => mergeOrderItems(raw), OrderInputError);
});

test("computeTotals bỏ món không giá và miễn phí đóng gói khi rỗng", () => {
  assert.deepEqual(computeTotals([{ unitPrice: 100000, quantity: 2 }, { unitPrice: null, quantity: 1 }], 30000), {
    subtotal: 200000,
    packingFee: 30000,
    total: 230000,
    hasUnpricedItems: true,
  });
  assert.equal(computeTotals([], 30000).packingFee, 0);
});

test("formatOrderCode dùng ngày giờ Việt Nam", () => {
  assert.equal(formatOrderCode(new Date("2026-11-11T18:30:00Z"), 42), "SLF-20261112-0042");
});

test("isOrderablePackage theo trạng thái", () => {
  assert.equal(isOrderablePackage("Đang mở bán"), true);
  assert.equal(isOrderablePackage("Sắp kín chỗ"), true);
  assert.equal(isOrderablePackage("Đã hết chỗ"), false);
  assert.equal(isOrderablePackage("Tạm ngưng"), false);
});
