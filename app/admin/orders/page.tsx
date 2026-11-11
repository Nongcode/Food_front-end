"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/AdminContext";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/orderStatus";
import { adminApi, dateTimeFormatter, formatVnd, ORDER_STATUS_CLASS, type AdminOrder } from "../../components/admin/adminOrderUi";

type OrderPage = { items: AdminOrder[]; total: number; page: number; pageSize: number };

function readInitialStatus(): OrderStatus | "" {
  if (typeof window === "undefined") return "";
  const value = new URLSearchParams(window.location.search).get("status") || "";
  return (ORDER_STATUSES as readonly string[]).includes(value) ? (value as OrderStatus) : "";
}

export default function AdminOrdersPage() {
  const { isAuthenticated } = useAdmin();
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus | "">(readInitialStatus);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<{ key: string; data: OrderPage | null; error: string } | null>(null);

  const requestKey = `${status}|${query}|${page}`;

  useEffect(() => {
    if (!isAuthenticated) router.push("/admin/login");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set("status", status);
    if (query) params.set("q", query);
    adminApi<OrderPage>(`/api/admin/orders?${params}`)
      .then((data) => {
        if (active) setResult({ key: requestKey, data, error: "" });
      })
      .catch((error: Error) => {
        if (active) setResult({ key: requestKey, data: null, error: error.message });
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, status, query, page, requestKey]);

  if (!isAuthenticated) return null;

  const loading = result?.key !== requestKey;
  const data = result?.data;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  function chooseStatus(next: OrderStatus | "") {
    setStatus(next);
    setPage(1);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(searchInput.trim());
    setPage(1);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <section>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Đơn hàng</h2>
        <p className="text-xs text-slate-500 mt-1">Đơn khách gửi từ giỏ hàng. Mở chi tiết để xác nhận, chuyển giao hoặc huỷ.</p>
      </section>

      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Lọc theo trạng thái">
          {(["", ...ORDER_STATUSES] as const).map((value) => (
            <button
              key={value || "all"}
              type="button"
              role="tab"
              aria-selected={status === value}
              onClick={() => chooseStatus(value)}
              className={
                "px-3 py-1.5 rounded-full text-xs font-bold border transition-colors " +
                (status === value ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300")
              }
            >
              {value ? ORDER_STATUS_LABELS[value] : "Tất cả"}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Tìm theo mã đơn, tên người nhận, số điện thoại"
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400"
          />
          <button type="submit" className="px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-bold">Tìm</button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        {result?.error && !loading ? <p className="p-6 text-sm text-rose-600">{result.error}</p> : null}
        {loading ? <p className="p-6 text-sm text-slate-400">Đang tải...</p> : null}
        {!loading && data && data.items.length === 0 ? <p className="p-6 text-sm text-slate-500">Không có đơn nào.</p> : null}
        {!loading && data && data.items.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Người nhận</th>
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3 text-right">Tổng</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ngày đặt</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((order) => (
                <tr key={order.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-mono font-bold">
                    <Link href={`/admin/orders/${order.id}`} className="text-emerald-700 hover:underline">{order.code}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{order.receiverName}</div>
                    <div className="text-xs text-slate-500">{order.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-800">
                    {formatVnd(order.total)}
                    {order.hasUnpricedItems ? <div className="text-[11px] font-normal text-amber-600">+ món giá liên hệ</div> : null}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full border text-xs font-bold ${ORDER_STATUS_CLASS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{dateTimeFormatter.format(new Date(order.createdAt))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>

      {data && totalPages > 1 ? (
        <div className="flex items-center justify-end gap-2 text-sm">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40">Trước</button>
          <span className="text-slate-500">Trang {page}/{totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40">Sau</button>
        </div>
      ) : null}
    </div>
  );
}
