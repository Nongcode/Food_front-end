import { DEFAULT_SITE_CHROME_CONFIG, type SiteChromeConfig } from "@/lib/siteChromeShared";
import { getPublicSiteChromeState } from "@/lib/publicContent";

export const SITE_CHROME_SETTING_KEYS = {
  headerLogoUrl: "header_logo_url",
  headerLogoAlt: "header_logo_alt",
  headerCompanyName: "header_company_name",
  footerBrandName: "footer_brand_name",
  footerDescription: "footer_description",
  footerAddress: "footer_address",
  footerPhone: "footer_phone",
  footerEmail: "footer_email",
  footerFacebook: "footer_facebook",
  footerInstagram: "footer_instagram",
  footerTwitter: "footer_twitter",
  footerCopyright: "footer_copyright",
} as const;

export async function getSiteChromeConfig(locale = "vi"): Promise<SiteChromeConfig> {
  const payload = await getPublicSiteChromeState(locale);
  return (payload.siteChrome as SiteChromeConfig) || DEFAULT_SITE_CHROME_CONFIG;
}

export async function ensureSiteChromeDefaults() {
  return;
}

export async function saveSiteChromeSettings() {
  throw new Error("Site chrome settings are managed by the backend core.");
}