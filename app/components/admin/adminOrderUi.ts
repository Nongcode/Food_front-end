// Dùng chung cho trang admin Đơn hàng / Yêu cầu tư vấn
import type { InquiryStatus, OrderStatus } from "@/lib/orderStatus";

export async function adminApi<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: init.method || "GET",
      headers: init.body !== undefined ? { "content-type": "application/json" } : undefined,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new Error("Không kết nối được máy chủ.");
  }
  const result = (await response.json().catch(() => ({}))) as { success?: boolean; data?: T; error?: string };
  if (!response.ok || !result.success) throw new Error(result.error || "Chưa thể xử lý yêu cầu.");
  return result.data as T;
}

export const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-sky-50 text-sky-700 border-sky-200",
  shipping: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

export const INQUIRY_STATUS_CLASS: Record<InquiryStatus, string> = {
  new: "bg-amber-50 text-amber-700 border-amber-200",
  contacted: "bg-sky-50 text-sky-700 border-sky-200",
  closed: "bg-slate-100 text-slate-600 border-slate-200",
};

export function formatVnd(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

export const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" });

export type AdminOrderItem = {
  id: number;
  itemType: string;
  slug: string;
  name: string;
  image: string | null;
  unitPrice: number | null;
  unit: string | null;
  quantity: number;
};

export type AdminOrder = {
  id: number;
  code: string;
  status: OrderStatus;
  receiverName: string;
  phone: string;
  email: string;
  address: string;
  note: string | null;
  subtotal: number;
  packingFee: number;
  total: number;
  hasUnpricedItems: boolean;
  cancelReason: string | null;
  cancelledBy: string | null;
  cancelledAt: string | null;
  adminNote: string | null;
  createdAt: string;
  items: AdminOrderItem[];
  customer?: { id: number; name: string; email: string; phone: string };
};

export type AdminInquiry = {
  id: number;
  requestType: string;
  products: string | null;
  quantity: string | null;
  budget: string | null;
  occasion: string | null;
  deliveryArea: string | null;
  notes: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  status: InquiryStatus;
  adminNote: string | null;
  createdAt: string;
  customer: { id: number; name: string; email: string; phone: string };
};
