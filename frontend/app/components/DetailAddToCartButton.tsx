"use client";

import { addCartItem, type StoredCartItem } from "./cartStorage";
import { useI18n } from "./I18nProvider";

type DetailAddToCartButtonProps = {
  item: Omit<StoredCartItem, "quantity"> & { quantity?: number };
  label?: string;
  className?: string;
};

export function DetailAddToCartButton({
  item,
  label,
  className = "detail-cart-action",
}: DetailAddToCartButtonProps) {
  const { t } = useI18n();
  const defaultLabel = t("localSpecialty", "add_to_cart", "Thêm vào giỏ hàng");

  function handleAddToCart() {
    addCartItem(item);
  }

  return (
    <button
      suppressHydrationWarning
      className={className}
      type="button"
      onClick={handleAddToCart}
      aria-label={t("localSpecialty", "add_to_cart_named", "Thêm {name} vào giỏ hàng").replace("{name}", item.name)}
      title={defaultLabel}
    >
      <svg className="detail-cart-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4.5 5h2.2l1.9 9.1a2.2 2.2 0 0 0 2.2 1.8h5.9a2.2 2.2 0 0 0 2.1-1.6l1.2-5.1H8" />
        <circle cx="10" cy="20" r="1.2" />
        <circle cx="18" cy="20" r="1.2" />
      </svg>
      <span>{label || defaultLabel}</span>
    </button>
  );
}
