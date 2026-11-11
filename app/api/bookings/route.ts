import { NextResponse } from "next/server";

// Đặt combo kiểu cũ đã chuyển sang /api/orders (giỏ hàng) và /api/inquiries (tư vấn).
// Trả 410 để trang cũ còn mở trong trình duyệt báo khách tải lại.
function gone() {
  return NextResponse.json(
    { success: false, error: "Chức năng này đã thay đổi. Vui lòng tải lại trang." },
    { status: 410 }
  );
}

export const GET = gone;
export const POST = gone;
export const PUT = gone;
export const PATCH = gone;
export const DELETE = gone;
