import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";
import { headers } from "next/headers";
import { PageDisabled } from "../components/PageDisabled";
import { SiteHeader } from "../components/SiteHeader";
import { PackageExplorer } from "../components/PackageExplorer";
import { LocalSpecialtyExplorer } from "../components/LocalSpecialtyExplorer";
import { isSitePageInactive } from "@/lib/siteSettings";
import { normalizeLocale } from "@/lib/i18n/config";
import { getStaticTranslationMap, translateFromMap } from "@/lib/i18n/server";
import { getPageTranslator } from "@/lib/i18n/pageCopy";
import { destinations } from "../data/food";
import { getPublicPackageCollections, getPublicPackages } from "@/lib/packages";
import { getPublicSpecialties } from "@/lib/publicContent";
import { ensureFullProductCollections } from "@/lib/productCategoryCollections";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { tr } = await getPageTranslator("localSpecialty");
  return publicPageMetadata({
    title: tr("meta_title", "Đặc sản Sơn La, quà biếu Tây Bắc & hương vị bản địa"),
    description: tr("meta_description", "Khám phá đặc sản Sơn La, quà biếu Tây Bắc, thịt gác bếp, chẩm chéo, chè Shan tuyết và nông sản theo mùa."),
    path: "/dac-san",
  });
}


export default async function LocalSpecialtiesPage() {
  if (await isSitePageInactive("page_local_specialties_status")) {
    return <PageDisabled pageName="Đặc sản Sơn La" />;
  }

  const locale = normalizeLocale((await headers()).get("x-locale"));
  const translations = await getStaticTranslationMap(locale).catch(() => ({}));
  const t = (namespace: string, key: string, fallback: string) => translateFromMap(translations, namespace, key, fallback);

  const [packages, rawCollections, { specialties }] = await Promise.all([
    getPublicPackages(locale),
    getPublicPackageCollections(locale),
    getPublicSpecialties(locale),
  ]);
  const collections = ensureFullProductCollections(rawCollections, packages);


  return (
    <main className="specialty-page">
      <SiteHeader variant="hero" />
      <section className="page-hero offers-hero" style={{ backgroundImage: "linear-gradient(90deg, rgba(10, 20, 17, 0.78), rgba(10, 20, 17, 0.26)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=85&w=1800')" }}>
        <p className="eyebrow">{t("localSpecialty", "hero_eyebrow", "Đặc sản Sơn La")}</p>
        <h1>{t("localSpecialty", "hero_title", "Tinh hoa Tây Bắc qua từng món ngon Sơn La.")}</h1>
        <p>{t("localSpecialty", "hero_copy", "Khám phá các món đặc sản Sơn La, nơi lưu giữ hương vị núi rừng, gia vị bản địa và câu chuyện bếp nhà Tây Bắc.")}</p>
      </section>

      <PackageExplorer packages={packages} collections={collections} destinations={destinations} />

      {/* Từng sản phẩm đặc sản, mỗi thẻ dẫn tới /dac-san/[slug] */}
      {specialties.length > 0 ? <LocalSpecialtyExplorer specialties={specialties} /> : null}

    </main>
  );
}
