import { NextResponse } from "next/server";
import { getPackingFee } from "@/lib/orders";

export async function GET() {
  return NextResponse.json({ success: true, data: { packingFee: await getPackingFee() } });
}
