import { test } from "node:test";
import assert from "node:assert/strict";
import { ADMIN_IMAGE_FALLBACK, applyAdminImageFallback } from "../../app/components/admin/adminImageFallback";

// CR-003 / T-003.3: ảnh lỗi trong danh sách admin đổi sang logo, không lặp vô hạn
function fakeImg(src: string) {
  return { src, dataset: {} as Record<string, string | undefined>, style: {} as Record<string, string> };
}

test("ảnh lỗi được đổi sang logo dự phòng và hiện lại", () => {
  const img = fakeImg("https://example.com/broken.jpg");
  img.style.display = "none";
  applyAdminImageFallback(img);
  assert.equal(img.src, ADMIN_IMAGE_FALLBACK);
  assert.equal(img.dataset.fallbackApplied, "1");
  assert.equal(img.style.objectFit, "contain");
  assert.equal(img.style.display, "");
});

test("logo dự phòng cũng lỗi thì không đổi src nữa (tránh vòng lặp onError)", () => {
  const img = fakeImg("https://example.com/broken.jpg");
  applyAdminImageFallback(img);
  img.src = "http://localhost:3001" + ADMIN_IMAGE_FALLBACK;
  applyAdminImageFallback(img);
  assert.equal(img.src, "http://localhost:3001" + ADMIN_IMAGE_FALLBACK);
});
