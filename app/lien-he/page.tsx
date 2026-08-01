import { publicPageMetadata } from "@/lib/seo";
import Image from "next/image";
import { headers } from "next/headers";
import { LeadForm } from "../components/LeadForm";
import { ReviewsHeader } from "../components/ReviewsHeader";
import { ReviewCarousel } from "../components/ReviewCarousel";
import { SiteHeader } from "../components/SiteHeader";
import { normalizeLocale } from "@/lib/i18n/config";
import { getStaticTranslationMap, translateFromMap } from "@/lib/i18n/server";
import { getPublicPackages } from "@/lib/packages";
import { getPublicReviews } from "@/lib/publicContent";
import { isSitePageInactive } from "@/lib/siteSettings";
import { PageDisabled } from "../components/PageDisabled";

export const dynamic = "force-dynamic";
export const metadata = publicPageMetadata({
  title: "Liên hệ đặt hàng đặc sản Sơn La | Sơn La Food",
  description: "Liên hệ Sơn La Food để đặt số lượng lớn, custom set quà tặng riêng, nhận tư vấn đặc sản Sơn La theo ngân sách và thời gian giao hàng.",
  path: "/lien-he",
});

export default async function ContactPage() {
  if (await isSitePageInactive("page_contact_status")) {
    return <PageDisabled pageName="Liên hệ" />;
  }

  const locale = normalizeLocale((await headers()).get("x-locale"));
  const translations = await getStaticTranslationMap(locale).catch(() => ({}));
  const t = (namespace: string, key: string, fallback: string) => translateFromMap(translations, namespace, key, fallback);

  const { reviews: reviewItems } = await getPublicReviews(locale);

  const packages = await getPublicPackages(locale);
  const packageNames = packages.map((p) => p.name);

  return (
    <main>
      <SiteHeader variant="hero" />

      <section className="contact-hero">
        <div className="contact-hero-copy">
          <p className="eyebrow">{t("contact", "hero_eyebrow", "Liên hệ tư vấn")}</p>
          <h1>{t("contact", "hero_title", "Đặt hàng số lượng lớn hoặc custom set quà tặng riêng.")}</h1>
          <p>{t("contact", "hero_copy", "Cho chúng tôi biết món bạn quan tâm, số lượng, ngân sách, dịp tặng và khu vực nhận hàng. Đội ngũ sẽ liên hệ lại để gợi ý set phù hợp, báo giá và cách đóng gói thực tế.")}</p>
        </div>
      </section>

      <section className="contact-info-band">
        <article>
          <span>01</span>
          <h2>{t("contact", "card1_title", "Phản hồi trong 24h")}</h2>
          <p>{t("contact", "card1_copy", "Đội ngũ tư vấn sẽ liên hệ qua email hoặc số điện thoại bạn để lại.")}</p>
        </article>
        <article>
          <span>02</span>
          <h2>{t("contact", "card2_title", "Combo linh hoạt")}</h2>
          <p>{t("contact", "card2_copy", "Gợi ý có thể điều chỉnh theo khẩu vị, ngân sách và số lượng.")}</p>
        </article>
        <article>
          <span>03</span>
          <h2>{t("contact", "card3_title", "Không cần thanh toán online")}</h2>
          <p>{t("contact", "card3_copy", "Website chỉ thu thập thông tin liên hệ để tư vấn và xác nhận nhu cầu.")}</p>
        </article>
      </section>

      <section className="contact-form-section">
        <div className="contact-form-wrapper">
          <div className="contact-form-header">
            <h2>{t("contact", "form_title", "Gửi yêu cầu đặt hàng linh hoạt")}</h2>
            <p>{t("contact", "form_copy", "Dành cho khách muốn mua số lượng lớn, phối set quà riêng, đặt theo ngân sách hoặc cần tư vấn sản phẩm chưa có sẵn trên website.")}</p>
          </div>

          <div className="contact-form-content">
            <div className="contact-form-container">
              <LeadForm packages={packageNames} />
            </div>

            <div className="contact-form-image">
              <Image
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80"
                alt="Sơn La Food"
                width={720}
                height={720}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="reviews-section section-shell">
        <ReviewsHeader
          eyebrow={t("home", "reviews_eyebrow", "Đánh giá từ khách hàng")}
          destinations={packageNames}
        />
        {reviewItems.length > 0 && <ReviewCarousel reviews={reviewItems} />}
      </section>
    </main>
  );
}