import BannerManagerPage from "../BannerManagerPage";

export default function DetailBannersPage() {
  return (
    <BannerManagerPage
      bannerType="detail"
      heading="Quản lý Banner Chi tiết"
      modalTitle="Thêm Banner Chi tiết"
      description="Banner dùng cho từng trang chi tiết cụ thể, ví dụ một combo đặc sản Sơn La hoặc một bài viết riêng."
      mediaPlaceholder="Ví dụ: /banners/combo-qua-bieu.jpg hoặc /banners/moc-chau-video.mp4"
      linkColumnLabel="URL chi tiết áp dụng"
      linkLabel="URL chi tiết áp dụng"
      linkPlaceholder="Ví dụ: /combo-dac-san/combo-dac-san-son-la"
      linkHelp="Nhập đúng URL chi tiết theo slug, ví dụ /goi-du-lich/{slug} hoặc /tin-tuc/{id}."
    />
  );
}
