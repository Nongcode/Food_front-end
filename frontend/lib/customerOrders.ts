import type { InquiryStatus, OrderStatus } from "./orderStatus";

// Kiểu dữ liệu khớp JSON BE trả về (/api/orders, /api/inquiries)
export type CustomerOrderItem = {
  id: number;
  itemType: "package" | "specialty";
  slug: string;
  name: string;
  image: string | null;
  unitPrice: number | null;
  unit: string | null;
  quantity: number;
};

export type CustomerOrder = {
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
  createdAt: string;
  items: CustomerOrderItem[];
};

export type CustomerInquiry = {
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
  createdAt: string;
};

export type OrderInput = {
  items: { itemType: "package" | "specialty"; slug: string; quantity: number }[];
  receiverName: string;
  phone: string;
  email?: string;
  address: string;
  note?: string;
};

export type InquiryInput = {
  requestType: string;
  products?: string;
  quantity?: string;
  budget?: string;
  occasion?: string;
  deliveryArea?: string;
  notes?: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
};

export const DEFAULT_PACKING_FEE = 30000;

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function callApi<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: init.method || "GET",
      headers: init.body !== undefined ? { "content-type": "application/json" } : undefined,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Không kết nối được máy chủ. Vui lòng thử lại.", 0);
  }
  const result = (await response.json().catch(() => ({}))) as { success?: boolean; data?: T; error?: string };
  if (!response.ok || !result.success) {
    throw new ApiError(result.error || "Chưa thể xử lý yêu cầu. Vui lòng thử lại.", response.status);
  }
  return result.data as T;
}

export function fetchMyOrders(): Promise<CustomerOrder[]> {
  return callApi<CustomerOrder[]>("/api/orders");
}

export function submitOrder(input: OrderInput): Promise<CustomerOrder> {
  return callApi<CustomerOrder>("/api/orders", { method: "POST", body: input });
}

export function cancelMyOrder(code: string, reason: string): Promise<CustomerOrder> {
  return callApi<CustomerOrder>(`/api/orders/${encodeURIComponent(code)}`, { method: "PATCH", body: { action: "cancel", reason } });
}

export function fetchMyInquiries(): Promise<CustomerInquiry[]> {
  return callApi<CustomerInquiry[]>("/api/inquiries");
}

export function submitInquiry(input: InquiryInput): Promise<CustomerInquiry> {
  return callApi<CustomerInquiry>("/api/inquiries", { method: "POST", body: input });
}

// Giá hiện tại do BE trả (giỏ ở localStorage có thể giữ giá cũ)
export type CartQuote = {
  itemType: "package" | "specialty";
  slug: string;
  name: string | null;
  unitPrice: number | null;
  unit: string | null;
  available: boolean;
};

export function cartQuoteKey(itemType: string, slug: string) {
  return `${itemType}:${slug}`;
}

export function fetchCartPrices(items: { itemType: "package" | "specialty"; slug: string }[]): Promise<CartQuote[]> {
  return callApi<CartQuote[]>("/api/public/cart-prices", { method: "POST", body: { items } });
}

export type ReceiverInput = { receiverName: string; phone: string; email: string; address: string; note: string };

// Sửa thông tin người nhận khi đơn còn "pending"
export function updateMyOrderReceiver(code: string, input: ReceiverInput): Promise<CustomerOrder> {
  return callApi<CustomerOrder>(`/api/orders/${encodeURIComponent(code)}`, { method: "PATCH", body: input });
}

export async function fetchPackingFee(): Promise<number> {
  try {
    const data = await callApi<{ packingFee: number }>("/api/public/order-settings");
    return typeof data.packingFee === "number" ? data.packingFee : DEFAULT_PACKING_FEE;
  } catch {
    return DEFAULT_PACKING_FEE;
  }
}

export function formatVnd(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

// Giá hiển thị trên trang sản phẩm: ưu tiên số giá thật (priceValue/priceUnit) — đây là giá BE dùng khi tính đơn.
// priceText chỉ dùng khi chưa có giá số (vd "Theo mùa").
export function formatProductPrice(priceValue: number | null | undefined, priceUnit: string | null | undefined, priceText: string | null | undefined, contactLabel: string) {
  if (typeof priceValue === "number" && priceValue > 0) return priceUnit ? `${formatVnd(priceValue)}/${priceUnit}` : formatVnd(priceValue);
  return priceText?.trim() || contactLabel;
}
