import { absoluteUrl, publicPageMetadata } from "@/lib/seo";
import { headers } from "next/headers";
import { isSitePageInactive } from "@/lib/siteSettings";
import { PageDisabled } from "../components/PageDisabled";
import { JsonLd } from "../components/JsonLd";
import { PackageExplorer } from "../components/PackageExplorer";
import { SiteHeader } from "../components/SiteHeader";
import { destinations } from "../data/travel";
import { normalizeLocale } from "@/lib/i18n/config";
import { getStaticTranslationMap, translateFromMap } from "@/lib/i18n/server";
import { getPublicPackageCollections, getPublicPackages } from "@/lib/packages";
import { ensureFullProductCollections } from "@/lib/productCategoryCollections";

type PackagesPageProps = {
  searchParams?: Promise<{
    group?: string | string[];
  }>;
};

export const dynamic = "force-dynamic";
export const metadata = publicPageMetadata({
  title: "Sản phẩm đặc sản Sơn La & set quà Tây Bắc | Sơn La Food",
  description: "Khám phá sản phẩm đặc sản Sơn La theo danh mục, hộ bán, quà biếu Tây Bắc, gia vị, trà và nông sản theo mùa.",
  path: "/goi-du-lich",
});


export default async function PackagesPage({ searchParams }: PackagesPageProps) {
  if (await isSitePageInactive("page_tours_status")) {
    return <PageDisabled pageName="Gian hàng đặc sản" />;
  }

  const locale = normalizeLocale((await headers()).get("x-locale"));
  const params = await searchParams;
  const groupParam = Array.isArray(params?.group) ? params.group[0] : params?.group;
  const translations = await getStaticTranslationMap(locale).catch(() => ({}));
  const t = (namespace: string, key: string, fallback: string) => translateFromMap(translations, namespace, key, fallback);
  const [packages, rawCollections] = await Promise.all([getPublicPackages(locale), getPublicPackageCollections(locale)]);
  const collections = ensureFullProductCollections(rawCollections, packages);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("packages", "marketplace_hero_eyebrow", "Gian hàng đặc sản"),
    url: absoluteUrl("/goi-du-lich"),
    itemListElement: packages.slice(0, 50).map((pkg, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: pkg.name,
      url: absoluteUrl(`/goi-du-lich/${pkg.slug}`),
    })),
  };

  return (
    <main>
      <JsonLd data={itemListJsonLd} />
      <SiteHeader variant="hero" />
      <section className="page-hero packages-hero">
        <p className="eyebrow">{t("packages", "marketplace_hero_eyebrow", "Gian hàng đặc sản")}</p>
        <h1>{t("packages", "marketplace_hero_title", "Đặc sản Sơn La theo danh mục, dễ chọn từng món")}</h1>
        <p>{t("packages", "marketplace_hero_copy", "Duyệt sản phẩm theo nhóm, vùng đặc sản và ngân sách. Các set combo vẫn được giữ như gợi ý nhanh cho quà biếu hoặc mua thử.")}</p>
      </section>

      <PackageExplorer key={groupParam || "all"} packages={packages} collections={collections} destinations={destinations} initialGroup={groupParam} />
    </main>
  );
}
