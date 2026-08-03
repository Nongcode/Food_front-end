import type { Metadata } from "next";
import { headers } from "next/headers";
import { getPublicSiteChromeState } from "@/lib/publicContent";
import { DEFAULT_SITE_CHROME_CONFIG } from "@/lib/siteChromeShared";
import { DEFAULT_OG_IMAGE, getSiteUrl, indexRobots, SITE_NAME } from "@/lib/seo";
import { normalizeLocale, withLocalePrefix } from "@/lib/i18n/config";
import type { LanguageOption, TranslationMap } from "@/lib/i18n/server";
import { I18nProvider } from "./components/I18nProvider";
import { SiteFooter } from "./components/SiteFooter";
import { CartToast } from "./components/CartToast";
import "./globals.css";


export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: getSiteUrl() }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "food",
  robots: indexRobots,
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  title: {
    template: "%s | Sơn La Food",
    default: "Sơn La Food - Đặc sản Sơn La và quà tặng Tây Bắc",
  },
  description: "Sơn La Food giới thiệu đặc sản Sơn La, combo quà tặng Tây Bắc, thịt gác bếp, chẩm chéo, chè Shan tuyết và trái cây theo mùa.",
  openGraph: {
    title: "Sơn La Food - Đặc sản Sơn La và quà tặng Tây Bắc",
    description: "Sơn La Food giới thiệu đặc sản Sơn La, combo quà tặng Tây Bắc, thịt gác bếp, chẩm chéo, chè Shan tuyết và trái cây theo mùa.",
    url: "/",
    siteName: SITE_NAME,
    locale: "vi_VN",
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sơn La Food - Đặc sản Sơn La và quà tặng Tây Bắc",
    description: "Sơn La Food giới thiệu đặc sản Sơn La, combo quà tặng Tây Bắc, thịt gác bếp, chẩm chéo, chè Shan tuyết và trái cây theo mùa.",
    images: [DEFAULT_OG_IMAGE.url],
  },
};
function DisabledScreen({ locale, title, message, actionLabel }: { locale: string; title: string; message: React.ReactNode; actionLabel?: string }) {
  return (
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full flex flex-col justify-center items-center bg-[#fcf9f2] p-6 text-center">
        <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-inner">
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">{title}</h2>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">{message}</p>
          </div>
          {actionLabel && (
            <div className="pt-2">
              <a href={withLocalePrefix("/", locale)} className="inline-flex px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all">
                {actionLabel}
              </a>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const locale = normalizeLocale(headersList.get("x-locale"));
  const isAdminOrApi = pathname.startsWith("/admin") || pathname.startsWith("/api");

  let isSuspended = false;
  let isPageDisabled = false;
  let disabledPageName = "";
  let staticTranslations: TranslationMap = {};
  let activeLanguages: LanguageOption[] = [];
  let hiddenPageKeys: string[] = [];
  let siteChrome = DEFAULT_SITE_CHROME_CONFIG;

  if (!isAdminOrApi) {
    try {
      const state = await getPublicSiteChromeState(locale);
      hiddenPageKeys = state.hiddenPageKeys || [];
      staticTranslations = state.staticTranslations || {};
      activeLanguages = state.activeLanguages || [];
      siteChrome = state.siteChrome || DEFAULT_SITE_CHROME_CONFIG;

      const settingsMap = state.pageStatuses || {};
      if (state.siteStatus === "suspended") {
        isSuspended = true;
      }

      if (!isSuspended) {
        if (pathname === "/" && settingsMap.page_home_status === "inactive") {
          isPageDisabled = true;
          disabledPageName = "Trang chủ";
        } else if (pathname.startsWith("/combo-dac-san") && settingsMap.page_tours_status === "inactive") {
          isPageDisabled = true;
          disabledPageName = "Combo đặc sản";
        } else if (pathname.startsWith("/tin-tuc") && settingsMap.page_news_status === "inactive") {
          isPageDisabled = true;
          disabledPageName = "Tin tức & Cẩm nang";
        } else if (pathname.startsWith("/lien-he") && settingsMap.page_contact_status === "inactive") {
          isPageDisabled = true;
          disabledPageName = "Liên hệ";
        } else if (pathname.startsWith("/dac-san") && settingsMap.page_local_specialties_status === "inactive") {
          isPageDisabled = true;
          disabledPageName = "Đặc sản";
        }
      }
    } catch (err) {
      console.error("Failed to load public site chrome state:", err);
    }
  }
  if (isSuspended) {
    return <DisabledScreen locale={locale} title="Dịch vụ tạm ngưng hoạt động" message="Website hiện đang tạm ngưng do chưa hoàn tất thủ tục thanh toán hoặc đang bảo trì kỹ thuật." />;
  }

  if (isPageDisabled) {
    return (
      <DisabledScreen
        locale={locale}
        title="Kênh dịch vụ tạm đóng"
        message={<><strong className="text-emerald-700 font-bold">{disabledPageName}</strong> hiện đang tạm đóng để nâng cấp cấu hình hoặc tùy chỉnh nội dung.</>}
        actionLabel="Quay lại Trang chủ"
      />
    );
  }

  return (
    <html lang={locale} suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <I18nProvider locale={locale} translations={staticTranslations} languages={activeLanguages} hiddenPageKeys={hiddenPageKeys} siteChrome={siteChrome}>
          {children}
          <SiteFooter />
          <CartToast />
        </I18nProvider>
      </body>
    </html>
  );
}
