import test from "node:test";
import assert from "node:assert/strict";
import { parsePriceText, parsePriceValue } from "../../lib/price";

const cases: [string | null, ReturnType<typeof parsePriceText>][] = [
  ["Từ 650.000đ/kg", { price: 650000, unit: "kg" }],
  ["45.000đ - 60.000đ/chục", { price: 45000, unit: "chục" }],
  ["Từ 1.250.000đ", { price: 1250000, unit: null }],
  ["350,000 VND / hộp", { price: 350000, unit: "hộp" }],
  ["Liên hệ", null],
  ["", null],
  [null, null],
  ["50k", null],
  ["Giá 500đ", null],
];

for (const [input, expected] of cases) {
  test(`parse ${input}`, () => assert.deepEqual(parsePriceText(input), expected));
}

test("parsePriceValue nhận số nguyên ≥ 0, rỗng → null, bỏ qua khi không gửi", () => {
  assert.equal(parsePriceValue(undefined), undefined);
  assert.equal(parsePriceValue(null), null);
  assert.equal(parsePriceValue(""), null);
  assert.equal(parsePriceValue(123000), 123000);
  assert.equal(parsePriceValue("45000"), 45000);
  for (const bad of [-1, 1.5, "abc", "12a", {}]) assert.ok(Number.isNaN(parsePriceValue(bad)), String(bad));
});
