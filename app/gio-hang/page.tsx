import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";
import { getPageTranslator } from "@/lib/i18n/pageCopy";
import { SiteHeader } from "../components/SiteHeader";
import { CartClient } from "../components/CartClient";

export async function generateMetadata(): Promise<Metadata> {
  const { tr } = await getPageTranslator("pageCart");
  return publicPageMetadata({
    title: tr("meta_title", "Giỏ hàng đặc sản Sơn La"),
    description: tr("meta_description", "Kiểm tra các combo, sản phẩm đặc sản Sơn La đã chọn và gửi yêu cầu tư vấn đặt hàng."),
    path: "/gio-hang",
  });
}

export default async function CartPage() {
  const { tr } = await getPageTranslator("pageCart");
  return (
    <main className="cart-page">
      <SiteHeader variant="hero" />
      <section className="page-hero cart-hero-banner">
        <p className="eyebrow">{tr("eyebrow", "Giỏ hàng Sơn La Food")}</p>
        <h1>{tr("title", "Kiểm tra món ngon trước khi gửi yêu cầu đặt hàng.")}</h1>
        <p>{tr("copy", "Rà lại combo, sản phẩm đặc sản, số lượng và chi phí dự kiến trước khi gửi yêu cầu. Đơn hàng sẽ được xác nhận lại theo mùa vụ và tồn kho thực tế.")}</p>
      </section>
      <CartClient />
    </main>
  );
}
