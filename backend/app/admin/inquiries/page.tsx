"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/AdminContext";
import { INQUIRY_STATUSES, INQUIRY_STATUS_LABELS, type InquiryStatus } from "@/lib/orderStatus";
import { adminApi, dateTimeFormatter, INQUIRY_STATUS_CLASS, type AdminInquiry } from "../../components/admin/adminOrderUi";

const DETAIL_FIELDS: Array<[keyof AdminInquiry, string]> = [
  ["products", "Sản phẩm"],
  ["quantity", "Số lượng"],
  ["budget", "Ngân sách"],
  ["occasion", "Dịp"],
  ["deliveryArea", "Khu vực nhận"],
  ["notes", "Chi tiết"],
];

export default function AdminInquiriesPage() {
  const { isAuthenticated } = useAdmin();
  const router = useRouter();
  const [status, setStatus] = useState<InquiryStatus | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{ key: string; items: AdminInquiry[]; error: string } | null>(null);
  const [rowError, setRowError] = useState<{ id: number; message: string } | null>(null);

  const requestKey = `${status}|${query}`;

  useEffect(() => {
    if (!isAuthenticated) router.push("/admin/login");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (query) params.set("q", query);
    adminApi<AdminInquiry[]>(`/api/admin/inquiries?${params}`)
      .then((items) => {
        if (active) setResult({ key: requestKey, items, error: "" });
      })
      .catch((error: Error) => {
        if (active) setResult({ key: requestKey, items: [], error: error.message });
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, status, query, requestKey]);

  if (!isAuthenticated) return null;

  const loading = result?.key !== requestKey;

  function replaceItem(updated: AdminInquiry) {
    setResult((current) =>
      current ? { ...current, items: current.items.map((item) => (item.id === updated.id ? updated : item)) } : current,
    );
  }

  async function patchInquiry(id: number, body: Record<string, unknown>) {
    setRowError(null);
    try {
      replaceItem(await adminApi<AdminInquiry>(`/api/admin/inquiries/${id}`, { method: "PATCH", body }));
    } catch (error) {
      setRowError({ id, message: error instanceof Error ? error.message : "Chưa cập nhật được." });
    }
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(searchInput.trim());
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <section>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Yêu cầu tư vấn</h2>
        <p className="text-xs text-slate-500 mt-1">Yêu cầu từ form liên hệ: đặt số lượng lớn, set quà riêng, báo giá theo ngân sách.</p>
      </section>

      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Lọc theo trạng thái">
          {(["", ...INQUIRY_STATUSES] as const).map((value) => (
            <button
              key={value || "all"}
              type="button"
              role="tab"
              aria-selected={status === value}
              onClick={() => setStatus(value)}
              className={
                "px-3 py-1.5 rounded-full text-xs font-bold border transition-colors " +
                (status === value ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300")
              }
            >
              {value ? INQUIRY_STATUS_LABELS[value] : "Tất cả"}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Tìm theo tên, số điện thoại, nhu cầu"
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400"
          />
          <button type="submit" className="px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-bold">Tìm</button>
        </form>
      </div>

      {result?.error && !loading ? <p className="text-sm text-rose-600">{result.error}</p> : null}
      {loading ? <p className="text-sm text-slate-400">Đang tải...</p> : null}
      {!loading && result && result.items.length === 0 && !result.error ? <p className="text-sm text-slate-500">Không có yêu cầu nào.</p> : null}

      <div className="space-y-3">
        {!loading && result?.items.map((inquiry) => (
          <article key={inquiry.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-slate-800">{inquiry.requestType}</h3>
                <p className="text-sm text-slate-600">
                  {inquiry.contactName} · {inquiry.contactPhone}
                  {inquiry.contactEmail ? ` · ${inquiry.contactEmail}` : ""}
                </p>
                <p className="text-xs text-slate-400">{dateTimeFormatter.format(new Date(inquiry.createdAt))} · tài khoản {inquiry.customer.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full border text-xs font-bold ${INQUIRY_STATUS_CLASS[inquiry.status]}`}>
                  {INQUIRY_STATUS_LABELS[inquiry.status] || inquiry.status}
                </span>
                <select
                  aria-label={`Đổi trạng thái yêu cầu ${inquiry.id}`}
                  value={inquiry.status}
                  onChange={(event) => patchInquiry(inquiry.id, { status: event.target.value })}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs"
                >
                  {INQUIRY_STATUSES.map((value) => <option key={value} value={value}>{INQUIRY_STATUS_LABELS[value]}</option>)}
                </select>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
              {DETAIL_FIELDS.filter(([field]) => inquiry[field]).map(([field, label]) => (
                <div key={field} className="flex gap-2">
                  <dt className="text-slate-400 shrink-0">{label}:</dt>
                  <dd className="text-slate-700 whitespace-pre-line">{String(inquiry[field])}</dd>
                </div>
              ))}
            </dl>

            <form
              key={inquiry.adminNote ?? ""}
              onSubmit={(event) => {
                event.preventDefault();
                patchInquiry(inquiry.id, { adminNote: String(new FormData(event.currentTarget).get("adminNote") || "") });
              }}
              className="flex gap-2"
            >
              <input
                name="adminNote"
                defaultValue={inquiry.adminNote || ""}
                placeholder="Ghi chú nội bộ"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
              <button type="submit" className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold">Lưu</button>
            </form>
            {rowError?.id === inquiry.id ? <p className="text-sm text-rose-600" role="alert">{rowError.message}</p> : null}
          </article>
        ))}
      </div>
    </div>
  );
}
