"use client";

import { useMemo, useState } from "react";
import { useI18n } from "./I18nProvider";
import { PackageCard } from "./PackageCard";

type SpecialtyPackage = {
  id: number;
  slug: string;
  name: string;
  destination: string;
  duration: string;
  price: string;
  summary: string;
  image: string;
  status: string;
};

type PackageCollection = {
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  key?: string;
  items: SpecialtyPackage[];
};

type PackageExplorerProps = {
  packages: SpecialtyPackage[];
  collections: PackageCollection[];
  destinations: string[];
  initialGroup?: string;
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/Ä‘/g, "d")
    .replace(/Ä/g, "d")
    .replace(/Ãƒâ€žÃ¢â‚¬Ëœ/g, "d");
}

function getDurationDays(duration: string) {
  const match = duration.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function getPriceInMillions(price: string) {
  const match = price.match(/[\d.]+/);
  if (!match) return 0;
  return Number(match[0].replace(/\./g, "")) / 1000000;
}

const collectionLabels: Record<string, { tab: string; title: string }> = {
  family: { tab: "Gia đình", title: "Món ngon dùng hằng ngày" },
  youth: { tab: "Đồ ăn chia sẻ", title: "Món nhỏ gọn cho bạn bè" },
  vietnam: { tab: "Đặc sản tiêu biểu", title: "Hương vị Sơn La nên thử" },
  gift: { tab: "Quà biếu", title: "Set quà chỉn chu theo dịp" },
  spice: { tab: "Gia vị", title: "Mắc khén, chẩm chéo và đồ chấm" },
  fruit: { tab: "Nông sản mùa vụ", title: "Trái cây và sản phẩm theo mùa" },
};

function getCollectionDisplayLabel(collection: PackageCollection) {
  return collectionLabels[collection.accent]?.tab || collection.eyebrow;
}

function getCollectionDisplayTitle(collection: PackageCollection) {
  return collectionLabels[collection.accent]?.title || collection.title;
}

export function PackageExplorer({ packages, collections, destinations, initialGroup }: PackageExplorerProps) {
  const { t } = useI18n();
  const hasInitialGroup = collections.some((collection) => (collection.key || collection.accent) === initialGroup);
  const initialTab = hasInitialGroup && initialGroup ? initialGroup : "all";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [query, setQuery] = useState("");
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const durationOptions = [
    { value: "", label: t("packages", "duration_all", "Mọi thời gian") },
    { value: "short", label: t("packages", "duration_short", "1 - 2 ngày") },
    { value: "medium", label: t("packages", "duration_medium", "2 - 4 ngày") },
    { value: "long", label: t("packages", "duration_long", "Đặt trước / theo mùa") },
  ];

  const budgetOptions = [
    { value: "", label: t("packages", "budget_all", "Mọi ngân sách") },
    { value: "under5", label: t("packages", "budget_under5", "Dưới 500.000đ") },
    { value: "5to7", label: t("packages", "budget_5to7", "500.000đ - 900.000đ") },
    { value: "over7", label: t("packages", "budget_over7", "Trên 900.000đ") },
  ];

  const activeCollection = collections.find((collection) => (collection.key || collection.accent) === activeTab);
  const basePackages = activeCollection ? activeCollection.items : packages;
  const normalizedQuery = normalizeText(query.trim());

  const filteredPackages = useMemo(() => {
    return basePackages.filter((item) => {
      const searchableText = normalizeText(`${item.name} ${item.destination} ${item.summary}`);
      const itemDays = getDurationDays(item.duration);
      const itemPrice = getPriceInMillions(item.price);

      const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
      const matchesDestination = !destination || item.destination === destination;
      const matchesDuration =
        !duration ||
        (duration === "short" && itemDays > 0 && itemDays <= 2) ||
        (duration === "medium" && itemDays >= 2 && itemDays <= 4) ||
        (duration === "long" && itemDays === 0);
      const matchesBudget =
        !budget ||
        (budget === "under5" && itemPrice < 0.5) ||
        (budget === "5to7" && itemPrice >= 0.5 && itemPrice <= 0.9) ||
        (budget === "over7" && itemPrice > 0.9);

      return matchesQuery && matchesDestination && matchesDuration && matchesBudget;
    });
  }, [basePackages, budget, destination, duration, normalizedQuery]);

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredPackages.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPackages = filteredPackages.slice((safePage - 1) * pageSize, safePage * pageSize);

  const paginationItems: Array<number | "ellipsis"> = [];
  if (totalPages <= 5) {
    paginationItems.push(...Array.from({ length: totalPages }, (_, index) => index + 1));
  } else {
    paginationItems.push(1);
    if (safePage > 3) paginationItems.push("ellipsis");
    const startPage = Math.max(2, safePage - 1);
    const endPage = Math.min(totalPages - 1, safePage + 1);
    for (let page = startPage; page <= endPage; page += 1) paginationItems.push(page);
    if (safePage < totalPages - 2) paginationItems.push("ellipsis");
    paginationItems.push(totalPages);
  }

  const resetFilters = () => {
    setQuery("");
    setDestination("");
    setDuration("");
    setBudget("");
    setCurrentPage(1);
  };

  return (
    <section className="package-finder" id="package-finder">
      <div className="package-finder-heading">
        <div>
          <p className="eyebrow">{t("packages", "marketplace_finder_eyebrow", "Tìm sản phẩm phù hợp")}</p>
          <h2>{t("packages", "marketplace_finder_title", "Lọc nhanh đặc sản theo nhu cầu")}</h2>
        </div>
        <p>{t("packages", "marketplace_finder_copy", "Chọn nhóm sản phẩm, vùng đặc sản, thời gian giao hoặc ngân sách để xem từng món và set gợi ý phù hợp.")}</p>
      </div>

      <div className="package-filter-panel">
        <form className="package-search-form" onSubmit={(event) => event.preventDefault()}>
          <label className="search-field wide-field">
            {t("packages", "keyword", "Từ khóa")}
            <input
              suppressHydrationWarning
              value={query}
              onChange={(event) => { setQuery(event.target.value); setCurrentPage(1); }}
              placeholder={t("packages", "keyword_placeholder", "Ví dụ: thịt gác bếp, chẩm chéo...")}
              type="search"
            />
          </label>
          <label className="search-field">
            {t("packages", "destination", "Vùng đặc sản")}
            <select suppressHydrationWarning value={destination} onChange={(event) => { setDestination(event.target.value); setCurrentPage(1); }}>
              <option value="">{t("packages", "all_destinations", "Tất cả vùng đặc sản")}</option>
              {destinations.map((item) => (
                <option value={item} key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="search-field">
            {t("packages", "duration", "Thời gian giao")}
            <select suppressHydrationWarning value={duration} onChange={(event) => { setDuration(event.target.value); setCurrentPage(1); }}>
              {durationOptions.map((item) => (
                <option value={item.value} key={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <label className="search-field">
            {t("packages", "budget", "Ngân sách")}
            <select suppressHydrationWarning value={budget} onChange={(event) => { setBudget(event.target.value); setCurrentPage(1); }}>
              {budgetOptions.map((item) => (
                <option value={item.value} key={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <button suppressHydrationWarning type="button" onClick={resetFilters}>
            {t("packages", "reset_filters", "Xóa lọc")}
          </button>
        </form>

        <div className="package-tab-list" aria-label={t("packages", "marketplace_filter_by_group", "Lọc theo danh mục sản phẩm")}>
          <button
            suppressHydrationWarning
            className={activeTab === "all" ? "active" : ""}
            type="button"
            onClick={() => { setActiveTab("all"); setCurrentPage(1); }}
          >
            {t("packages", "marketplace_all_products", "Tất cả sản phẩm")}
          </button>
          {collections.map((collection, index) => (
            <button
              suppressHydrationWarning
              className={activeTab === (collection.key || collection.accent) ? "active" : ""}
              type="button"
              key={collection.key || `${collection.accent}-${index}`}
              onClick={() => { setActiveTab(collection.key || collection.accent); setCurrentPage(1); }}
            >
              {getCollectionDisplayLabel(collection)}
            </button>
          ))}
        </div>
      </div>

      <div className="package-result-bar">
        <span>{filteredPackages.length} {t("packages", "marketplace_matching_suffix", "sản phẩm phù hợp")}</span>
        <strong>{activeCollection ? getCollectionDisplayTitle(activeCollection) : t("packages", "marketplace_all_available", "Tất cả sản phẩm đang có")}</strong>
      </div>

      {filteredPackages.length > 0 ? (
        <>
          <div className="package-grid wide">
            {paginatedPackages.map((item, index) => (
              <PackageCard item={item} key={`${item.slug}-${item.id}-${index}`} />
            ))}
          </div>
          {totalPages > 1 ? (
            <nav className="package-pagination" aria-label="Package pages">
              <button
                type="button"
                className="package-pagination-arrow"
                aria-label={t("packages", "previous_page", "Previous page")}
                title={t("packages", "previous_page", "Previous page")}
                disabled={safePage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                <span aria-hidden="true">‹</span>
              </button>

              <div className="package-pagination-pages">
                {paginationItems.map((item, index) =>
                  item === "ellipsis" ? (
                    <span className="package-pagination-ellipsis" aria-hidden="true" key={`ellipsis-${index}`}>…</span>
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
                className="package-pagination-arrow"
                aria-label={t("packages", "next_page", "Next page")}
                title={t("packages", "next_page", "Next page")}
                disabled={safePage === totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              >
                <span aria-hidden="true">›</span>
              </button>
            </nav>
          ) : null}
        </>
      ) : (
        <div className="empty-package-state">
          <h3>{t("packages", "marketplace_empty_title", "Chưa có sản phẩm trùng bộ lọc")}</h3>
          <p>{t("packages", "marketplace_empty_copy", "Thử đổi vùng đặc sản, thời gian giao hoặc ngân sách để xem thêm món phù hợp.")}</p>
          <button suppressHydrationWarning type="button" onClick={resetFilters}>
            {t("packages", "marketplace_empty_button", "Xem lại tất cả sản phẩm")}
          </button>
        </div>
      )}
    </section>
  );
}