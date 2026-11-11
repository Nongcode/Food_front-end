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

type PackagesPageProps = {
  searchParams?: Promise<{
    group?: string | string[];
  }>;
};

export const dynamic = "force-dynamic";
export const metadata = publicPageMetadata({
  title: "Combo đặc sản Sơn La & quà biếu Tây Bắc | Sơn La Food",
  description: "Khám phá combo đặc sản Sơn La, quà biếu Tây Bắc, gia vị, trà và nông sản theo mùa với tư vấn đóng gói phù hợp.",
  path: "/goi-du-lich",
});


export default async function PackagesPage({ searchParams }: PackagesPageProps) {
  if (await isSitePageInactive("page_tours_status")) {
    return <PageDisabled pageName="Combo đặc sản" />;
  }

  const locale = normalizeLocale((await headers()).get("x-locale"));
  const params = await searchParams;
  const groupParam = Array.isArray(params?.group) ? params.group[0] : params?.group;
  const translations = await getStaticTranslationMap(locale).catch(() => ({}));
  const t = (namespace: string, key: string, fallback: string) => translateFromMap(translations, namespace, key, fallback);
  const [packages, collections] = await Promise.all([getPublicPackages(locale), getPublicPackageCollections(locale)]);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("packages", "hero_eyebrow", "Combo đặc sản"),
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
        <p className="eyebrow">{t("packages", "hero_eyebrow", "Combo đặc sản")}</p>
        <h1>{t("packages", "hero_title", "Combo đặc sản Sơn La - Gợi ý theo khẩu vị và ngân sách")}</h1>
        <p>{t("packages", "hero_copy", "Mỗi combo là một gợi ý khởi đầu. Hãy cho chúng tôi biết khẩu vị, dịp tặng và ngân sách để phối set phù hợp nhất.")}</p>
      </section>

      <PackageExplorer key={groupParam || "all"} packages={packages} collections={collections} destinations={destinations} initialGroup={groupParam} />
    </main>
  );
}
