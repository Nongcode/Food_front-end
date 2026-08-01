export type StoredCartItem = {
  id: string;
  slug: string;
  name: string;
  seller: string;
  note: string;
  image: string;
  price: number;
  priceText: string;
  quantity: number;
  type: "package" | "specialty";
};

export const CART_STORAGE_KEY = "sonla-food-cart-v1";
export const CART_UPDATED_EVENT = "sonla-cart-updated";
export const CART_ADDED_EVENT = "sonla-cart-added";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function parseCartPrice(priceText?: string | null) {
  if (!priceText) return 0;
  const digits = priceText.replace(/[^0-9]/g, "");
  return digits ? Number(digits) : 0;
}

function normalizeItem(item: StoredCartItem): StoredCartItem {
  return {
    ...item,
    quantity: Math.max(1, Math.min(99, Number(item.quantity) || 1)),
    price: Number(item.price) || 0,
    priceText: item.priceText || (item.price ? `${item.price.toLocaleString("vi-VN")}đ` : "Liên hệ"),
  };
}

export function readCartItems(): StoredCartItem[] {
  if (!canUseStorage()) return [];

  try {
    const rawValue = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!rawValue) return [];

    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is StoredCartItem => Boolean(item && item.id && item.name))
      .map(normalizeItem);
  } catch {
    return [];
  }
}

export function writeCartItems(items: StoredCartItem[]) {
  if (!canUseStorage()) return;

  const normalizedItems = items.map(normalizeItem);
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalizedItems));
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: { items: normalizedItems } }));
}

export function addCartItem(item: Omit<StoredCartItem, "quantity"> & { quantity?: number }) {
  if (!canUseStorage()) return [];

  const currentItems = readCartItems();
  const quantityToAdd = Math.max(1, Math.min(99, Number(item.quantity) || 1));
  const existingIndex = currentItems.findIndex((cartItem) => cartItem.id === item.id);
  let nextItems: StoredCartItem[];

  if (existingIndex >= 0) {
    nextItems = currentItems.map((cartItem, index) =>
      index === existingIndex
        ? normalizeItem({ ...cartItem, quantity: Math.min(99, cartItem.quantity + quantityToAdd) })
        : cartItem,
    );
  } else {
    nextItems = [normalizeItem({ ...item, quantity: quantityToAdd }), ...currentItems];
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextItems));
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: { items: nextItems } }));
  window.dispatchEvent(new CustomEvent(CART_ADDED_EVENT, { detail: { item: normalizeItem({ ...item, quantity: quantityToAdd }) } }));

  return nextItems;
}
