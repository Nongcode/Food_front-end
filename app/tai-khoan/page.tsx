import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";
import { getPageTranslator } from "@/lib/i18n/pageCopy";
import { SiteHeader } from "../components/SiteHeader";
import { ProfileClient } from "../components/ProfileClient";

export async function generateMetadata(): Promise<Metadata> {
  const { tr } = await getPageTranslator("pageAccount");
  return publicPageMetadata({
    title: tr("meta_title", "Hồ sơ khách hàng"),
    description: tr("meta_description", "Quản lý hồ sơ khách hàng, thông tin nhận hàng và đơn hàng đặc sản Sơn La."),
    path: "/tai-khoan",
  });
}

export default async function Page() {
  const { tr } = await getPageTranslator("pageAccount");
  return (
    <main className="account-page">
      <SiteHeader variant="hero" />
      <section className="page-hero account-hero">
        <p className="eyebrow">{tr("eyebrow", "Hồ sơ khách hàng")}</p>
        <h1>{tr("title", "Hồ sơ và đơn hàng của bạn.")}</h1>
        <p>{tr("copy", "Cập nhật thông tin liên hệ, địa chỉ giao hàng và theo dõi trạng thái từng đơn đã đặt.")}</p>
      </section>
      <ProfileClient />
    </main>
  );
}
