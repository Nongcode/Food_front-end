/** Ảnh thay thế khi ảnh sản phẩm/bài viết trống hoặc tải lỗi. */
export const FALLBACK_IMAGE = "/sonla-logo-readable.png";

/**
 * Giá trị `background-image` có lớp dự phòng: CSS vẽ nhiều lớp nền chồng lên nhau,
 * nếu ảnh chính tải lỗi thì lớp đó trong suốt và ảnh dự phòng bên dưới hiện ra.
 */
export function backgroundWithFallback(url?: string | null) {
  const safe = (value: string) => `url("${value.replace(/["\\\r\n]/g, "")}")`;
  return url && url.trim() ? `${safe(url.trim())}, ${safe(FALLBACK_IMAGE)}` : safe(FALLBACK_IMAGE);
}
