import { publicPageMetadata } from "@/lib/seo";
import { SiteHeader } from "../components/SiteHeader";
import { CartClient } from "../components/CartClient";

export const metadata = publicPageMetadata({
  title: "Giỏ hàng đặc sản Sơn La | Sơn La Food",
  description: "Kiểm tra các combo, sản phẩm đặc sản Sơn La đã chọn và gửi yêu cầu tư vấn đặt hàng.",
  path: "/gio-hang",
});

export default function CartPage() {
  return (
    <main className="cart-page">
      <SiteHeader variant="hero" />
      <section className="page-hero cart-hero-banner">
        <p className="eyebrow">Giỏ hàng Sơn La Food</p>
        <h1>Kiểm tra món ngon trước khi gửi yêu cầu đặt hàng.</h1>
        <p>
          Rà lại combo, sản phẩm đặc sản, số lượng và chi phí dự kiến trước khi gửi yêu cầu tư vấn. Đơn demo sẽ được xác nhận lại theo mùa vụ và tồn kho thực tế.
        </p>
      </section>
      <CartClient />
    </main>
  );
}