"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAdmin } from "../../../components/admin/AdminContext";
import { NEXT_ORDER_STATUS, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/orderStatus";
import { adminApi, dateTimeFormatter, formatVnd, ORDER_STATUS_CLASS, type AdminOrder } from "../../../components/admin/adminOrderUi";
import { ADMIN_BREADCRUMB_LABEL_EVENT } from "../../../components/admin/adminBreadcrumb";

const ACTION_LABELS: Record<OrderStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Xác nhận đơn",
  shipping: "Chuyển sang Đang giao",
  delivered: "Đánh dấu Đã giao",
  cancelled: "Huỷ đơn",
};

export default function AdminOrderDetailPage() {
  const { isAuthenticated } = useAdmin();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [noteMessage, setNoteMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) router.push("/admin/login");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    adminApi<AdminOrder>(`/api/admin/orders/${id}`)
      .then((data) => {
        if (active) setOrder(data);
      })
      .catch((error: Error) => {
        if (active) setLoadError(error.message);
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, id]);

  const orderCode = order?.code;
  useEffect(() => {
    if (!orderCode) return;
    // Breadcrumb trên topbar hiện mã đơn (SLF-...) thay vì id
    window.dispatchEvent(new CustomEvent(ADMIN_BREADCRUMB_LABEL_EVENT, { detail: { path: `/admin/orders/${id}`, label: orderCode } }));
    return () => {
      window.dispatchEvent(new CustomEvent(ADMIN_BREADCRUMB_LABEL_EVENT, { detail: null }));
    };
  }, [orderCode, id]);

  if (!isAuthenticated) return null;

  async function patchOrder(body: Record<string, unknown>) {
    setSaving(true);
    setActionError("");
    try {
      const updated = await adminApi<AdminOrder>(`/api/admin/orders/${id}`, { method: "PATCH", body });
      setOrder(updated);
      return true;
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Chưa cập nhật được đơn.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reason = String(new FormData(event.currentTarget).get("cancelReason") || "").trim();
    if (!reason) {
      setActionError("Vui lòng nhập lý do huỷ đơn.");
      return;
    }
    if (await patchOrder({ status: "cancelled", cancelReason: reason })) setCancelOpen(false);
  }

  async function handleSaveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const adminNote = String(new FormData(event.currentTarget).get("adminNote") || "");
    if (await patchOrder({ adminNote })) {
      setNoteMessage("Đã lưu ghi chú.");
      window.setTimeout(() => setNoteMessage(""), 2000);
    }
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <Link href="/admin/orders" className="text-sm text-emerald-700 hover:underline">← Danh sách đơn</Link>
        <p className="text-sm text-rose-600">{loadError}</p>
      </div>
    );
  }

  if (!order) return <p className="text-sm text-slate-400">Đang tải...</p>;

  const nextStatuses = NEXT_ORDER_STATUS[order.status] || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Link href="/admin/orders" className="text-sm text-emerald-700 hover:underline">← Danh sách đơn</Link>

      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight font-mono">{order.code}</h2>
          <p className="text-xs text-slate-500 mt-1">Đặt lúc {dateTimeFormatter.format(new Date(order.createdAt))}</p>
        </div>
        <span className={`self-start px-3 py-1.5 rounded-full border text-sm font-bold ${ORDER_STATUS_CLASS[order.status]}`}>
          {ORDER_STATUS_LABELS[order.status] || order.status}
        </span>
      </section>

      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Xử lý đơn</h3>
        {nextStatuses.length === 0 ? <p className="text-sm text-slate-500">Đơn đã kết thúc, không còn thao tác.</p> : null}
        <div className="flex flex-wrap gap-2">
          {nextStatuses.filter((next) => next !== "cancelled").map((next) => (
            <button
              key={next}
              type="button"
              disabled={saving}
              onClick={() => patchOrder({ status: next })}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold disabled:opacity-50"
            >
              {ACTION_LABELS[next]}
            </button>
          ))}
          {nextStatuses.includes("cancelled") && !cancelOpen ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => setCancelOpen(true)}
              className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-bold disabled:opacity-50"
            >
              {ACTION_LABELS.cancelled}
            </button>
          ) : null}
        </div>
        {cancelOpen ? (
          <form onSubmit={handleCancel} className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500">
              Lý do huỷ *
              <textarea name="cancelReason" rows={3} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm normal-case tracking-normal font-normal" />
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setCancelOpen(false); setActionError(""); }} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold">Giữ đơn</button>
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-bold disabled:opacity-50">Xác nhận huỷ</button>
            </div>
          </form>
        ) : null}
        {actionError ? <p className="text-sm text-rose-600" role="alert">{actionError}</p> : null}
        {order.cancelReason ? (
          <p className="text-sm text-rose-700">
            Lý do huỷ ({order.cancelledBy === "admin" ? "admin" : "khách"}): {order.cancelReason}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-2 text-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Người nhận</h3>
          <p><strong>{order.receiverName}</strong> · {order.phone}</p>
          {order.email ? <p>{order.email}</p> : null}
          <p>{order.address}</p>
          {order.note ? <p className="text-slate-600">Ghi chú khách: {order.note}</p> : null}
          {order.customer ? (
            <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
              Tài khoản: {order.customer.name} ({order.customer.email})
            </p>
          ) : null}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-2 text-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Sản phẩm</h3>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-3">
              <span>{item.name} <span className="text-slate-400">x{item.quantity}</span></span>
              <span className="font-semibold">{item.unitPrice !== null ? formatVnd(item.unitPrice * item.quantity) : "Giá liên hệ"}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 border-t border-slate-100 text-slate-600"><span>Tạm tính</span><span>{formatVnd(order.subtotal)}</span></div>
          <div className="flex justify-between text-slate-600"><span>Phí đóng gói</span><span>{formatVnd(order.packingFee)}</span></div>
          <div className="flex justify-between font-black text-slate-800">
            <span>Tổng</span>
            <span>{formatVnd(order.total)}{order.hasUnpricedItems ? " + món giá liên hệ" : ""}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveNote} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-2" key={order.adminNote ?? ""}>
        <label className="block text-xs font-black uppercase tracking-widest text-slate-500">
          Ghi chú nội bộ
          <textarea name="adminNote" rows={3} defaultValue={order.adminNote || ""} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm normal-case tracking-normal font-normal" />
        </label>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-bold disabled:opacity-50">Lưu ghi chú</button>
          {noteMessage ? <span className="text-sm text-emerald-700">{noteMessage}</span> : null}
        </div>
      </form>
    </div>
  );
}
