import BannerManagerPage from "../BannerManagerPage";

export default function SubpagesBannersPage() {
  return (
    <BannerManagerPage
      bannerType="subpage"
      heading="Quản lý Banner Trang con"
      modalTitle="Thêm Banner Trang con"
      description="Banner dùng cho các trang con như combo đặc sản, sản phẩm đặc sản, câu chuyện ẩm thực, ưu đãi, liên hệ."
      mediaPlaceholder="Ví dụ: /news-banner.jpg hoặc /banners/subpage-video.mp4"
      linkColumnLabel="Trang áp dụng"
      linkLabel="Trang áp dụng"
      linkPlaceholder="Ví dụ: /goi-du-lich, /lien-he, /tin-tuc, /uu-dai"
      linkHelp="Nhập URL của trang tổng nơi banner này được dùng, không nhập URL chi tiết theo slug."
    />
  );
}
