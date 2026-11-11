// Breadcrumb thanh trên cùng của admin (tách khỏi AdminTopbar để test được)

/** Sự kiện để trang con đặt nhãn cho đoạn cuối breadcrumb (vd. mã đơn thay cho id). detail: AdminBreadcrumbOverride | null */
export const ADMIN_BREADCRUMB_LABEL_EVENT = "admin-breadcrumb-label";

export type AdminBreadcrumbOverride = { path: string; label: string };

const LABELS: Record<string, string> = {
  admin: "Sơn La Food",
  posts: "Bài viết",
  packages: "Combo đặc sản",
  banners: "Banner",
  bookings: "Yêu cầu cũ",
  orders: "Đơn hàng",
  inquiries: "Yêu cầu tư vấn",
  multilingual: "Đa ngôn ngữ",
  interactions: "Tương tác khách hàng",
  system: "Hệ thống",
  categories: "Danh mục",
  offers: "Ưu đãi",
  services: "Chi tiết gói",
  detail: "Chi tiết",
  homepage: "Trang chủ",
  subpages: "Trang con",
  details: "Trang chi tiết",
  languages: "Ngôn ngữ",
  translations: "Bản dịch",
  reviews: "Đánh giá",
  contacts: "Liên hệ",
  customers: "Khách hàng",
  media: "Media",
  seo: "SEO",
  navigation: "Header & Footer",
  settings: "Cài đặt",
  dashboard: "Dashboard",
  control: "Control",
  status: "Trạng thái",
};

export function buildAdminBreadcrumb(path: string, override?: AdminBreadcrumbOverride | null): string[] {
  const parts = path.split("/").filter(Boolean);
  return parts.map((part, index) => {
    const isLast = index === parts.length - 1;
    if (isLast && override && override.path === path && override.label) return override.label;
    if (LABELS[part]) return LABELS[part];
    if (/^\d+$/.test(part)) return "#" + part;
    return part.charAt(0).toUpperCase() + part.slice(1);
  });
}
