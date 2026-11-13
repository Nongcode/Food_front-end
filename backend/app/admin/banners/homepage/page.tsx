import BannerManagerPage from "../BannerManagerPage";

export default function HomepageBannersPage() {
  return (
    <BannerManagerPage
      bannerType="homepage"
      heading="Quản lý Banner Trang chủ"
      modalTitle="Thêm Banner Trang chủ"
      description="Thiết lập ảnh hoặc video hero xuất hiện ở đầu trang chủ Sơn La Food."
      mediaPlaceholder="Ví dụ: https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=2200&q=85"
    />
  );
}
