"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { parseCartItems, readCartSnapshot, subscribeCart, writeCartItems, type StoredCartItem } from "./cartStorage";
import { markCustomerSignedOut, useCurrentCustomer } from "@/lib/customerSession";
import {
  ApiError,
  DEFAULT_PACKING_FEE,
  cartQuoteKey,
  fetchCartPrices,
  fetchMyOrders,
  fetchPackingFee,
  formatVnd,
  submitOrder,
  type CartQuote,
  type CustomerOrder,
} from "@/lib/customerOrders";
import { OrderHistoryList } from "./OrderHistoryList";
import { useI18n } from "./I18nProvider";
import { backgroundWithFallback } from "@/lib/imageFallback";

type CartTab = "cart" | "history";

function formatUnitPrice(price: number, unit?: string | null) {
  return unit ? `${formatVnd(price)}/${unit}` : formatVnd(price);
}

export function CartClient() {
  const router = useRouter();
  const { href, t } = useI18n();
  const cartSnapshot = useSyncExternalStore(subscribeCart, readCartSnapshot, () => "");
  const items = useMemo(() => parseCartItems(cartSnapshot), [cartSnapshot]);
  const [activeTab, setActiveTab] = useState<CartTab>("cart");
  const [packingFee, setPackingFee] = useState(DEFAULT_PACKING_FEE);
  const [quotes, setQuotes] = useState<Map<string, CartQuote> | null>(null);
  const [priceNotice, setPriceNotice] = useState("");
  const [orders, setOrders] = useState<CustomerOrder[] | null>(null);
  const [ordersError, setOrdersError] = useState("");
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [submittedCode, setSubmittedCode] = useState("");
  const [totalNotice, setTotalNotice] = useState("");
  const { customer: currentUser, loading: customerLoading } = useCurrentCustomer();
  const userId = currentUser?.id;

  const contactPriceLabel = t("cart", "price_contact", "Giá liên hệ");

  useEffect(() => {
    let active = true;
    fetchPackingFee().then((fee) => {
      if (active) setPackingFee(fee);
    });
    return () => {
      active = false;
    };
  }, []);

  // Danh sách món (không gồm giá/số lượng) — chỉ hỏi lại giá khi món trong giỏ thay đổi
  const itemKeys = useMemo(
    () => [...new Set(items.map((item) => cartQuoteKey(item.type, item.slug)))].sort().join("|"),
    [items],
  );

  // Giá trong localStorage chỉ để hiển thị nhanh; giá thật lấy từ BE mỗi khi mở giỏ
  useEffect(() => {
    if (!itemKeys) return;
    let active = true;
    const requested = itemKeys.split("|").map((key) => {
      const [itemType, ...slugParts] = key.split(":");
      return { itemType: itemType as "package" | "specialty", slug: slugParts.join(":") };
    });
    fetchCartPrices(requested)
      .then((result) => {
        if (!active) return;
        const map = new Map(result.map((quote) => [cartQuoteKey(quote.itemType, quote.slug), quote]));
        setQuotes(map);

        const current = parseCartItems(readCartSnapshot());
        let changed = false;
        const next = current.map((item) => {
          const quote = map.get(cartQuoteKey(item.type, item.slug));
          if (!quote || !quote.available) return item;
          const price = quote.unitPrice ?? 0;
          const priceText = quote.unitPrice !== null ? formatUnitPrice(quote.unitPrice, quote.unit) : "";
          if (item.price === price && (!quote.name || item.name === quote.name)) return item;
          changed = true;
          return { ...item, price, priceText: priceText || item.priceText, name: quote.name || item.name };
        });
        if (changed) {
          writeCartItems(next);
          setPriceNotice(t("cart", "price_updated", "Giá một số sản phẩm đã thay đổi. Giỏ hàng đã cập nhật theo giá hiện tại của cửa hàng."));
        }
      })
      .catch(() => {
        if (active) setPriceNotice(t("cart", "price_check_failed", "Chưa kiểm tra được giá mới nhất. Tổng tiền cuối cùng do cửa hàng xác nhận."));
      });
    return () => {
      active = false;
    };
  }, [itemKeys, t]);

  // Lịch sử đơn lấy từ BE, chỉ khi đã đăng nhập
  useEffect(() => {
    if (!userId) return;
    let active = true;
    fetchMyOrders()
      .then((orderList) => {
        if (!active) return;
        setOrders(orderList);
        setOrdersError("");
      })
      .catch((caughtError) => {
        if (active) setOrdersError(caughtError instanceof Error ? caughtError.message : t("cart", "orders_load_failed", "Chưa tải được đơn hàng."));
      });
    return () => {
      active = false;
    };
  }, [userId, t]);

  useEffect(() => {
    if (!isOrderModalOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmittingOrder) setIsOrderModalOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOrderModalOpen, isSubmittingOrder]);

  function quoteOf(item: StoredCartItem) {
    return quotes?.get(cartQuoteKey(item.type, item.slug));
  }

  // Món BE báo không còn bán: không tính tiền, phải xoá trước khi gửi đơn
  function isUnavailable(item: StoredCartItem) {
    return quoteOf(item)?.available === false;
  }

  function unitPriceOf(item: StoredCartItem) {
    const quote = quoteOf(item);
    if (quote) return quote.available ? quote.unitPrice ?? 0 : 0;
    return item.price;
  }

  function displayPrice(item: StoredCartItem) {
    if (isUnavailable(item)) return t("cart", "unavailable", "Không còn bán");
    const quote = quoteOf(item);
    const price = unitPriceOf(item);
    return price > 0 ? formatUnitPrice(price, quote?.unit) : contactPriceLabel;
  }

  const unavailableItems = items.filter(isUnavailable);

  const totals = useMemo(() => {
    const priced = items.filter((item) => quotes?.get(cartQuoteKey(item.type, item.slug))?.available !== false);
    const priceOf = (item: StoredCartItem) => {
      const quote = quotes?.get(cartQuoteKey(item.type, item.slug));
      return quote ? quote.unitPrice ?? 0 : item.price;
    };
    const subtotal = priced.reduce((sum, item) => sum + priceOf(item) * item.quantity, 0);
    const fee = priced.length > 0 ? packingFee : 0;
    const hasUnpricedItems = priced.some((item) => priceOf(item) <= 0);

    return { subtotal, packingFee: fee, estimatedTotal: subtotal + fee, hasUnpricedItems };
  }, [items, packingFee, quotes]);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const unpricedSuffix = totals.hasUnpricedItems ? ` ${t("cart", "unpriced_suffix", "(chưa gồm món giá liên hệ)")}` : "";

  function updateCart(nextItems: StoredCartItem[]) {
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

  // Về trang đăng nhập rồi quay lại giỏ; giỏ vẫn nằm trong localStorage
  function redirectToLogin() {
    router.push(`${href("/dang-nhap")}?next=${encodeURIComponent(window.location.pathname)}`);
  }

  function openOrderModal() {
    if (customerLoading) return;
    if (!currentUser) {
      redirectToLogin();
      return;
    }
    setOrderError("");
    setIsOrderModalOpen(true);
  }

  function closeOrderModal() {
    if (isSubmittingOrder) return;
    setIsOrderModalOpen(false);
  }

  function handleOrderChanged(updated: CustomerOrder) {
    setOrders((current) => current?.map((order) => (order.id === updated.id ? updated : order)) ?? current);
  }

  async function handleOrderSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmittingOrder) return;

    if (items.length === 0) {
      setOrderError(t("cart", "empty_error", "Giỏ hàng đang trống. Vui lòng chọn sản phẩm trước khi gửi yêu cầu."));
      return;
    }
    if (unavailableItems.length > 0) {
      setOrderError(t("cart", "remove_unavailable", "Vui lòng xoá sản phẩm không còn bán khỏi giỏ trước khi gửi đơn."));
      return;
    }

    const formData = new FormData(event.currentTarget);
    const shownTotal = totals.estimatedTotal;
    setIsSubmittingOrder(true);
    setOrderError("");

    try {
      const order = await submitOrder({
        items: items.map((item) => ({ itemType: item.type, slug: item.slug, quantity: item.quantity })),
        receiverName: String(formData.get("name") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        address: String(formData.get("address") || "").trim(),
        note: String(formData.get("notes") || "").trim(),
      });
      updateCart([]);
      setOrders((current) => [order, ...(current ?? [])]);
      setSubmittedCode(order.code);
      // BE tự tính lại tổng; báo khách nếu khác tổng vừa hiện trong giỏ
      setTotalNotice(
        order.total !== shownTotal
          ? t("cart", "total_changed", "Tổng do cửa hàng tính là {server}, khác tổng hiển thị trong giỏ ({shown}) vì giá vừa thay đổi.")
              .replace("{server}", formatVnd(order.total))
              .replace("{shown}", formatVnd(shownTotal))
          : "",
      );
      setIsOrderModalOpen(false);
      setActiveTab("history");
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) {
        markCustomerSignedOut();
        setIsOrderModalOpen(false);
        redirectToLogin();
        return;
      }
      setOrderError(caughtError instanceof Error ? caughtError.message : t("cart", "submit_failed", "Chưa gửi được đơn. Vui lòng thử lại."));
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  return (
    <section className="cart-shell">
      <div className="cart-tabs" role="tablist" aria-label={t("cart", "tabs_label", "Giỏ hàng và lịch sử đặt hàng")}>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "cart"}
          className={activeTab === "cart" ? "active" : ""}
          onClick={() => setActiveTab("cart")}
        >
          {t("cart", "tab_cart", "Giỏ hàng hiện tại")}
          {totalQuantity > 0 ? <span>{totalQuantity}</span> : null}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "history"}
          className={activeTab === "history" ? "active" : ""}
          onClick={() => setActiveTab("history")}
        >
          {t("cart", "tab_orders", "Đơn hàng của tôi")}
          {orders && orders.length > 0 ? <span>{orders.length}</span> : null}
        </button>
      </div>

      {activeTab === "cart" ? (
        <div className="cart-layout">
          <section className="cart-items" aria-label={t("cart", "items_label", "Danh sách sản phẩm trong giỏ hàng")}>
            <div className="cart-list-heading">
              <div>
                <span>{totalQuantity} {t("cart", "products_suffix", "sản phẩm")}</span>
                <h2>{t("cart", "selected_heading", "Sản phẩm đã chọn")}</h2>
              </div>
              <Link href={href("/combo-dac-san")}>{t("cart", "shop_more", "Mua thêm")}</Link>
            </div>

            {priceNotice && items.length > 0 ? <p className="order-form-error cart-price-notice" role="status">{priceNotice}</p> : null}
            {unavailableItems.length > 0 ? (
              <p className="order-form-error" role="alert">{t("cart", "remove_unavailable", "Vui lòng xoá sản phẩm không còn bán khỏi giỏ trước khi gửi đơn.")}</p>
            ) : null}

            {items.length > 0 ? (
              <div className="cart-list">
                {items.map((item) => (
                  <article className={`cart-item${isUnavailable(item) ? " is-unavailable" : ""}`} key={item.id}>
                    <div className="cart-item-image" style={{ backgroundImage: backgroundWithFallback(item.image) }} />
                    <div className="cart-item-body">
                      <div className="cart-item-main">
                        <p>{item.seller}</p>
                        <h3>{item.name}</h3>
                        <span>{item.note}</span>
                      </div>
                      <div className="cart-item-actions">
                        <strong>{displayPrice(item)}</strong>
                        <div className="cart-quantity" aria-label={`${t("cart", "quantity_of", "Số lượng")} ${item.name}`}>
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={t("cart", "decrease", "Giảm số lượng")}>-</button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={t("cart", "increase", "Tăng số lượng")}>+</button>
                        </div>
                        <button type="button" className="cart-remove" onClick={() => removeItem(item.id)}>{t("cart", "remove", "Xóa")}</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="cart-empty">
                <h2>{t("cart", "empty_title", "Giỏ hàng đang trống")}</h2>
                <p>{t("cart", "empty_copy", "Hãy chọn vài combo đặc sản hoặc sản phẩm tiêu biểu để bắt đầu tạo đơn.")}</p>
                <Link href={href("/combo-dac-san")}>{t("cart", "explore", "Khám phá đặc sản")}</Link>
              </div>
            )}
          </section>

          <aside className="cart-summary" aria-label={t("cart", "summary_label", "Tóm tắt giỏ hàng")}>
            <span className="summary-kicker">{t("cart", "summary_kicker", "Tóm tắt đơn")}</span>
            <h2>{t("cart", "summary_title", "Dự kiến thanh toán")}</h2>
            <div className="summary-lines">
              <div><span>{t("cart", "subtotal", "Tạm tính")}</span><strong>{formatVnd(totals.subtotal)}</strong></div>
              <div><span>{t("cart", "packing_fee", "Đóng gói / bảo quản")}</span><strong>{formatVnd(totals.packingFee)}</strong></div>
              <div className="summary-total"><span>{t("cart", "estimated_total", "Tổng dự kiến")}{unpricedSuffix}</span><strong>{formatVnd(totals.estimatedTotal)}</strong></div>
            </div>
            <p>{t("cart", "summary_note", "Giá cuối cùng sẽ được xác nhận theo mùa vụ, tồn kho và địa chỉ nhận hàng.")}</p>
            <button className="cart-checkout" type="button" onClick={openOrderModal} disabled={items.length === 0 || customerLoading || unavailableItems.length > 0}>{t("cart", "checkout", "Gửi yêu cầu đặt hàng")}</button>
            <Link className="cart-secondary" href={href("/dac-san")}>{t("cart", "view_specialties", "Xem sản phẩm đặc sản")}</Link>
          </aside>
        </div>
      ) : (
        <section className="order-history-panel" aria-label={t("cart", "tab_orders", "Đơn hàng của tôi")}>
          <div className="cart-list-heading order-history-heading">
            <div>
              <span>{orders?.length ?? 0} {t("cart", "orders_suffix", "đơn")}</span>
              <h2>{t("cart", "tab_orders", "Đơn hàng của tôi")}</h2>
            </div>
            <button type="button" onClick={() => setActiveTab("cart")}>{t("cart", "back_to_cart", "Quay lại giỏ hàng")}</button>
          </div>

          {submittedCode ? (
            <p className="order-form-success" role="status">
              {t("cart", "submitted", "Đã gửi đơn {code}. Nhân viên sẽ liên hệ xác nhận sớm.").replace("{code}", submittedCode)}{" "}
              <Link href={href("/tai-khoan")}>{t("cart", "view_in_account", "Xem trong tài khoản")}</Link>
            </p>
          ) : null}
          {totalNotice ? <p className="order-form-error" role="alert">{totalNotice}</p> : null}

          {!customerLoading && !currentUser ? (
            <div className="cart-empty order-history-empty">
              <h2>{t("cart", "login_to_view", "Đăng nhập để xem đơn hàng")}</h2>
              <p>{t("cart", "login_to_view_copy", "Đơn bạn đã gửi được lưu theo tài khoản và hiện ở đây cùng trạng thái xử lý.")}</p>
              <button type="button" onClick={redirectToLogin}>{t("cart", "login", "Đăng nhập")}</button>
            </div>
          ) : null}

          {currentUser && ordersError ? <p className="order-form-error">{ordersError}</p> : null}
          {currentUser && orders === null && !ordersError ? <div className="profile-card skeleton" /> : null}
          {currentUser && orders && orders.length > 0 ? <OrderHistoryList orders={orders} onChanged={handleOrderChanged} /> : null}
          {currentUser && orders && orders.length === 0 ? (
            <div className="cart-empty order-history-empty">
              <h2>{t("cart", "no_orders", "Chưa có đơn hàng")}</h2>
              <p>{t("cart", "no_orders_copy", "Sau khi gửi yêu cầu thành công, đơn sẽ xuất hiện tại đây với trạng thái chờ xác nhận.")}</p>
              <button type="button" onClick={() => setActiveTab("cart")}>{t("cart", "view_current_cart", "Xem giỏ hàng hiện tại")}</button>
            </div>
          ) : null}
        </section>
      )}

      {isOrderModalOpen && currentUser ? (
        <div className="order-modal-backdrop" role="presentation" onMouseDown={closeOrderModal}>
          <div className="order-modal" role="dialog" aria-modal="true" aria-labelledby="order-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="order-modal-close" type="button" aria-label={t("cart", "close_form", "Đóng form đặt hàng")} onClick={closeOrderModal}>×</button>

            <form className="order-request-form" key={currentUser.id} onSubmit={handleOrderSubmit}>
              <div className="order-modal-heading">
                <span>{t("cart", "form_kicker", "Thông tin đặt hàng")}</span>
                <h2 id="order-modal-title">{t("cart", "form_title", "Xác nhận yêu cầu đặt hàng")}</h2>
                <p>{t("cart", "form_copy", "Vui lòng kiểm tra thông tin nhận hàng. Form đã tự điền theo tài khoản của bạn.")}</p>
              </div>

              <div className="order-form-grid">
                <label>
                  {t("cart", "field_name", "Họ và tên")} *
                  <input name="name" type="text" defaultValue={currentUser.name} placeholder={t("form", "name_placeholder", "Nguyễn Minh Anh")} required maxLength={120} />
                </label>
                <label>
                  {t("cart", "field_phone", "Số điện thoại")} *
                  <input name="phone" type="tel" defaultValue={currentUser.phone} placeholder="09xx xxx xxx" required />
                </label>
                <label>
                  Email
                  <input name="email" type="email" defaultValue={currentUser.email} placeholder="email@example.com" />
                </label>
                <label>
                  {t("cart", "field_address", "Địa chỉ nhận hàng")} *
                  <input name="address" type="text" defaultValue={currentUser.address || ""} placeholder={t("cart", "field_address_placeholder", "Số nhà, phường/xã, tỉnh/thành")} required maxLength={500} />
                </label>
              </div>

              <label>
                {t("cart", "field_note", "Ghi chú thêm")}
                <textarea name="notes" rows={4} maxLength={1000} placeholder={t("cart", "field_note_placeholder", "Ví dụ: giao giờ hành chính, cần hộp quà, cần gọi trước khi giao...")} />
              </label>

              <div className="order-modal-cart-summary">
                <strong>{totalQuantity} {t("cart", "products_in_cart", "sản phẩm trong giỏ")}</strong>
                <span>{t("cart", "estimated_total", "Tổng dự kiến")}{unpricedSuffix}: {formatVnd(totals.estimatedTotal)}</span>
              </div>

              {orderError ? <p className="order-form-error" role="alert">{orderError}</p> : null}

              <div className="order-modal-actions">
                <button type="button" className="order-modal-secondary" onClick={closeOrderModal}>{t("cart", "cancel", "Hủy")}</button>
                <button type="submit" className="order-modal-submit" disabled={isSubmittingOrder}>{isSubmittingOrder ? t("cart", "submitting", "Đang gửi...") : t("cart", "submit", "Gửi xác nhận")}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
