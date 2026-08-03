"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CART_UPDATED_EVENT, readCartItems, writeCartItems, type StoredCartItem } from "./cartStorage";
import { useI18n } from "./I18nProvider";

const ORDER_HISTORY_STORAGE_KEY = "sonla-food-order-history-v1";
const ORDER_STATUS_REQUESTED = "Đã yêu cầu đặt hàng";
const ORDER_STATUS_CANCELLED = "Đã hủy yêu cầu";

type CartTab = "cart" | "history";
type OrderRequestStatus = typeof ORDER_STATUS_REQUESTED | typeof ORDER_STATUS_CANCELLED | string;

type StoredOrderRequest = {
  id: string;
  createdAt: string;
  status: OrderRequestStatus;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    note: string;
  };
  items: StoredCartItem[];
  cancelReason?: string;
  canceledAt?: string;
  totals: {
    subtotal: number;
    packingFee: number;
    estimatedTotal: number;
    totalQuantity: number;
  };
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value).replace("₫", "đ");
}

function displayPrice(item: StoredCartItem) {
  return item.price > 0 ? formatCurrency(item.price) : item.priceText;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readOrderHistory(): StoredOrderRequest[] {
  if (!canUseStorage()) return [];

  try {
    const rawValue = window.localStorage.getItem(ORDER_HISTORY_STORAGE_KEY);
    if (!rawValue) return [];

    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((order): order is StoredOrderRequest => Boolean(order?.id && order?.createdAt && order?.items));
  } catch {
    return [];
  }
}

function writeOrderHistory(orders: StoredOrderRequest[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(ORDER_HISTORY_STORAGE_KEY, JSON.stringify(orders));
}

function createOrderCode(date = new Date()) {
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SLF-${datePart}-${randomPart}`;
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
  const [orderHistory, setOrderHistory] = useState<StoredOrderRequest[]>([]);
  const [activeTab, setActiveTab] = useState<CartTab>("cart");
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);
  const [editOrderError, setEditOrderError] = useState("");
  const [editOrderSuccess, setEditOrderSuccess] = useState(false);
  const [cancelOrderError, setCancelOrderError] = useState("");
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    setItems(readCartItems());
    setOrderHistory(readOrderHistory());

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
    if (!isOrderModalOpen && !editingOrderId && !cancelingOrderId) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmittingOrder) {
        setIsOrderModalOpen(false);
        setEditingOrderId(null);
        setCancelingOrderId(null);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [cancelingOrderId, editingOrderId, isOrderModalOpen, isSubmittingOrder]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const packingFee = items.length > 0 ? 30000 : 0;
    const estimatedTotal = subtotal + packingFee;

    return { subtotal, packingFee, estimatedTotal };
  }, [items]);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const editingOrder = useMemo(
    () => orderHistory.find((order) => order.id === editingOrderId) || null,
    [editingOrderId, orderHistory],
  );
  const cancelingOrder = useMemo(
    () => orderHistory.find((order) => order.id === cancelingOrderId) || null,
    [cancelingOrderId, orderHistory],
  );

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

  function openEditOrderModal(order: StoredOrderRequest) {
    if (order.status !== ORDER_STATUS_REQUESTED) return;
    setEditOrderError("");
    setEditOrderSuccess(false);
    setEditingOrderId(order.id);
  }

  function closeEditOrderModal() {
    if (isSubmittingOrder) return;
    setEditingOrderId(null);
    setEditOrderError("");
    setEditOrderSuccess(false);
  }

  function openCancelOrderModal(order: StoredOrderRequest) {
    if (order.status !== ORDER_STATUS_REQUESTED) return;
    setCancelOrderError("");
    setCancelingOrderId(order.id);
  }

  function requestOrderAgain(order: StoredOrderRequest) {
    if (order.status !== ORDER_STATUS_CANCELLED) return;

    const nextHistory = orderHistory.map((historyOrder) =>
      historyOrder.id === order.id
        ? {
            ...historyOrder,
            status: ORDER_STATUS_REQUESTED,
            cancelReason: undefined,
            canceledAt: undefined,
          }
        : historyOrder,
    );

    setOrderHistory(nextHistory);
    writeOrderHistory(nextHistory);
  }

  function closeCancelOrderModal() {
    if (isSubmittingOrder) return;
    setCancelingOrderId(null);
    setCancelOrderError("");
  }

  function handleCancelOrderSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!cancelingOrder || cancelingOrder.status !== ORDER_STATUS_REQUESTED) {
      setCancelOrderError("Yêu cầu này đã được xử lý nên không thể hủy từ giao diện khách hàng.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const reason = String(formData.get("cancelReason") || "").trim();

    if (!reason) {
      setCancelOrderError("Vui lòng nhập lý do hủy yêu cầu đặt hàng.");
      return;
    }

    const nextHistory = orderHistory.map((order) =>
      order.id === cancelingOrder.id
        ? { ...order, status: ORDER_STATUS_CANCELLED, cancelReason: reason, canceledAt: new Date().toISOString() }
        : order,
    );

    setOrderHistory(nextHistory);
    writeOrderHistory(nextHistory);
    setCancelingOrderId(null);
    setCancelOrderError("");
  }

  function handleEditOrderSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingOrder || editingOrder.status !== ORDER_STATUS_REQUESTED) {
      setEditOrderError("Yêu cầu này đã được xử lý nên không thể thay đổi thông tin nhận hàng.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const updatedCustomer = {
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      address: String(formData.get("address") || "").trim(),
      note: String(formData.get("notes") || "").trim(),
    };

    const nextHistory = orderHistory.map((order) =>
      order.id === editingOrder.id ? { ...order, customer: updatedCustomer } : order,
    );

    setOrderHistory(nextHistory);
    writeOrderHistory(nextHistory);
    setEditOrderError("");
    setEditOrderSuccess(true);
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

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const customerNote = String(formData.get("notes") || "").trim();
    const orderItems = items.map((item) => ({ ...item }));
    const orderDate = new Date();
    const orderTotals = {
      subtotal: totals.subtotal,
      packingFee: totals.packingFee,
      estimatedTotal: totals.estimatedTotal,
      totalQuantity,
    };
    const tourName = orderItems.map((item) => `${item.name} x ${item.quantity}`).join(", ");
    const notes = buildOrderNotes(orderItems, address, customerNote, orderTotals.estimatedTotal);
    const nextOrder: StoredOrderRequest = {
      id: createOrderCode(orderDate),
      createdAt: orderDate.toISOString(),
      status: ORDER_STATUS_REQUESTED,
      customer: { name, phone, email, address, note: customerNote },
      items: orderItems,
      totals: orderTotals,
    };

    try {
      const nextHistory = [nextOrder, ...orderHistory].slice(0, 30);
      setOrderHistory(nextHistory);
      writeOrderHistory(nextHistory);
      updateCart([]);
      setActiveTab("history");
      setOrderSuccess(true);
      formElement.reset();

      fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, tourName, notes }),
      }).catch((error) => {
        console.warn("Order request saved locally but API sync failed", error);
      });
    } catch (error) {
      console.error(error);
      setOrderError("Chưa lưu được yêu cầu. Vui lòng thử lại hoặc liên hệ trực tiếp với Sơn La Food.");
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  return (
    <section className="cart-shell">
      <div className="cart-tabs" role="tablist" aria-label="Giỏ hàng và lịch sử đặt hàng">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "cart"}
          className={activeTab === "cart" ? "active" : ""}
          onClick={() => setActiveTab("cart")}
        >
          Giỏ hàng hiện tại
          {totalQuantity > 0 ? <span>{totalQuantity}</span> : null}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "history"}
          className={activeTab === "history" ? "active" : ""}
          onClick={() => setActiveTab("history")}
        >
          Lịch sử yêu cầu
          {orderHistory.length > 0 ? <span>{orderHistory.length}</span> : null}
        </button>
      </div>

      {activeTab === "cart" ? (
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
      ) : (
        <section className="order-history-panel" aria-label="Lịch sử yêu cầu đặt hàng">
          <div className="cart-list-heading order-history-heading">
            <div>
              <span>{orderHistory.length} yêu cầu</span>
              <h2>Lịch sử đặt hàng</h2>
            </div>
            <button type="button" onClick={() => setActiveTab("cart")}>Quay lại giỏ hàng</button>
          </div>

          {orderHistory.length > 0 ? (
            <div className="order-history-list">
              {orderHistory.map((order) => (
                <article className="order-history-card" key={order.id}>
                  <div className="order-history-topline">
                    <div>
                      <span className="order-code">{order.id}</span>
                      <h3>{order.customer.name}</h3>
                      <p>{dateFormatter.format(new Date(order.createdAt))}</p>
                    </div>
                    <div className="order-history-actions">
                      <span className="order-status-pill">{order.status}</span>
                      {order.status === ORDER_STATUS_REQUESTED ? (
                        <>
                          <button type="button" className="order-edit-button" onClick={() => openEditOrderModal(order)}>
                            Sửa thông tin nhận hàng
                          </button>
                          <button type="button" className="order-cancel-button" onClick={() => openCancelOrderModal(order)}>
                            Hủy yêu cầu
                          </button>
                        </>
                      ) : null}
                      {order.status === ORDER_STATUS_CANCELLED ? (
                        <button type="button" className="order-buy-again-button" onClick={() => requestOrderAgain(order)}>
                          Mua lại
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="order-history-products">
                    {order.items.map((item) => (
                      <div className="order-history-product" key={`${order.id}-${item.id}`}>
                        <div className="order-history-image" style={{ backgroundImage: `url(${item.image})` }} />
                        <div>
                          <strong>{item.name}</strong>
                          <span>{item.quantity} x {displayPrice(item)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-history-meta">
                    <div><span>Số điện thoại</span><strong>{order.customer.phone}</strong></div>
                    <div><span>Địa chỉ</span><strong>{order.customer.address}</strong></div>
                    <div><span>Tổng sản phẩm</span><strong>{order.totals.totalQuantity}</strong></div>
                    <div><span>Tổng dự kiến</span><strong>{formatCurrency(order.totals.estimatedTotal)}</strong></div>
                  </div>

                  {order.customer.note ? <p className="order-history-note">Ghi chú: {order.customer.note}</p> : null}
                  {order.cancelReason ? <p className="order-history-note order-cancel-reason">Lý do hủy: {order.cancelReason}</p> : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="cart-empty order-history-empty">
              <h2>Chưa có yêu cầu đặt hàng</h2>
              <p>Sau khi gửi yêu cầu thành công, đơn demo sẽ tự động xuất hiện tại đây với trạng thái đã yêu cầu đặt hàng.</p>
              <button type="button" onClick={() => setActiveTab("cart")}>Xem giỏ hàng hiện tại</button>
            </div>
          )}
        </section>
      )}

      {cancelingOrder ? (
        <div className="order-modal-backdrop" role="presentation" onMouseDown={closeCancelOrderModal}>
          <div className="order-modal order-cancel-modal" role="dialog" aria-modal="true" aria-labelledby="cancel-order-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="order-modal-close" type="button" aria-label="Đóng form hủy yêu cầu" onClick={closeCancelOrderModal}>×</button>
            <form className="order-request-form" onSubmit={handleCancelOrderSubmit}>
              <div className="order-modal-heading">
                <span>Hủy yêu cầu đặt hàng</span>
                <h2 id="cancel-order-modal-title">Nhập lý do hủy yêu cầu {cancelingOrder.id}</h2>
                <p>Yêu cầu chỉ có thể hủy khi còn ở trạng thái đã yêu cầu đặt hàng. Sau khi đơn được xử lý, thao tác hủy sẽ bị khóa.</p>
              </div>

              <div className="order-modal-cart-summary">
                <strong>{cancelingOrder.totals.totalQuantity} sản phẩm trong yêu cầu</strong>
                <span>Trạng thái: {cancelingOrder.status}</span>
              </div>

              <label>
                Lý do hủy *
                <textarea name="cancelReason" rows={5} placeholder="Ví dụ: muốn đổi địa chỉ nhận hàng, chọn lại sản phẩm, đặt nhầm số lượng..." required />
              </label>

              {cancelOrderError ? <p className="order-form-error" role="alert">{cancelOrderError}</p> : null}

              <div className="order-modal-actions">
                <button type="button" className="order-modal-secondary" onClick={closeCancelOrderModal}>Quay lại</button>
                <button type="submit" className="order-modal-submit order-cancel-submit">Xác nhận hủy</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {editingOrder ? (
        <div className="order-modal-backdrop" role="presentation" onMouseDown={closeEditOrderModal}>
          <div className="order-modal order-edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-order-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="order-modal-close" type="button" aria-label="Đóng form sửa thông tin nhận hàng" onClick={closeEditOrderModal}>×</button>
            <form className="order-request-form" onSubmit={handleEditOrderSubmit}>
              <div className="order-modal-heading">
                <span>Chỉnh sửa thông tin nhận hàng</span>
                <h2 id="edit-order-modal-title">Cập nhật yêu cầu {editingOrder.id}</h2>
                <p>Khách hàng chỉ có thể sửa khi yêu cầu còn ở trạng thái đã yêu cầu đặt hàng. Khi đơn được xử lý, thao tác này sẽ tự động bị khóa.</p>
              </div>

              <div className="order-form-grid">
                <label>
                  Họ và tên *
                  <input name="name" type="text" defaultValue={editingOrder.customer.name} required />
                </label>
                <label>
                  Số điện thoại *
                  <input name="phone" type="tel" defaultValue={editingOrder.customer.phone} required />
                </label>
                <label>
                  Email *
                  <input name="email" type="email" defaultValue={editingOrder.customer.email} required />
                </label>
                <label>
                  Địa chỉ nhận hàng *
                  <input name="address" type="text" defaultValue={editingOrder.customer.address} required />
                </label>
              </div>

              <label>
                Ghi chú thêm
                <textarea name="notes" rows={4} defaultValue={editingOrder.customer.note} placeholder="Ví dụ: đổi giờ nhận hàng, bổ sung người nhận, cần gọi trước khi giao..." />
              </label>

              <div className="order-modal-cart-summary">
                <strong>{editingOrder.totals.totalQuantity} sản phẩm trong yêu cầu</strong>
                <span>Trạng thái: {editingOrder.status}</span>
              </div>

              {editOrderSuccess ? <p className="order-form-success" role="status">Đã cập nhật thông tin nhận hàng cho yêu cầu này.</p> : null}
              {editOrderError ? <p className="order-form-error" role="alert">{editOrderError}</p> : null}

              <div className="order-modal-actions">
                <button type="button" className="order-modal-secondary" onClick={closeEditOrderModal}>Đóng</button>
                <button type="submit" className="order-modal-submit">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

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