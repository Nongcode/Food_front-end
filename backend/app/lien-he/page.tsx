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
import prisma from "@/lib/prisma";
import { isSitePageInactive } from "@/lib/siteSettings";
import { PageDisabled } from "../components/PageDisabled";

export const dynamic = "force-dynamic";
export const metadata = publicPageMetadata({
  title: "Liên hệ tư vấn combo đặc sản | Sơn La Food",
  description: "Liên hệ Sơn La Food để được tư vấn combo đặc sản Sơn La, set quà biếu Tây Bắc và thời gian giao hàng phù hợp.",
  path: "/lien-he",
});

export default async function ContactPage() {
  if (await isSitePageInactive("page_contact_status")) {
    return <PageDisabled pageName="Liên hệ" />;
  }

  const locale = normalizeLocale((await headers()).get("x-locale"));
  const translations = await getStaticTranslationMap(locale).catch(() => ({}));
  const t = (namespace: string, key: string, fallback: string) => translateFromMap(translations, namespace, key, fallback);

  const reviewTranslations: Record<string, Record<string, { comment: string; package: string }>> = {
    "Nguyễn Mai Anh": {
      en: { comment: "Clean packaging, fragrant smoked meat and cham cheo that suited my family very well.", package: "Son La Specialty Trial Set" },
      "zh-CN": { comment: "包装干净，熏肉很香，蘸料很适合家庭口味。", package: "山罗特产尝鲜组合" },
    },
    "Trần Đức Huy": {
      en: { comment: "The gift basket looked polished, advice was quick, and it worked well for business gifting.", package: "Premium Moc Chau Gift Set" },
      "zh-CN": { comment: "礼篮很精致，咨询回复很快，适合商务赠礼。", package: "高端木州礼盒" },
    },
  };

  const dbReviews = await prisma.review.findMany({
    where: { status: "Hiển thị" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const reviewItems = dbReviews.map((review) => ({
    id: review.id,
    customerName: review.customerName,
    packageName: reviewTranslations[review.customerName]?.[locale]?.package || review.packageName,
    rating: review.rating,
    comment: reviewTranslations[review.customerName]?.[locale]?.comment || review.comment,
    avatar: review.avatar,
  }));

  const packages = await getPublicPackages(locale);
  const packageNames = packages.map((p) => p.name);

  return (
    <main>
      <SiteHeader variant="hero" />

      <section className="contact-hero">
        <div className="contact-hero-copy">
          <p className="eyebrow">{t("contact", "hero_eyebrow", "Liên hệ tư vấn")}</p>
          <h1>{t("contact", "hero_title", "Để Sơn La Food gợi ý combo phù hợp cho bạn.")}</h1>
          <p>{t("contact", "hero_copy", "Cho chúng tôi biết món bạn quan tâm, ngân sách, số lượng và thời điểm cần nhận hàng. Đội ngũ sẽ phản hồi với gợi ý thực tế, dễ điều chỉnh.")}</p>
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
            <h2>{t("contact", "form_title", "Gửi yêu cầu tư vấn combo")}</h2>
            <p>{t("contact", "form_copy", "Hãy điền thông tin dưới đây. Sơn La Food sẽ liên hệ lại để gợi ý combo phù hợp với nhu cầu thực tế của bạn.")}</p>
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