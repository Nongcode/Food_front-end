"use client";

import Link from "next/link";
import { addCartItem } from "./cartStorage";
import { useMemo, useState } from "react";
import { useI18n } from "./I18nProvider";
import { formatProductPrice } from "@/lib/customerOrders";
import { backgroundWithFallback } from "@/lib/imageFallback";

type SpecialtyItem = {
  id: number;
  slug: string;
  name: string;
  type: string;
  description: string | null;
  imageUrl: string | null;
  priceText: string | null;
  priceValue?: number | null;
  priceUnit?: string | null;
  whereToBuy: string | null;
  destinationName: string;
};

type LocalSpecialtyExplorerProps = {
  specialties: SpecialtyItem[];
};

type RegionValue = "north" | "central" | "south" | "other";
type Translator = (namespace: string, key: string, fallback: string) => string;

const REGION_RULES: Array<{ value: RegionValue; keywords: string[] }> = [
  {
    value: "north",
    keywords: [
      "ha noi", "ha giang", "lao cai", "sa pa", "sapa", "cao bang",
      "bac kan", "lang son", "thai nguyen", "quang ninh", "ha long",
      "ninh binh", "nam dinh", "thai binh", "hai phong", "phu tho",
      "yen bai", "dien bien", "lai chau", "son la", "moc chau", "yen chau", "thuan chau", "mai son", "phu yen", "bac yen", "ta xua", "van ho", "hoa binh", "tuyen quang",
    ],
  },
  {
    value: "central",
    keywords: [
      "thanh hoa", "nghe an", "ha tinh", "quang binh", "phong nha",
      "quang tri", "hue", "thua thien", "da nang", "hoi an", "quang nam",
      "quang ngai", "binh dinh", "quy nhon", "phu yen", "nha trang",
      "khanh hoa", "ninh thuan", "binh thuan", "mui ne", "lam dong",
      "da lat", "kon tum", "gia lai", "dak lak", "dak nong",
    ],
  },
  {
    value: "south",
    keywords: [
      "ho chi minh", "sai gon", "hcm", "binh duong", "dong nai",
      "vung tau", "ba ria", "tay ninh", "binh phuoc", "long an",
      "tien giang", "ben tre", "tra vinh", "vinh long", "dong thap",
      "an giang", "can tho", "hau giang", "soc trang", "bac lieu",
      "ca mau", "kien giang", "phu quoc",
    ],
  },
];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getRegion(destinationName: string): RegionValue {
  const normalized = normalizeText(destinationName);
  return REGION_RULES.find((region) =>
    region.keywords.some((keyword) => normalized.includes(keyword)),
  )?.value || "other";
}

// Đủ các loại đặc sản BE dùng (khớp form admin)
const TYPE_OPTIONS = [
  { value: "FOOD", key: "type_food", label: "Món ăn" },
  { value: "DRY_FOOD", key: "type_dry_food", label: "Đồ khô" },
  { value: "DRINK", key: "type_drink", label: "Đồ uống / trà" },
  { value: "SPICE", key: "type_spice", label: "Gia vị" },
  { value: "FRUIT", key: "type_fruit", label: "Trái cây" },
  { value: "HANDICRAFT", key: "type_handicraft", label: "Sản phẩm thủ công" },
];

function getTypeLabel(value: string, t: Translator) {
  const option = TYPE_OPTIONS.find((item) => item.value === value);
  return option ? t("localSpecialty", option.key, option.label) : value;
}

function getRegionLabel(value: string, t: Translator) {
  if (value === "north") return t("localSpecialty", "region_north", "Miền Bắc");
  if (value === "central") return t("localSpecialty", "region_central", "Miền Trung");
  if (value === "south") return t("localSpecialty", "region_south", "Miền Nam");
  return t("localSpecialty", "region_other", "Khác / chưa phân loại");
}

