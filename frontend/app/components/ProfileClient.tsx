"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { logoutCustomer, updateCustomerProfile, useCurrentCustomer } from "@/lib/customerSession";
import { fetchMyInquiries, fetchMyOrders, type CustomerInquiry, type CustomerOrder } from "@/lib/customerOrders";
import { INQUIRY_STATUS_LABELS } from "@/lib/orderStatus";
import { OrderHistoryList } from "./OrderHistoryList";
import { useI18n } from "./I18nProvider";

type ProfileTab = "profile" | "orders";

const DATE_LOCALES: Record<string, string> = { vi: "vi-VN", en: "en-GB", "zh-CN": "zh-CN" };

function todayIso() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function ProfileClient() {
  const router = useRouter();
  const { href, t, locale } = useI18n();
  const { customer: user, loading } = useCurrentCustomer();
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<CustomerOrder[] | null>(null);
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [ordersError, setOrdersError] = useState("");
  const loggingOutRef = useRef(false);
  const userId = user?.id;
  const dateFormatter = new Intl.DateTimeFormat(DATE_LOCALES[locale] || "vi-VN", { dateStyle: "medium" });

  // Chưa đăng nhập → sang trang đăng nhập, quay lại đây sau khi xong (trừ khi vừa tự đăng xuất)
  useEffect(() => {
    if (!loading && !user && !loggingOutRef.current) router.replace(`${href("/dang-nhap")}?next=${encodeURIComponent(href("/tai-khoan"))}`);
  }, [loading, user, router, href]);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    Promise.all([fetchMyOrders(), fetchMyInquiries()])
      .then(([orderList, inquiryList]) => {
        if (!active) return;
        setOrders(orderList);
        setInquiries(inquiryList);
        setOrdersError("");
      })
      .catch((caughtError) => {
        if (active) setOrdersError(caughtError instanceof Error ? caughtError.message : t("cart", "orders_load_failed", "Chưa tải được đơn hàng."));
      });
    return () => {
      active = false;
    };
  }, [userId, t]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const formData = new FormData(event.currentTarget);
    const birthday = String(formData.get("birthday") || "");
    setError("");
    if (birthday && birthday > todayIso()) {
      setError(t("auth", "error_birthday_future", "Ngày sinh không được ở tương lai."));
      return;
    }
    setSaving(true);
    try {
      await updateCustomerProfile({
        name: String(formData.get("name") || ""),
        phone: String(formData.get("phone") || ""),
        address: String(formData.get("address") || ""),
        birthday,
      });
      setMessage(t("account", "saved", "Đã cập nhật thông tin tài khoản."));
      window.setTimeout(() => setMessage(""), 2600);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : t("account", "save_failed", "Chưa thể lưu thông tin."));
    } finally {
      setSaving(false);
    }
  }

  // Đăng xuất xong về trang chủ (không quay lại trang đăng nhập)
  async function handleLogout() {
    loggingOutRef.current = true;
    await logoutCustomer().catch(() => undefined);
    router.replace(href("/"));
  }

  function handleOrderChanged(updated: CustomerOrder) {
    setOrders((current) => current?.map((order) => (order.id === updated.id ? updated : order)) ?? current);
  }

  if (loading || !user) {
    return <section className="profile-section"><div className="profile-card skeleton" /></section>;
  }

  const initial = user.name.trim().charAt(0).toUpperCase() || "S";
  const ordersLabel = t("cart", "tab_orders", "Đơn hàng của tôi");

  return (
    <section className="profile-section">
      <div className="profile-layout">
        <aside className="profile-sidebar-card">
          <div className="profile-avatar" aria-hidden="true">{initial}</div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <div className="profile-meta-list">
            <span>{t("account", "member", "Khách hàng thành viên")}</span>
            <span>{user.phone || t("account", "no_phone", "Chưa cập nhật SĐT")}</span>
            <span>{user.address || t("account", "no_address", "Chưa có địa chỉ nhận hàng")}</span>
          </div>
          <Link className="profile-history-link" href={href("/gio-hang")}>{t("account", "view_cart", "Xem giỏ hàng")}</Link>
          <button className="profile-logout" type="button" onClick={handleLogout}>{t("account", "logout", "Đăng xuất")}</button>
        </aside>

        <div className="profile-main">
          <div className="cart-tabs" role="tablist" aria-label={t("account", "tabs_label", "Hồ sơ và đơn hàng")}>
            <button type="button" role="tab" aria-selected={activeTab === "profile"} className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>
              {t("account", "tab_profile", "Hồ sơ")}
            </button>
            <button type="button" role="tab" aria-selected={activeTab === "orders"} className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>
              {ordersLabel}
              {orders && orders.length > 0 ? <span>{orders.length}</span> : null}
            </button>
          </div>

          {activeTab === "profile" ? (
            <form className="profile-card" onSubmit={handleSubmit}>
              <div className="profile-card-heading">
                <div>
                  <p className="eyebrow">{t("account", "profile_eyebrow", "Hồ sơ cá nhân")}</p>
                  <h2>{t("account", "profile_title", "Chỉnh thông tin nhận hàng")}</h2>
                </div>
              </div>

              <div className="profile-form-grid">
                <label>
                  <span>{t("cart", "field_name", "Họ và tên")}</span>
                  <input name="name" defaultValue={user.name} placeholder={t("form", "name_placeholder", "Nguyễn Minh Anh")} maxLength={120} />
                </label>
                <label>
                  <span>Email</span>
                  <input value={user.email} disabled />
                </label>
                <label>
                  <span>{t("cart", "field_phone", "Số điện thoại")}</span>
                  <input name="phone" type="tel" defaultValue={user.phone} placeholder="09xx xxx xxx" />
                </label>
                <label>
                  <span>{t("auth", "field_birthday", "Ngày sinh")}</span>
                  <input name="birthday" type="date" defaultValue={user.birthday || ""} min="1900-01-01" max={todayIso()} />
                </label>
                <label className="profile-wide-field">
                  <span>{t("cart", "field_address", "Địa chỉ nhận hàng")}</span>
                  <input name="address" defaultValue={user.address || ""} placeholder={t("cart", "field_address_placeholder", "Số nhà, phường/xã, tỉnh/thành")} maxLength={500} />
                </label>
              </div>

              {message && <p className="profile-message" role="status">{message}</p>}
              {error && <p className="profile-message error" role="alert">{error}</p>}
              <button className="profile-submit" type="submit" disabled={saving}>{saving ? t("orders", "saving", "Đang lưu...") : t("account", "save", "Lưu thông tin")}</button>
            </form>
          ) : (
            <section className="order-history-panel" aria-label={ordersLabel}>
              {ordersError ? <p className="order-form-error">{ordersError}</p> : null}
              {orders === null && !ordersError ? <div className="profile-card skeleton" /> : null}
              {orders && orders.length > 0 ? <OrderHistoryList orders={orders} onChanged={handleOrderChanged} /> : null}
              {orders && orders.length === 0 ? (
                <div className="cart-empty order-history-empty">
                  <h2>{t("cart", "no_orders", "Chưa có đơn hàng")}</h2>
                  <p>{t("account", "no_orders_copy", "Đơn bạn gửi từ giỏ hàng sẽ hiện ở đây cùng trạng thái xử lý.")}</p>
                  <Link href={href("/combo-dac-san")}>{t("account", "view_packages", "Xem combo đặc sản")}</Link>
                </div>
              ) : null}

              {inquiries.length > 0 ? (
                <div className="profile-inquiry-list">
                  <h3>{t("account", "inquiries", "Yêu cầu tư vấn")}</h3>
                  {inquiries.map((inquiry) => (
                    <article className="profile-inquiry-item" key={inquiry.id}>
                      <div>
                        <strong>{inquiry.requestType}</strong>
                        <p>{[inquiry.products, inquiry.quantity, inquiry.budget].filter(Boolean).join(" · ") || t("account", "no_inquiry_note", "Không có ghi chú thêm")}</p>
                      </div>
                      <div className="profile-inquiry-meta">
                        <span className={`order-status-pill inquiry-status-${inquiry.status}`}>
                          {inquiry.status in INQUIRY_STATUS_LABELS
                            ? t("inquiryStatus", inquiry.status, INQUIRY_STATUS_LABELS[inquiry.status as keyof typeof INQUIRY_STATUS_LABELS])
                            : inquiry.status}
                        </span>
                        <small>{dateFormatter.format(new Date(inquiry.createdAt))}</small>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
            </section>
          )}
        </div>
      </div>
    </section>
  );
}
