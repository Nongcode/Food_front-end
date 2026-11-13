import { test } from "node:test";
import assert from "node:assert/strict";
import { buildAdminBreadcrumb } from "../../app/components/admin/adminBreadcrumb";

// CR-003 / T-003.4: breadcrumb trang chi tiết đơn hiện mã đơn thay vì id
test("breadcrumb thường giữ nhãn tiếng Việt như cũ", () => {
  assert.deepEqual(buildAdminBreadcrumb("/admin/orders"), ["Sơn La Food", "Đơn hàng"]);
  assert.deepEqual(buildAdminBreadcrumb("/admin/packages/categories"), ["Sơn La Food", "Combo đặc sản", "Danh mục"]);
});

test("chi tiết đơn: thay id bằng mã đơn khi có nhãn ghi đè cho đúng đường dẫn", () => {
  assert.deepEqual(
    buildAdminBreadcrumb("/admin/orders/114", { path: "/admin/orders/114", label: "SLF-20261111-0004" }),
    ["Sơn La Food", "Đơn hàng", "SLF-20261111-0004"],
  );
});

test("nhãn ghi đè của trang khác bị bỏ qua; id số khi chưa tải xong hiện '#id'", () => {
  assert.deepEqual(
    buildAdminBreadcrumb("/admin/orders/115", { path: "/admin/orders/114", label: "SLF-20261111-0004" }),
    ["Sơn La Food", "Đơn hàng", "#115"],
  );
});
