import { NextResponse } from "next/server";
import { clearCustomerCookie } from "@/lib/customerAuth";

export async function POST() {
  const res = NextResponse.json({ success: true, data: null });
  clearCustomerCookie(res);
  return res;
}
