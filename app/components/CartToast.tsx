"use client";

import { useEffect, useRef, useState } from "react";
import { CART_ADDED_EVENT, type StoredCartItem } from "./cartStorage";

type CartAddedEvent = CustomEvent<{ item?: StoredCartItem }>;

export function CartToast() {
  const [message, setMessage] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleCartAdded(event: Event) {
      const addedItem = (event as CartAddedEvent).detail?.item;
      setMessage(addedItem?.name ? `Đã thêm "${addedItem.name}" vào giỏ hàng của bạn` : "Đã thêm vào giỏ hàng của bạn");

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
  }, []);

  return (
    <div className={`cart-toast ${message ? "show" : ""}`} role="status" aria-live="polite">
      <span className="cart-icon" aria-hidden="true" />
      <span>{message || "Đã thêm vào giỏ hàng của bạn"}</span>
    </div>
  );
}
