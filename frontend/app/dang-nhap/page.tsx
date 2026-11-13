import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";
import { getPageTranslator } from "@/lib/i18n/pageCopy";
import { SiteHeader } from "../components/SiteHeader";
import { AuthClient } from "../components/AuthClient";

export async function generateMetadata(): Promise<Metadata> {
  const { tr } = await getPageTranslator("pageLogin");
  return publicPageMetadata({
    title: tr("meta_title", "Đăng nhập tài khoản"),
    description: tr("meta_description", "Đăng nhập tài khoản khách hàng Sơn La Food để lưu thông tin nhận hàng và theo dõi đơn hàng."),
    path: "/dang-nhap",
  });
}

export default async function Page() {
  const { tr } = await getPageTranslator("pageLogin");
  return (
    <main className="account-page">
      <SiteHeader variant="hero" />
      <section className="page-hero account-hero">
        <p className="eyebrow">{tr("eyebrow", "Tài khoản khách hàng")}</p>
        <h1>{tr("title", "Đăng nhập để mua đặc sản thuận tiện hơn.")}</h1>
        <p>{tr("copy", "Lưu thông tin nhận hàng, đặt combo đặc sản và theo dõi trạng thái đơn hàng.")}</p>
      </section>
      <AuthClient mode="login" />
    </main>
  );
}
