export type SiteMenuLocation = "header" | "footer";

export type SiteMenuItem = {
  id: number;
  label: string;
  url: string;
  order: number;
  location: SiteMenuLocation;
  translationKey?: string;
  settingKey?: string;
};

export type HeaderSiteConfig = {
  logoUrl: string;
  logoAlt: string;
  companyName: string;
  menu: SiteMenuItem[];
};

export type FooterSiteConfig = {
  brandName: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  facebook: string;
  instagram: string;
  twitter: string;
  copyright: string;
  menu: SiteMenuItem[];
};

export type SiteChromeConfig = {
  header: HeaderSiteConfig;
  footer: FooterSiteConfig;
};

export const SITE_LOGO_PATH = "/sonla-logo-readable.png";

const LEGACY_LOGO_MARKERS = [
  "vietvista-logo",
  "logo-1784804267099-cda8540c",
  "sonla-food-logo",
  "sonla-food.png",
  "sonla.png",
  "sonla-logo-clean",
];

export function getPublicLogoUrl(logoUrl?: string | null) {
  if (!logoUrl) return SITE_LOGO_PATH;

  const normalizedLogoUrl = logoUrl.toLowerCase();
  if (LEGACY_LOGO_MARKERS.some((marker) => normalizedLogoUrl.includes(marker))) {
    return SITE_LOGO_PATH;
  }

  return logoUrl;
}

export function normalizeSiteChromeConfig(config: SiteChromeConfig = DEFAULT_SITE_CHROME_CONFIG): SiteChromeConfig {
  return {
    ...config,
    header: {
      ...config.header,
      logoUrl: getPublicLogoUrl(config.header.logoUrl),
      logoAlt: config.header.logoAlt || "Sơn La Food",
    },
  };
}
export const DEFAULT_HEADER_MENU: SiteMenuItem[] = [
  { id: -1, label: "Trang chủ", url: "/", order: 1, location: "header", translationKey: "home", settingKey: "page_home_status" },
  { id: -2, label: "Combo đặc sản", url: "/combo-dac-san", order: 2, location: "header", translationKey: "packages", settingKey: "page_tours_status" },
  { id: -3, label: "Sản phẩm đặc sản", url: "/dac-san", order: 3, location: "header", translationKey: "local_specialty", settingKey: "page_local_specialties_status" },
  { id: -4, label: "Câu chuyện ẩm thực", url: "/tin-tuc", order: 4, location: "header", translationKey: "news", settingKey: "page_news_status" },
  { id: -5, label: "Liên hệ", url: "/lien-he", order: 5, location: "header", translationKey: "contact", settingKey: "page_contact_status" },
];

export const DEFAULT_FOOTER_MENU: SiteMenuItem[] = [
  { id: -101, label: "Trang chủ", url: "/", order: 1, location: "footer", translationKey: "home", settingKey: "page_home_status" },
  { id: -102, label: "Combo đặc sản", url: "/combo-dac-san", order: 2, location: "footer", translationKey: "packages", settingKey: "page_tours_status" },
  { id: -103, label: "Sản phẩm đặc sản", url: "/dac-san", order: 3, location: "footer", translationKey: "local_specialty", settingKey: "page_local_specialties_status" },
  { id: -104, label: "Câu chuyện ẩm thực", url: "/tin-tuc", order: 4, location: "footer", translationKey: "news", settingKey: "page_news_status" },
  { id: -105, label: "Liên hệ", url: "/lien-he", order: 5, location: "footer", translationKey: "contact", settingKey: "page_contact_status" },
  { id: -106, label: "Admin", url: "/admin", order: 6, location: "footer", translationKey: "admin" },
];

export const DEFAULT_SITE_CHROME_CONFIG: SiteChromeConfig = {
  header: {
    logoUrl: SITE_LOGO_PATH,
    logoAlt: "Sơn La Food",
    companyName: "Sơn La Food",
    menu: DEFAULT_HEADER_MENU,
  },
  footer: {
    brandName: "Sơn La Food",
    description: "Sơn La Food giới thiệu đặc sản Sơn La, quà tặng Tây Bắc và những hương vị bản địa được tuyển chọn.",
    address: "Thành phố Sơn La, Sơn La",
    phone: "0900 123 456",
    email: "hello@sonlafood.vn",
    facebook: "",
    instagram: "",
    twitter: "",
    copyright: "© 2026 Sơn La Food. All rights reserved.",
    menu: DEFAULT_FOOTER_MENU,
  },
};

const MENU_METADATA_BY_URL: Record<string, Pick<SiteMenuItem, "translationKey" | "settingKey">> = {
  "/": { translationKey: "home", settingKey: "page_home_status" },
  "/combo-dac-san": { translationKey: "packages", settingKey: "page_tours_status" },
  "/dac-san": { translationKey: "local_specialty", settingKey: "page_local_specialties_status" },
  "/tin-tuc": { translationKey: "news", settingKey: "page_news_status" },
  "/lien-he": { translationKey: "contact", settingKey: "page_contact_status" },
  "/admin": { translationKey: "admin" },
};

export function decorateSiteMenuItem(item: Omit<SiteMenuItem, "translationKey" | "settingKey">): SiteMenuItem {
  return { ...item, ...MENU_METADATA_BY_URL[item.url] };
}