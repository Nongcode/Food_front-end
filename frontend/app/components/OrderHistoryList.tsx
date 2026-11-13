"use client";

import { useState, type FormEvent } from "react";
import { cancelMyOrder, formatVnd, updateMyOrderReceiver, type CustomerOrder } from "@/lib/customerOrders";
import { ORDER_STATUS_LABELS } from "@/lib/orderStatus";
import { useI18n } from "./I18nProvider";
import { backgroundWithFallback } from "@/lib/imageFallback";

const DATE_LOCALES: Record<string, string> = { vi: "vi-VN", en: "en-GB", "zh-CN": "zh-CN" };

type OrderHistoryListProps = {
  orders: CustomerOrder[];
  // Gọi sau khi khách huỷ đơn hoặc sửa thông tin người nhận
  onChanged: (order: CustomerOrder) => void;
};

export function OrderHistoryList({ orders, onChanged }: OrderHistoryListProps) {
  return (
    <div className="order-history-list">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} onChanged={onChanged} />
      ))}
    </div>
  );
}

type Mode = "view" | "cancel" | "edit";

function OrderCard({ order, onChanged }: { order: CustomerOrder; onChanged: (order: CustomerOrder) => void }) {
  const { locale, t } = useI18n();
  const [mode, setMode] = useState<Mode>("view");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const dateFormatter = new Intl.DateTimeFormat(DATE_LOCALES[locale] || "vi-VN", { dateStyle: "medium", timeStyle: "short" });

  function closeForm() {
    setMode("view");
    setError("");
  }

  async function handleCancel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const reason = String(new FormData(event.currentTarget).get("reason") || "").trim();
    if (!reason) {
      setError(t("orders", "cancel_reason_required", "Vui lòng nhập lý do huỷ đơn."));
      return;
    }
    setBusy(true);
    setError("");
    try {
      onChanged(await cancelMyOrder(order.code, reason));
      setMode("view");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : t("orders", "cancel_failed", "Chưa thể huỷ đơn."));
    } finally {
      setBusy(false);
    }
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const formData = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      onChanged(
        await updateMyOrderReceiver(order.code, {
          receiverName: String(formData.get("receiverName") || "").trim(),
          phone: String(formData.get("phone") || "").trim(),
          email: String(formData.get("email") || "").trim(),
          address: String(formData.get("address") || "").trim(),
          note: String(formData.get("note") || "").trim(),
        }),
      );
      setMode("view");
      setMessage(t("orders", "edit_saved", "Đã cập nhật thông tin nhận hàng."));
      window.setTimeout(() => setMessage(""), 2600);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : t("orders", "edit_failed", "Chưa lưu được thông tin nhận hàng."));
    } finally {
      setBusy(false);
    }
  }

  const statusLabel = order.status in ORDER_STATUS_LABELS
    ? t("orderStatus", order.status, ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS])
    : order.status;
  const contactPrice = t("cart", "price_contact", "Giá liên hệ");

  return (
    <article className="order-history-card">
      <div className="order-history-topline">
        <div>
          <span className="order-code">{order.code}</span>
          <h3>{order.receiverName}</h3>
          <p>{dateFormatter.format(new Date(order.createdAt))}</p>
        </div>
        <div className="order-history-actions">
          <span className={`order-status-pill order-status-${order.status}`}>{statusLabel}</span>
          {order.status === "pending" && mode === "view" ? (
            <>
              <button type="button" className="order-edit-button" onClick={() => { setMode("edit"); setMessage(""); }}>
                {t("orders", "edit", "Sửa thông tin nhận")}
              </button>
              <button type="button" className="order-cancel-button" onClick={() => { setMode("cancel"); setMessage(""); }}>
                {t("orders", "cancel", "Huỷ đơn")}
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className="order-history-products">
        {order.items.map((item) => (
          <div className="order-history-product" key={item.id}>
            <div className="order-history-image" style={{ backgroundImage: backgroundWithFallback(item.image) }} />
            <div>
              <strong>{item.name}</strong>
              <span>
                {item.quantity} x {item.unitPrice !== null ? `${formatVnd(item.unitPrice)}${item.unit ? `/${item.unit}` : ""}` : contactPrice}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="order-history-meta">
        <div><span>{t("orders", "phone", "Số điện thoại")}</span><strong>{order.phone}</strong></div>
        <div><span>{t("orders", "address", "Địa chỉ")}</span><strong>{order.address}</strong></div>
        <div><span>{t("orders", "packing_fee", "Phí đóng gói")}</span><strong>{formatVnd(order.packingFee)}</strong></div>
        <div>
          <span>{t("orders", "total", "Tổng cộng")}</span>
          <strong>{formatVnd(order.total)}{order.hasUnpricedItems ? ` ${t("orders", "plus_contact_items", "+ món giá liên hệ")}` : ""}</strong>
        </div>
      </div>

      {order.note ? <p className="order-history-note">{t("orders", "note_label", "Ghi chú")}: {order.note}</p> : null}
      {order.cancelReason ? <p className="order-history-note order-cancel-reason">{t("orders", "cancel_reason_label", "Lý do huỷ")}: {order.cancelReason}</p> : null}
      {message ? <p className="order-form-success" role="status">{message}</p> : null}

      {mode === "edit" ? (
        <form className="order-cancel-inline order-edit-inline" onSubmit={handleEdit}>
          <div className="order-form-grid">
            <label>
              <span>{t("cart", "field_name", "Họ và tên")} *</span>
              <input name="receiverName" type="text" defaultValue={order.receiverName} required maxLength={120} />
            </label>
            <label>
              <span>{t("cart", "field_phone", "Số điện thoại")} *</span>
              <input name="phone" type="tel" defaultValue={order.phone} required />
            </label>
            <label>
              <span>Email</span>
              <input name="email" type="email" defaultValue={order.email || ""} />
            </label>
            <label>
              <span>{t("cart", "field_address", "Địa chỉ nhận hàng")} *</span>
              <input name="address" type="text" defaultValue={order.address} required maxLength={500} />
            </label>
          </div>
          <label>
            <span>{t("cart", "field_note", "Ghi chú thêm")}</span>
            <textarea name="note" rows={3} maxLength={1000} defaultValue={order.note || ""} />
          </label>
          {error ? <p className="order-form-error" role="alert">{error}</p> : null}
          <div className="order-modal-actions">
            <button type="button" className="order-modal-secondary" onClick={closeForm}>{t("cart", "cancel", "Hủy")}</button>
            <button type="submit" className="order-modal-submit" disabled={busy}>
              {busy ? t("orders", "saving", "Đang lưu...") : t("orders", "save", "Lưu thay đổi")}
            </button>
          </div>
        </form>
      ) : null}

      {mode === "cancel" ? (
        <form className="order-cancel-inline" onSubmit={handleCancel}>
          <label>
            <span>{t("orders", "cancel_reason_field", "Lý do huỷ đơn")} *</span>
            <textarea name="reason" rows={3} maxLength={500} placeholder={t("orders", "cancel_reason_placeholder", "Ví dụ: đặt nhầm số lượng, muốn đổi địa chỉ...")} autoFocus />
          </label>
          {error ? <p className="order-form-error" role="alert">{error}</p> : null}
          <div className="order-modal-actions">
            <button type="button" className="order-modal-secondary" onClick={closeForm}>
              {t("orders", "keep", "Giữ đơn")}
            </button>
            <button type="submit" className="order-modal-submit" disabled={busy}>
              {busy ? t("orders", "cancelling", "Đang huỷ...") : t("orders", "confirm_cancel", "Xác nhận huỷ")}
            </button>
          </div>
        </form>
      ) : null}
    </article>
  );
}
