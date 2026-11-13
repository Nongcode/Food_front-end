// Đọc giá tham khảo dạng số từ chuỗi hiển thị, ví dụ "Từ 650.000đ/kg" → { price: 650000, unit: "kg" }.
// Chỉ trả kết quả khi đọc được chắc chắn; còn lại trả null để admin nhập tay.
export function parsePriceText(text: string | null | undefined): { price: number; unit: string | null } | null {
  if (!text) return null;
  const match = text.match(/(\d{1,3}(?:[.,]\d{3})+|\d{4,})/);
  if (!match) return null;
  const price = Number(match[1].replace(/[.,]/g, ""));
  if (!Number.isFinite(price) || price < 1000) return null;
  const slashIndex = text.lastIndexOf("/");
  const unit = slashIndex >= 0 ? text.slice(slashIndex + 1).trim() : "";
  return { price, unit: unit || null };
}

// Giá admin gửi lên: không gửi → undefined (giữ nguyên), rỗng/null → null, số nguyên ≥ 0 → số; sai → NaN
export function parsePriceValue(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const text = typeof value === "number" ? String(value) : typeof value === "string" ? value.trim() : "";
  return /^\d+$/.test(text) ? Number(text) : NaN;
}
