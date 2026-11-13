"use client";

import { useEffect, useRef, useState } from "react";
import { CART_ADDED_EVENT, type StoredCartItem } from "./cartStorage";
import { useI18n } from "./I18nProvider";

type CartAddedEvent = CustomEvent<{ item?: StoredCartItem }>;

export function CartToast() {
  const { t } = useI18n();
  const [message, setMessage] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleCartAdded(event: Event) {
      const addedItem = (event as CartAddedEvent).detail?.item;
      setMessage(addedItem?.name ? t("cart", "toast_added_named", "Đã thêm \"{name}\" vào giỏ hàng của bạn").replace("{name}", addedItem.name) : t("cart", "toast_added", "Đã thêm vào giỏ hàng của bạn"));

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setMessage("");
      }, 2600);
    }

    window.addEventListener(CART_ADDED_EVENT, handleCartAdded);

    return () => {
      window.removeEventListener(CART_ADDED_EVENT, handleCartAdded);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [t]);

  return (
    <div className={`cart-toast ${message ? "show" : ""}`} role="status" aria-live="polite">
      <span className="cart-icon" aria-hidden="true" />
      <span>{message || t("cart", "toast_added", "Đã thêm vào giỏ hàng của bạn")}</span>
    </div>
  );
}
