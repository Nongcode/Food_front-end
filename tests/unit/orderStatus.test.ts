import test from "node:test";
import assert from "node:assert/strict";
import { ORDER_STATUS_LABELS, canTransition, isOrderStatus } from "../../lib/orderStatus";

test("nhãn tiếng Việt", () => {
  assert.equal(ORDER_STATUS_LABELS.pending, "Chờ xác nhận");
  assert.equal(ORDER_STATUS_LABELS.cancelled, "Đã huỷ");
});

test("chuyển trạng thái hợp lệ", () => {
  assert.ok(canTransition("pending", "confirmed"));
  assert.ok(canTransition("shipping", "cancelled"));
  assert.ok(!canTransition("pending", "shipping"));
  assert.ok(!canTransition("delivered", "cancelled"));
  assert.ok(!canTransition("cancelled", "pending"));
});

test("isOrderStatus", () => {
  assert.ok(isOrderStatus("shipping"));
  assert.ok(!isOrderStatus("Đang giao"));
});
