import type { SyntheticEvent } from "react";

/** Ảnh hiển thị thay khi ảnh trong danh sách admin bị lỗi (URL hỏng, 404...). */
export const ADMIN_IMAGE_FALLBACK = "/sonla-logo-readable.png";

type FallbackTarget = {
  src: string;
  dataset: Record<string, string | undefined>;
  style: Record<string, string> | CSSStyleDeclaration;
};

/** Đổi ảnh lỗi sang logo dự phòng; chỉ đổi một lần để tránh vòng lặp khi logo cũng lỗi. */
export function applyAdminImageFallback(img: FallbackTarget) {
  if (img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = "1";
  img.src = ADMIN_IMAGE_FALLBACK;
  const style = img.style as Record<string, string>;
  style.display = "";
  style.objectFit = "contain";
  style.padding = "4px";
}

export function handleAdminImageError(event: SyntheticEvent<HTMLImageElement>) {
  applyAdminImageFallback(event.currentTarget);
}
