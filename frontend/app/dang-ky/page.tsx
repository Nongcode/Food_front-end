import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";
import { getPageTranslator } from "@/lib/i18n/pageCopy";
import { SiteHeader } from "../components/SiteHeader";
import { AuthClient } from "../components/AuthClient";

export async function generateMetadata(): Promise<Metadata> {
  const { tr } = await getPageTranslator("pageRegister");
  return publicPageMetadata({
    title: tr("meta_title", "Đăng ký tài khoản"),
    description: tr("meta_description", "Tạo tài khoản khách hàng trên Sơn La Food để lưu thông tin nhận hàng và đặt combo nhanh hơn."),
    path: "/dang-ky",
  });
}

export default async function Page() {
  const { tr } = await getPageTranslator("pageRegister");
  return (
    <main className="account-page">
      <SiteHeader variant="hero" />
      <section className="page-hero account-hero">
        <p className="eyebrow">{tr("eyebrow", "Tài khoản mới")}</p>
        <h1>{tr("title", "Tạo tài khoản để lưu gu mua hàng của bạn.")}</h1>
        <p>{tr("copy", "Tài khoản giúp khách hàng lưu thông tin cá nhân, địa chỉ nhận hàng và nhu cầu mua đặc sản thường dùng.")}</p>
      </section>
      <AuthClient mode="register" />
    </main>
  );
}
