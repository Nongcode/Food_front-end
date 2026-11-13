"use client";

import { useEffect, useState } from "react";

// Phiên khách hàng: cookie httpOnly customer_token do BE đặt; FE chỉ gọi /api/auth/*
export type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  birthday: string | null;
};

export const AUTH_UPDATED_EVENT = "sonla-auth-updated";

const LEGACY_DEMO_KEYS = ["sonla-food-users-v1", "sonla-food-session-v1", "sonla-food-order-history-v1"];

// undefined = chưa hỏi BE; null = chưa đăng nhập
let cachedCustomer: Customer | null | undefined;
let pendingRequest: Promise<Customer | null> | null = null;

type ApiResult<T> = { success: boolean; data?: T; error?: string };

async function callAuthApi<T>(path: string, init: { method: string; body?: unknown }): Promise<T> {
  const response = await fetch(path, {
    method: init.method,
    headers: init.body !== undefined ? { "content-type": "application/json" } : undefined,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    credentials: "same-origin",
  });
  const result = (await response.json().catch(() => ({}))) as ApiResult<T>;
  if (!response.ok || !result.success) throw new Error(result.error || "Chưa thể xử lý yêu cầu. Vui lòng thử lại.");
  return result.data as T;
}

function setCustomer(customer: Customer | null) {
  cachedCustomer = customer;
  window.dispatchEvent(new CustomEvent(AUTH_UPDATED_EVENT, { detail: { customer } }));
}

export function fetchCurrentCustomer(force = false): Promise<Customer | null> {
  if (!force && cachedCustomer !== undefined) return Promise.resolve(cachedCustomer);
  if (!pendingRequest) {
    pendingRequest = fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => {
        const result = (await response.json().catch(() => ({}))) as ApiResult<Customer>;
        return response.ok && result.success && result.data ? result.data : null;
      })
      .catch(() => null)
      .then((customer) => {
        cachedCustomer = customer;
        return customer;
      })
      .finally(() => {
        pendingRequest = null;
      });
  }
  return pendingRequest;
}

export function useCurrentCustomer(): { customer: Customer | null; loading: boolean } {
  const [state, setState] = useState<{ customer: Customer | null; loading: boolean }>({
    customer: cachedCustomer ?? null,
    loading: cachedCustomer === undefined,
  });

  useEffect(() => {
    let active = true;
    fetchCurrentCustomer().then((customer) => {
      if (active) setState({ customer, loading: false });
    });
    const handleUpdated = (event: Event) => {
      const customer = (event as CustomEvent<{ customer: Customer | null }>).detail?.customer ?? null;
      setState({ customer, loading: false });
    };
    window.addEventListener(AUTH_UPDATED_EVENT, handleUpdated);
    return () => {
      active = false;
      window.removeEventListener(AUTH_UPDATED_EVENT, handleUpdated);
    };
  }, []);

  return state;
}

export async function loginCustomer(input: { email: string; password: string }): Promise<Customer> {
  const customer = await callAuthApi<Customer>("/api/auth/login", { method: "POST", body: input });
  setCustomer(customer);
  return customer;
}

export async function registerCustomer(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  birthday?: string;
}): Promise<Customer> {
  const customer = await callAuthApi<Customer>("/api/auth/register", { method: "POST", body: input });
  setCustomer(customer);
  return customer;
}

export async function logoutCustomer(): Promise<void> {
  await callAuthApi<null>("/api/auth/logout", { method: "POST" });
  setCustomer(null);
}

export async function updateCustomerProfile(input: {
  name?: string;
  phone?: string;
  address?: string;
  birthday?: string;
}): Promise<Customer> {
  const customer = await callAuthApi<Customer>("/api/auth/me", { method: "PATCH", body: input });
  setCustomer(customer);
  return customer;
}

// Đã đăng xuất ở nơi khác (API trả 401) → cập nhật trạng thái mà không gọi lại BE
export function markCustomerSignedOut() {
  setCustomer(null);
}

// Chỉ nhận đường dẫn nội bộ: bắt đầu "/" nhưng không phải "//" hay "/\"
export function safeNextPath(raw: string | null, fallback: string): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  return raw;
}

export function clearLegacyDemoStorage() {
  try {
    for (const key of LEGACY_DEMO_KEYS) window.localStorage.removeItem(key);
  } catch {
    // localStorage bị chặn: không có gì để dọn
  }
}