export function LocalSpecialtyExplorer({ specialties }: LocalSpecialtyExplorerProps) {
  const { t, href } = useI18n();
  const contactLabel = t("localSpecialty", "price_contact", "Liên hệ");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [type, setType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const items = useMemo(
    () => specialties.map((item) => ({ ...item, region: getRegion(item.destinationName) })),
    [specialties],
  );

  const regions = useMemo(() => {
    const values: string[] = REGION_RULES.map((item) => item.value);
    if (items.some((item) => item.region === "other")) {
      values.push("other");
    }
    return values;
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    return items.filter((item) => {
      const searchableText = normalizeText(
        [
          item.name,
          item.description || "",
          item.destinationName,
          item.whereToBuy || "",
        ].join(" "),
      );

      return (
        (!normalizedQuery || searchableText.includes(normalizedQuery)) &&
        (region === "all" || item.region === region) &&
        (type === "all" || item.type === type)
      );
    });
  }, [items, query, region, type]);

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = filteredItems.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const paginationItems: Array<number | "ellipsis"> = [];
  if (totalPages <= 5) {
    paginationItems.push(...Array.from({ length: totalPages }, (_, index) => index + 1));
  } else {
    paginationItems.push(1);

    if (safePage > 3) {
      paginationItems.push("ellipsis");
    }

    const startPage = Math.max(2, safePage - 1);
    const endPage = Math.min(totalPages - 1, safePage + 1);
    for (let page = startPage; page <= endPage; page += 1) {
      paginationItems.push(page);
    }

    if (safePage < totalPages - 2) {
      paginationItems.push("ellipsis");
    }

    paginationItems.push(totalPages);
  }

  const resetFilters = () => {
    setQuery("");
    setRegion("all");
    setType("all");
    setCurrentPage(1);
  };

  function addSpecialtyToCart(item: SpecialtyItem) {
    addCartItem({
      id: `specialty:${item.slug}`,
      slug: item.slug,
      name: item.name,
      seller: item.destinationName || "Sơn La Food",
      note: item.description || item.whereToBuy || "Sản phẩm đặc sản Sơn La",
      image: item.imageUrl || "",
      price: item.priceValue ?? 0,
      priceText: formatProductPrice(item.priceValue, item.priceUnit, item.priceText, contactLabel),
      type: "specialty",
    });
  }

  return (
    <section className="section-shell specialty-explorer" id="specialty-list">
      <div className="specialty-heading">
        <div>
          <p className="eyebrow">{t("localSpecialty", "explorer_eyebrow", "Tìm theo vùng miền")}</p>
          <h2>{t("localSpecialty", "explorer_title", "Chọn hương vị bạn muốn khám phá")}</h2>
        </div>
        <p>{t("localSpecialty", "explorer_copy", "Tìm nhanh đặc sản theo tên, tỉnh thành, vùng miền hoặc nhóm sản phẩm.")}</p>
      </div>

      <div className="specialty-filter-panel">
        <label className="specialty-search-field">
          <span>{t("localSpecialty", "search_label", "Tìm kiếm")}</span>
          <input
            type="search"
            value={query}
            placeholder={t("localSpecialty", "search_placeholder", "Ví dụ: nem chua, Đà Lạt...")}
            onChange={(event) => {
              setQuery(event.target.value);
              setCurrentPage(1);
            }}
          />
        </label>

        <label className="specialty-filter-field">
          <span>{t("localSpecialty", "region_label", "Vùng miền")}</span>
          <select
            value={region}
            onChange={(event) => {
              setRegion(event.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">{t("localSpecialty", "all_regions", "Tất cả vùng miền")}</option>
            {regions.map((value) => (
              <option value={value} key={value}>
                {getRegionLabel(value, t)}
              </option>
            ))}
          </select>
        </label>

        <label className="specialty-filter-field">
          <span>{t("localSpecialty", "type_label", "Nhóm đặc sản")}</span>
          <select
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">{t("localSpecialty", "all_types", "Tất cả nhóm")}</option>
            {TYPE_OPTIONS.filter((option) => items.some((item) => item.type === option.value)).map((option) => (
              <option value={option.value} key={option.value}>{t("localSpecialty", option.key, option.label)}</option>
            ))}
          </select>
        </label>

        <button type="button" onClick={resetFilters}>
          {t("localSpecialty", "reset_filters", "Xóa lọc")}
        </button>
      </div>

      <div className="specialty-result-bar">
        <span>{filteredItems.length} {t("localSpecialty", "matching_suffix", "mục phù hợp")}</span>
        <strong>
          {region === "all" ? t("localSpecialty", "all_regions", "Tất cả vùng miền") : getRegionLabel(region, t)}
        </strong>
      </div>

      {filteredItems.length > 0 ? (
        <>
          <div className="offer-grid specialty-grid">
            {paginatedItems.map((item) => (
              <article className="offer-card" key={item.id}>
                <Link
                  href={href(`/dac-san/${item.slug}`)}
                  className="offer-image"
                  style={{ backgroundImage: backgroundWithFallback(item.imageUrl) }}
                  aria-label={`${t("localSpecialty", "view_detail", "Xem chi tiết")}: ${item.name}`}
                >
                  <span>{getTypeLabel(item.type, t)}</span>
                </Link>
                <div className="offer-body">
                  <p className="specialty-location">{item.destinationName || getRegionLabel(item.region, t)}</p>
                  <h2><Link href={href(`/dac-san/${item.slug}`)}>{item.name}</Link></h2>
                  <p>{item.description}</p>
                  <div className="offer-footer">
                    <strong>{formatProductPrice(item.priceValue, item.priceUnit, item.priceText, contactLabel)}</strong>
                    <button
                      suppressHydrationWarning
                      type="button"
                      className="offer-cart-button"
                      onClick={() => addSpecialtyToCart(item)}
                      aria-label={t("localSpecialty", "add_to_cart_named", "Thêm {name} vào giỏ hàng").replace("{name}", item.name)}
                      title={t("localSpecialty", "add_to_cart", "Thêm vào giỏ hàng")}
                    >
                      <span className="cart-icon" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 ? (
            <nav className="specialty-pagination" aria-label={t("localSpecialty", "pagination_label", "Trang danh sách đặc sản")}>
              <button
                type="button"
                className="specialty-pagination-arrow"
                aria-label={t("common", "previous_page", "Trang trước")}
                title={t("common", "previous_page", "Trang trước")}
                disabled={safePage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                <span aria-hidden="true">{"‹"}</span>
              </button>

              <div className="specialty-pagination-pages">
                {paginationItems.map((item, index) =>
                  item === "ellipsis" ? (
                    <span className="specialty-pagination-ellipsis" aria-hidden="true" key={"ellipsis-" + index}>
                      {"…"}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={safePage === item ? "active" : ""}
                      aria-current={safePage === item ? "page" : undefined}
                      onClick={() => setCurrentPage(item)}
                      key={item}
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>

              <button
                type="button"
                className="specialty-pagination-arrow"
                aria-label={t("common", "next_page", "Trang sau")}
                title={t("common", "next_page", "Trang sau")}
                disabled={safePage === totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              >
                <span aria-hidden="true">{"›"}</span>
              </button>
            </nav>
          ) : null}
        </>
      ) : (
        <div className="specialty-empty-state">
          <h3>{t("localSpecialty", "empty_title", "Không tìm thấy đặc sản phù hợp")}</h3>
          <p>{t("localSpecialty", "empty_copy", "Hãy thử từ khóa hoặc vùng miền khác.")}</p>
          <button type="button" onClick={resetFilters}>
            {t("localSpecialty", "reset_filters", "Xóa lọc")}
          </button>
        </div>
      )}
    </section>
  );
}
