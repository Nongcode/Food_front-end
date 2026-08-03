"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CART_UPDATED_EVENT, readCartItems, writeCartItems, type StoredCartItem } from "./cartStorage";
import { useI18n } from "./I18nProvider";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value).replace("₫", "đ");
}

function displayPrice(item: StoredCartItem) {
  return item.price > 0 ? formatCurrency(item.price) : item.priceText;
}

function buildOrderNotes(items: StoredCartItem[], address: string, customerNote: string, estimatedTotal: number) {
  const itemLines = items.map((item, index) => {
    const lineTotal = item.price > 0 ? ` - Tạm tính: ${formatCurrency(item.price * item.quantity)}` : "";
    return `${index + 1}. ${item.name} x ${item.quantity} (${displayPrice(item)})${lineTotal}`;
  });

  return [
    `Địa chỉ nhận hàng: ${address}`,
    `Tổng dự kiến: ${formatCurrency(estimatedTotal)}`,
    "Danh sách sản phẩm:",
    ...itemLines,
    customerNote ? `Ghi chú khách hàng: ${customerNote}` : "Ghi chú khách hàng: Không có",
  ].join("\n");
}

export function CartClient() {
  const { href } = useI18n();
  const [items, setItems] = useState<StoredCartItem[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    setItems(readCartItems());

    function handleCartUpdated() {
      setItems(readCartItems());
    }

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    window.addEventListener("storage", handleCartUpdated);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
      window.removeEventListener("storage", handleCartUpdated);
    };
  }, []);

  useEffect(() => {
    if (!isOrderModalOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmittingOrder) {
        setIsOrderModalOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOrderModalOpen, isSubmittingOrder]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const packingFee = items.length > 0 ? 30000 : 0;
    const estimatedTotal = subtotal + packingFee;

    return { subtotal, packingFee, estimatedTotal };
  }, [items]);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  function updateCart(nextItems: StoredCartItem[]) {
    setItems(nextItems);
    writeCartItems(nextItems);
  }

  function updateQuantity(id: string, nextQuantity: number) {
    updateCart(
      items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, Math.min(99, nextQuantity)) } : item,
      ),
    );
  }

  function removeItem(id: string) {
    updateCart(items.filter((item) => item.id !== id));
  }

  function openOrderModal() {
    setOrderError("");
    setOrderSuccess(false);
    setIsOrderModalOpen(true);
  }

  function closeOrderModal() {
    if (isSubmittingOrder) return;
    setIsOrderModalOpen(false);
  }

  async function handleOrderSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (items.length === 0) {
      setOrderError("Giỏ hàng đang trống. Vui lòng chọn sản phẩm trước khi gửi yêu cầu.");
      return;
    }

    setIsSubmittingOrder(true);
    setOrderError("");
    setOrderSuccess(false);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const customerNote = String(formData.get("notes") || "").trim();
    const tourName = items.map((item) => `${item.name} x ${item.quantity}`).join(", ");
    const notes = buildOrderNotes(items, address, customerNote, totals.estimatedTotal);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, tourName, notes }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Không thể gửi yêu cầu đặt hàng.");
      }

      setOrderSuccess(true);
      event.currentTarget.reset();
    } catch (error) {
      console.error(error);
      setOrderError("Chưa gửi được yêu cầu. Vui lòng thử lại hoặc liên hệ trực tiếp với Sơn La Food.");
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  return (
    <section className="cart-shell">
      <div className="cart-layout">
        <section className="cart-items" aria-label="Danh sách sản phẩm trong giỏ hàng">
          <div className="cart-list-heading">
            <div>
              <span>{totalQuantity} sản phẩm</span>
              <h2>Sản phẩm đã chọn</h2>
            </div>
            <Link href={href("/combo-dac-san")}>Mua thêm</Link>
          </div>

          {items.length > 0 ? (
            <div className="cart-list">
              {items.map((item) => (
                <article className="cart-item" key={item.id}>
                  <div className="cart-item-image" style={{ backgroundImage: `url(${item.image})` }} />
                  <div className="cart-item-body">
                    <div className="cart-item-main">
                      <p>{item.seller}</p>
                      <h3>{item.name}</h3>
                      <span>{item.note}</span>
                    </div>
                    <div className="cart-item-actions">
                      <strong>{displayPrice(item)}</strong>
                      <div className="cart-quantity" aria-label={`Số lượng ${item.name}`}>
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Giảm số lượng">-</button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Tăng số lượng">+</button>
                      </div>
                      <button type="button" className="cart-remove" onClick={() => removeItem(item.id)}>Xóa</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="cart-empty">
              <h2>Giỏ hàng đang trống</h2>
              <p>Hãy chọn vài combo đặc sản hoặc sản phẩm tiêu biểu để bắt đầu tạo đơn.</p>
              <Link href={href("/combo-dac-san")}>Khám phá đặc sản</Link>
            </div>
          )}
        </section>

        <aside className="cart-summary" aria-label="Tóm tắt giỏ hàng">
          <span className="summary-kicker">Tóm tắt đơn</span>
          <h2>Dự kiến thanh toán</h2>
          <div className="summary-lines">
            <div><span>Tạm tính</span><strong>{formatCurrency(totals.subtotal)}</strong></div>
            <div><span>Đóng gói / bảo quản</span><strong>{formatCurrency(totals.packingFee)}</strong></div>
            <div className="summary-total"><span>Tổng dự kiến</span><strong>{formatCurrency(totals.estimatedTotal)}</strong></div>
          </div>
          <p>Giá cuối cùng sẽ được xác nhận theo mùa vụ, tồn kho và địa chỉ nhận hàng.</p>
          <button className="cart-checkout" type="button" onClick={openOrderModal} disabled={items.length === 0}>Gửi yêu cầu đặt hàng</button>
          <Link className="cart-secondary" href={href("/dac-san")}>Xem sản phẩm đặc sản</Link>
        </aside>
      </div>

      {isOrderModalOpen ? (
        <div className="order-modal-backdrop" role="presentation" onMouseDown={closeOrderModal}>
          <div className="order-modal" role="dialog" aria-modal="true" aria-labelledby="order-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="order-modal-close" type="button" aria-label="Đóng form đặt hàng" onClick={closeOrderModal}>×</button>

            {orderSuccess ? (
              <div className="order-success-state" role="status">
                <span className="order-success-icon" aria-hidden="true">✓</span>
                <h2 id="order-modal-title">Yêu cầu đã được ghi nhận</h2>
                <p>Cảm ơn quý khách đã tin tưởng lựa chọn chúng tôi. Nhân viên sẽ liên hệ lại quý khách để xác nhận sớm nhất !</p>
                <button type="button" onClick={closeOrderModal}>Đóng</button>
              </div>
            ) : (
              <form className="order-request-form" onSubmit={handleOrderSubmit}>
                <div className="order-modal-heading">
                  <span>Thông tin đặt hàng</span>
                  <h2 id="order-modal-title">Xác nhận yêu cầu đặt hàng</h2>
                  <p>Vui lòng để lại thông tin liên hệ để nhân viên xác nhận sản phẩm, số lượng, địa chỉ và thời gian giao phù hợp.</p>
                </div>

                <div className="order-form-grid">
                  <label>
                    Họ và tên *
                    <input name="name" type="text" placeholder="Nguyễn Minh Anh" required />
                  </label>
                  <label>
                    Số điện thoại *
                    <input name="phone" type="tel" placeholder="09xx xxx xxx" required />
                  </label>
                  <label>
                    Email *
                    <input name="email" type="email" placeholder="email@example.com" required />
                  </label>
                  <label>
                    Địa chỉ nhận hàng *
                    <input name="address" type="text" placeholder="Số nhà, phường/xã, tỉnh/thành" required />
                  </label>
                </div>

                <label>
                  Ghi chú thêm
                  <textarea name="notes" rows={4} placeholder="Ví dụ: giao giờ hành chính, cần hộp quà, cần gọi trước khi giao..." />
                </label>

                <div className="order-modal-cart-summary">
                  <strong>{totalQuantity} sản phẩm trong giỏ</strong>
                  <span>Tổng dự kiến: {formatCurrency(totals.estimatedTotal)}</span>
                </div>

                {orderError ? <p className="order-form-error" role="alert">{orderError}</p> : null}

                <div className="order-modal-actions">
                  <button type="button" className="order-modal-secondary" onClick={closeOrderModal}>Hủy</button>
                  <button type="submit" className="order-modal-submit" disabled={isSubmittingOrder}>{isSubmittingOrder ? "Đang gửi..." : "Gửi xác nhận"}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
