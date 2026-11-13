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

function normalizeItem(item: StoredCartItem): StoredCartItem {
  return {
    ...item,
    quantity: Math.max(1, Math.min(99, Number(item.quantity) || 1)),
    price: Number(item.price) || 0,
    priceText: item.priceText || (item.price ? `${item.price.toLocaleString("vi-VN")}đ` : "Liên hệ"),
  };
}

export function parseCartItems(rawValue: string | null): StoredCartItem[] {
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is StoredCartItem => Boolean(item && item.id && item.name))
      .map(normalizeItem);
  } catch {
    return [];
  }
}

export function readCartItems(): StoredCartItem[] {
  if (!canUseStorage()) return [];
  return parseCartItems(window.localStorage.getItem(CART_STORAGE_KEY));
}

// Chuỗi thô làm snapshot cho useSyncExternalStore (so sánh được bằng ===)
export function readCartSnapshot(): string {
  return canUseStorage() ? window.localStorage.getItem(CART_STORAGE_KEY) || "" : "";
}

export function subscribeCart(onChange: () => void) {
  window.addEventListener(CART_UPDATED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CART_UPDATED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
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
