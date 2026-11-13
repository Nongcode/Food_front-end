"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "./I18nProvider";
import { DEFAULT_SITE_CHROME_CONFIG } from "@/lib/siteChromeShared";

const FALLBACK_FOOTER_LINKS = [
  { id: "home", label: "Trang chủ", url: "/", translationKey: "home", settingKey: "page_home_status" },
  { id: "packages", label: "Combo đặc sản", url: "/combo-dac-san", translationKey: "packages", settingKey: "page_tours_status" },
  { id: "specialties", label: "Sản phẩm đặc sản", url: "/dac-san", translationKey: "local_specialty", settingKey: "page_local_specialties_status" },
  { id: "stories", label: "Câu chuyện ẩm thực", url: "/tin-tuc", translationKey: "news", settingKey: "page_news_status" },
  { id: "contact", label: "Liên hệ", url: "/lien-he", translationKey: "contact", settingKey: "page_contact_status" },
];

type FooterLink = {
  id: string | number;
  label: string;
  url: string;
  translationKey?: string;
  settingKey?: string;
};

function getPublicFooterLabel(
  item: FooterLink,
  locale: string,
  t: (namespace: string, key: string, fallback: string) => string,
) {
  if (item.url === "/dac-san" && locale === "vi") return "Sản phẩm đặc sản";
  return item.translationKey && locale !== "vi" ? t("nav", item.translationKey, item.label) : item.label;
}
export function SiteFooter() {
  const pathname = usePathname();
  const { locale, t, href, hiddenPageKeys, siteChrome } = useI18n();

  if (pathname?.startsWith("/admin")) return null;

  const publicFooterLinks = siteChrome.footer.menu.filter((item) =>
    item.url !== "/admin" &&
    !item.url.startsWith("/admin/") &&
    (!item.settingKey || !hiddenPageKeys.includes(item.settingKey)),
  );
  const visibleFooterLinks = (publicFooterLinks.length >= 3 ? publicFooterLinks : FALLBACK_FOOTER_LINKS).filter((item) =>
    !item.settingKey || !hiddenPageKeys.includes(item.settingKey),
  );
  const footerDescription = siteChrome.footer.description === DEFAULT_SITE_CHROME_CONFIG.footer.description
    ? t("footer", "description", DEFAULT_SITE_CHROME_CONFIG.footer.description)
    : siteChrome.footer.description;
  const footerCopyright = siteChrome.footer.copyright === DEFAULT_SITE_CHROME_CONFIG.footer.copyright
    ? t("footer", "rights", DEFAULT_SITE_CHROME_CONFIG.footer.copyright)
    : siteChrome.footer.copyright;

  return (
    <footer className="site-footer">
      <div className="footer-main footer-main-three-columns">
        <section className="footer-column footer-brand-column" aria-label={siteChrome.header.companyName}>
          <Link className="footer-brand" href={href("/")} aria-label={siteChrome.header.companyName}>
            <Image src={siteChrome.header.logoUrl} alt={siteChrome.header.logoAlt} width={180} height={118} />
          </Link>
          <p>{footerDescription}</p>
        </section>

        <section className="footer-column footer-menu-column">
          <span className="footer-column-title">Menu trang</span>
          <nav aria-label="Footer navigation">
            {visibleFooterLinks.map((item) => (
              <Link href={item.url.startsWith("/") ? href(item.url) : item.url} key={item.id}>
                {getPublicFooterLabel(item, locale, t)}
              </Link>
            ))}
          </nav>
        </section>

        <section className="footer-column footer-contact-column" aria-label={t("footer", "consult", "Liên hệ tư vấn")}>
          <span className="footer-column-title">{t("footer", "consult", "Liên hệ tư vấn")}</span>
          <div className="footer-contact">
            {siteChrome.footer.address && <span>{siteChrome.footer.address}</span>}
            {siteChrome.footer.email && <a href={`mailto:${siteChrome.footer.email}`}>{siteChrome.footer.email}</a>}
            {siteChrome.footer.phone && <a href={`tel:${siteChrome.footer.phone.replace(/[^+\d]/g, "")}`}>{siteChrome.footer.phone}</a>}
            {siteChrome.footer.facebook && <a href={siteChrome.footer.facebook} target="_blank" rel="noreferrer">Facebook</a>}
            {siteChrome.footer.instagram && <a href={siteChrome.footer.instagram} target="_blank" rel="noreferrer">Instagram</a>}
            {siteChrome.footer.twitter && <a href={siteChrome.footer.twitter} target="_blank" rel="noreferrer">Twitter / X</a>}
          </div>
        </section>
      </div>
      <div className="footer-bottom">
        <span>{footerCopyright}</span>
        <span>Sản phẩm đặc sản & quà tặng Tây Bắc</span>
      </div>
    </footer>
  );
}