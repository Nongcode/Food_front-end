import { NextRequest, NextResponse } from "next/server";
import { fail, readBody } from "@/lib/customerAuth";
import { OrderInputError, quoteCartItems } from "@/lib/orders";

// Giá hiện tại của các món trong giỏ; không cần đăng nhập. Body: { items: [{ itemType, slug }] }
export async function POST(request: NextRequest) {
  try {
    const body = await readBody(request);
    return NextResponse.json({ success: true, data: await quoteCartItems(body.items) });
  } catch (error) {
    if (error instanceof OrderInputError) return fail(error.message, 400);
    console.error("Lỗi lấy giá giỏ hàng:", error);
    return fail("Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.", 500);
  }
}
