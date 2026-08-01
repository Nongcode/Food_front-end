import { publicPageMetadata } from "@/lib/seo";
import { headers } from "next/headers";
import { PageDisabled } from "../components/PageDisabled";
import { SiteHeader } from "../components/SiteHeader";
import { PackageExplorer } from "../components/PackageExplorer";
import { isSitePageInactive } from "@/lib/siteSettings";
import { normalizeLocale } from "@/lib/i18n/config";
import { getStaticTranslationMap, translateFromMap } from "@/lib/i18n/server";
import { destinations } from "../data/travel";
import { getPublicPackageCollections, getPublicPackages } from "@/lib/packages";
import { ensureFullProductCollections } from "@/lib/productCategoryCollections";

export const dynamic = "force-dynamic";

export const metadata = publicPageMetadata({
  title: "Đặc sản Sơn La, quà biếu Tây Bắc & hương vị bản địa | Sơn La Food",
  description: "Khám phá đặc sản Sơn La, quà biếu Tây Bắc, thịt gác bếp, chẩm chéo, chè Shan tuyết và nông sản theo mùa.",
  path: "/dac-san",
});


export default async function LocalSpecialtiesPage() {
  if (await isSitePageInactive("page_local_specialties_status")) {
    return <PageDisabled pageName="Đặc sản Sơn La" />;
  }

  const locale = normalizeLocale((await headers()).get("x-locale"));
  const translations = await getStaticTranslationMap(locale).catch(() => ({}));
  const t = (namespace: string, key: string, fallback: string) => translateFromMap(translations, namespace, key, fallback);

  const [packages, rawCollections] = await Promise.all([
    getPublicPackages(locale),
    getPublicPackageCollections(locale),
  ]);
  const collections = ensureFullProductCollections(rawCollections, packages);


  return (
    <main className="specialty-page">
      <SiteHeader variant="hero" />
      <section className="page-hero offers-hero" style={{ backgroundImage: "linear-gradient(90deg, rgba(10, 20, 17, 0.78), rgba(10, 20, 17, 0.26)), url('https://images.unsplash.com/photo-1555931202-3c1a7042fbd1?auto=format&fit=crop&q=80&w=1600')" }}>
        <p className="eyebrow">{t("localSpecialty", "hero_eyebrow", "Đặc sản Sơn La")}</p>
        <h1>{t("localSpecialty", "hero_title", "Tinh hoa Tây Bắc qua từng món ngon Sơn La.")}</h1>
        <p>{t("localSpecialty", "hero_copy", "Khám phá các món đặc sản Sơn La, nơi lưu giữ hương vị núi rừng, gia vị bản địa và câu chuyện bếp nhà Tây Bắc.")}</p>
      </section>

      <PackageExplorer packages={packages} collections={collections} destinations={destinations} />

    </main>
  );
}
