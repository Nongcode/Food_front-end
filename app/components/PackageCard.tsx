"use client";

import type { MouseEvent, PointerEvent } from "react";
import Link from "next/link";
import { getStatusStyleAndLabel } from "@/lib/status";
import { addCartItem } from "./cartStorage";
import { useI18n } from "./I18nProvider";
import { backgroundWithFallback } from "@/lib/imageFallback";

type PackageCardProps = {
  item: {
    slug: string;
    name: string;
    destination: string;
    duration: string;
    price: string;
    priceValue?: number | null;
    summary: string;
    image: string;
    status: string;
  };
};

type FoodCardMeta = {
  badge: string;
  flavor: string;
  useCase: string;
  packing: string;
};

function getFoodCardMeta(item: PackageCardProps["item"]): FoodCardMeta {
  const source = `${item.slug} ${item.name} ${item.summary}`.toLowerCase();

  if (source.includes("trai-cay") || source.includes("trái") || source.includes("xoài") || source.includes("mận")) {
    return {
      badge: "Theo mùa",
      flavor: "Ngọt mọng",
      useCase: "Ăn tươi / làm quà",
      packing: "Đóng trong ngày",
    };
  }

  if (source.includes("cham-cheo") || source.includes("chẩm") || source.includes("mắc") || source.includes("gia-v")) {
    return {
      badge: "Cay thơm",
      flavor: "Mắc khén",
      useCase: "Chấm / ướp nướng",
      packing: "Hũ kín vị",
    };
  }

  if (source.includes("qua") || source.includes("quà") || source.includes("moc-chau") || source.includes("mộc")) {
    return {
      badge: "Dễ biếu",
      flavor: "Thanh hậu",
      useCase: "Biếu tặng",
      packing: "Hộp quà",
    };
  }

  if (source.includes("gac-bep") || source.includes("gác") || source.includes("thịt") || source.includes("trâu")) {
    return {
      badge: "Vị khói",
      flavor: "Đậm đà",
      useCase: "Bữa cơm / lai rai",
      packing: "Hút chân không",
    };
  }

  return {
    badge: "Chuẩn vị",
    flavor: "Tây Bắc",
    useCase: "Dùng thử / làm quà",
    packing: "Gói sạch",
  };
}

export function PackageCard({ item }: PackageCardProps) {
  const { t, href, locale } = useI18n();
  const { statusClass, statusLabel } = getStatusStyleAndLabel(item.status, locale, t);
  const foodMeta = getFoodCardMeta(item);

  function handleAddToCart(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    addCartItem({
      id: `package:${item.slug}`,
      slug: item.slug,
      name: item.name,
      seller: item.destination || "Sơn La Food",
      note: item.summary,
      image: item.image,
      price: item.priceValue ?? 0,
      priceText: item.price,
      type: "package",
    });
  }

  function stopScrollerDrag(event: PointerEvent<HTMLButtonElement>) {
    event.stopPropagation();
  }

  return (
    <article className="package-card">
      <Link className="package-card-link" href={href("/combo-dac-san/" + item.slug)}>
        <div className="package-image" style={{ backgroundImage: backgroundWithFallback(item.image) }}>
          <span className="package-food-badge">{foodMeta.badge}</span>
          <span className={`status-badge ${statusClass}`}>
            {statusLabel}
          </span>
        </div>
        <div className="package-body">
          <p className="package-kicker">{item.destination} / {item.duration}</p>
          <h3>{item.name}</h3>
          <p>{item.summary}</p>
          <div className="package-food-notes" aria-label="Thông tin hương vị">
            <span><b>Vị</b>{foodMeta.flavor}</span>
            <span><b>Hợp</b>{foodMeta.useCase}</span>
            <span><b>Gói</b>{foodMeta.packing}</span>
          </div>
        </div>
      </Link>
      <div className="package-footer package-footer-standalone">
        <strong>{item.price}</strong>
        <button
          suppressHydrationWarning
          className="package-cart-button"
          type="button"
          onClick={handleAddToCart}
          onPointerDown={stopScrollerDrag}
          aria-label={t("localSpecialty", "add_to_cart_named", "Thêm {name} vào giỏ hàng").replace("{name}", item.name)}
          title={t("localSpecialty", "add_to_cart", "Thêm vào giỏ hàng")}
        >
          <span className="cart-icon" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
