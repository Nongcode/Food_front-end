"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { packages as seedPackages, posts as seedPosts } from "../../data/travel";

export type ContentTranslationFields = Record<string, string>;
export type ContentTranslationMap = Record<string, ContentTranslationFields>;

export type AdminPost = {
  id: number;
  title: string;
  category: string;
  destinationId?: number | null;
  destination?: string | null;
  date: string;
  status: string;
  imageUrl?: string;
  contentImageUrl?: string;
  excerpt?: string;
  readTime?: string;
  seoDescription?: string;
  summary?: string;
  translations?: ContentTranslationMap;
};

export type AdminPackage = {
  id: number;
  name: string;
  destination: string;
  duration: string;
  price: string;
  status: string;
};

export type PostCategory = {
  id: number;
  name: string;
  slug: string;
};

export type PackageCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
};

export type PromoPackage = {
  id: number;
  name: string;
  packageName: string;
  discountValue: string;
  validUntil: string;
  status: string;
};

export type ServicePackage = {
  id: number;
  name: string;
  price: string;
  type: string;
  description: string;
  status: string;
};

export type AdminBanner = {
  id: number;
  type: "homepage" | "subpage" | "detail";
  title: string;
  subtitle: string;
  image: string;
  link: string;
  status: string;
};

export type HeaderMenuItem = {
  id: number;
  label: string;
  url: string;
  order: number;
};

export type FooterInfo = {
  brandName: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  facebook: string;
  instagram: string;
  twitter: string;
  copyright: string;
};

export type AdminBooking = {
  id: number;
  customerName: string;
  email: string;
  phone: string;
  tourName: string;
  bookingDate: string;
  travelDate: string;
  numberOfTravelers: number;
  totalPrice: string;
  status: "Chờ xử lý" | "Đang xử lý" | "Đã xác nhận" | "Đã hủy" | "Hoàn tất";
  notes?: string;
  adminNotes?: string;
};

export type LanguageSetting = {
  id: number;
  code: string;
  name: string;
  flag: string;
  isActive: boolean;
  isDefault: boolean;
};

export type StaticTranslation = {
  id: number;
  key: string;
  description: string;
  translations: {
    [langCode: string]: string;
  };
};

export type AdminReview = {
  id: number;
  customerName: string;
  packageName: string;
  rating: number;
  comment: string;
  date: string;
  status: "Hiển thị" | "Ẩn";
  avatar?: string;
};


export type AdminCustomer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpent: string;
  dateAdded: string;
  notes?: string;
  status: "Hoạt động" | "Khóa";
};

export type MediaFile = {
  id: number;
  name: string;
  url: string;
  type: "image" | "video";
  size: string;
  dimensions?: string;
  uploadedAt: string;
};

export type SeoConfig = {
  id: number;
  page: string;
  urlPath: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage?: string;
};

type AdminContextValue = {
  posts: AdminPost[];
  packages: AdminPackage[];
  postCategories: PostCategory[];
  packageCategories: PackageCategory[];
  promoPackages: PromoPackage[];
  servicePackages: ServicePackage[];
  banners: AdminBanner[];
  headerMenu: HeaderMenuItem[];
  footerInfo: FooterInfo;
  bookings: AdminBooking[];
  languages: LanguageSetting[];
  translations: StaticTranslation[];
  reviews: AdminReview[];

  customers: AdminCustomer[];
  mediaFiles: MediaFile[];
  seoConfigs: SeoConfig[];

  addPost: (p: {
    title: string;
    category: string;
    status?: string;
    date?: string;
    imageUrl?: string;
    contentImageUrl?: string;
    excerpt?: string;
    readTime?: string;
    seoDescription?: string;
    summary?: string;
    translations?: ContentTranslationMap;
  }) => void;
  updatePost: (id: number, updated: Partial<AdminPost>) => void;
  removePost: (id: number) => void;

  addPackage: (p: { name: string; destination: string; duration?: string; price?: string; status?: string }) => void;
  updatePackage: (id: number, updated: Partial<AdminPackage>) => void;
  removePackage: (id: number) => void;

  addPostCategory: (name: string, slug?: string) => void;
  updatePostCategory: (id: number, name: string, slug: string) => void;
  removePostCategory: (id: number) => void;

  addPackageCategory: (cat: Omit<PackageCategory, "id">) => void;
  updatePackageCategory: (id: number, updated: Partial<PackageCategory>) => void;
  removePackageCategory: (id: number) => void;

  addPromoPackage: (promo: Omit<PromoPackage, "id">) => void;
  updatePromoPackage: (id: number, updated: Partial<PromoPackage>) => void;
  removePromoPackage: (id: number) => void;

  addServicePackage: (service: Omit<ServicePackage, "id">) => void;
  updateServicePackage: (id: number, updated: Partial<ServicePackage>) => void;
  removeServicePackage: (id: number) => void;

  addBanner: (banner: Omit<AdminBanner, "id">) => void;
  updateBanner: (id: number, updated: Partial<AdminBanner>) => void;
  removeBanner: (id: number) => void;

  addHeaderMenuItem: (item: Omit<HeaderMenuItem, "id">) => void;
  updateHeaderMenuItem: (id: number, updated: Partial<HeaderMenuItem>) => void;
  removeHeaderMenuItem: (id: number) => void;

  updateFooterInfo: (info: Partial<FooterInfo>) => void;

  addBooking: (b: Omit<AdminBooking, "id" | "bookingDate" | "status">) => void | Promise<void>;
  updateBooking: (id: number, updated: Partial<AdminBooking>) => void | Promise<void>;
  removeBooking: (id: number) => void | Promise<void>;

  addLanguage: (lang: Omit<LanguageSetting, "id">) => void;
  updateLanguage: (id: number, updated: Partial<LanguageSetting>) => void;
  removeLanguage: (id: number) => void;

  addTranslation: (trans: Omit<StaticTranslation, "id">) => void;
  updateTranslation: (id: number, updated: Partial<StaticTranslation>) => void;
  removeTranslation: (id: number) => void;

  addReview: (rev: Omit<AdminReview, "id" | "date">) => void;
  updateReview: (id: number, updated: Partial<AdminReview>) => void;
  removeReview: (id: number) => void;



  addCustomer: (c: Omit<AdminCustomer, "id" | "dateAdded" | "totalBookings" | "totalSpent">) => void;
  updateCustomer: (id: number, updated: Partial<AdminCustomer>) => void;
  removeCustomer: (id: number) => void;

  addMediaFile: (file: Omit<MediaFile, "id" | "uploadedAt">) => void;
  removeMediaFile: (id: number) => void;

  updateSeoConfig: (id: number, updated: Partial<SeoConfig>) => void;

  isAuthenticated: boolean;
  authReady: boolean;
  currentAdmin: { id: number; email: string; fullName: string; role: string } | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetDatabase: () => void;
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const postStorageKey = "vietvista-admin-posts";
  const packageStorageKey = "vietvista-admin-packages";
  const postCatStorageKey = "vietvista-admin-post-cats";
  const pkgCatStorageKey = "vietvista-admin-pkg-cats";
  const promoStorageKey = "vietvista-admin-promos";
  const serviceStorageKey = "vietvista-admin-services";
  const bannerStorageKey = "vietvista-admin-banners";
  const headerStorageKey = "vietvista-admin-headers";
  const footerStorageKey = "vietvista-admin-footers";
  const authStorageKey = "vietvista-admin-auth";

  const bookingStorageKey = "vietvista-admin-bookings";
  const languageStorageKey = "vietvista-admin-languages";
  const translationStorageKey = "vietvista-admin-translations";
  const reviewStorageKey = "vietvista-admin-reviews";

  const customerStorageKey = "vietvista-admin-customers";
  const mediaStorageKey = "vietvista-admin-media";
  const seoStorageKey = "vietvista-admin-seo";

  // Initial Seed Data
  const initialPosts: AdminPost[] = seedPosts.map(({ id, title, category, date, status }) => ({ id, title, category, date, status }));
  const initialPackages: AdminPackage[] = seedPackages.map(({ id, name, destination, duration, price, status }) => ({ id, name, destination, duration, price, status }));

  const initialPostCategories: PostCategory[] = [
    { id: 1, name: "Ẩm thực Sơn La", slug: "am-thuc-son-la" },
    { id: 2, name: "Quà biếu Tây Bắc", slug: "qua-bieu-tay-bac" },
    { id: 3, name: "Mẹo bảo quản", slug: "meo-bao-quan" },
  ];
  const initialPackageCategories: PackageCategory[] = [
    { id: 1, name: "Combo đặc sản", slug: "combo-dac-san", description: "Các set sản phẩm phối sẵn cho gia đình, bạn bè hoặc quà biếu." },
    { id: 2, name: "Quà tặng Tây Bắc", slug: "qua-tang-tay-bac", description: "Giỏ quà đóng gói đẹp, phù hợp dịp lễ, Tết và biếu đối tác." },
    { id: 3, name: "Gia vị và đồ khô", slug: "gia-vi-va-do-kho", description: "Mắc khén, chẩm chéo, thịt gác bếp và các món bảo quản lâu." },
  ];
  const initialPromoPackages: PromoPackage[] = [
    { id: 1, name: "Ưu đãi mùa mận", packageName: "Combo trái cây Yên Châu theo mùa", discountValue: "10%", validUntil: "2026-09-30", status: "Đang mở" },
    { id: 2, name: "Quà biếu doanh nghiệp", packageName: "Set quà Mộc Châu cao cấp", discountValue: "Theo số lượng", validUntil: "2026-12-31", status: "Đang mở" },
  ];
  const initialServicePackages: ServicePackage[] = [
    { id: 1, name: "Đóng gói quà biếu", price: "Theo yêu cầu", type: "Đóng gói", description: "Tư vấn hộp quà, thiệp và quy cách đóng gói phù hợp dịp tặng.", status: "Đang mở" },
    { id: 2, name: "Giao hàng nội thành", price: "Liên hệ", type: "Vận chuyển", description: "Sắp lịch giao combo đặc sản theo thời điểm khách cần nhận.", status: "Đang mở" },
    { id: 3, name: "Tư vấn bảo quản", price: "Miễn phí", type: "Hỗ trợ", description: "Hướng dẫn dùng, hâm nóng và bảo quản món khô, trà, gia vị.", status: "Đang mở" },
  ];
  const initialBanners: AdminBanner[] = [
    { id: 1, type: "homepage", title: "Đặc sản Sơn La giao tận nhà", subtitle: "Thịt gác bếp, chẩm chéo, chè Shan tuyết và trái cây theo mùa", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80", link: "/dac-san", status: "Đang mở" },
    { id: 2, type: "subpage", title: "Câu chuyện ẩm thực Sơn La", subtitle: "Mẹo chọn quà, dùng gia vị và bảo quản đặc sản", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80", link: "/tin-tuc", status: "Đang mở" },
    { id: 3, type: "detail", title: "Quà biếu Sơn La", subtitle: "Tư vấn set quà theo ngân sách và dịp tặng", image: "https://images.unsplash.com/photo-1607344645866-009c7d88bc49?auto=format&fit=crop&w=1200&q=80", link: "/lien-he", status: "Đang mở" },
  ];
  const initialHeaderMenu: HeaderMenuItem[] = [
    { id: 1, label: "Trang chủ", url: "/", order: 1 },
    { id: 2, label: "Combo đặc sản", url: "/goi-du-lich", order: 2 },
    { id: 3, label: "Đặc sản Sơn La", url: "/dac-san", order: 3 },
    { id: 4, label: "Câu chuyện ẩm thực", url: "/tin-tuc", order: 4 },
    { id: 5, label: "Liên hệ", url: "/lien-he", order: 5 },
  ];
  const initialFooterInfo: FooterInfo = {
    brandName: "Sơn La Food",
    description: "Cửa hàng giới thiệu đặc sản Sơn La, quà tặng Tây Bắc và những hương vị bản địa được tuyển chọn.",
    address: "Thành phố Sơn La, Sơn La",
    phone: "0900 123 456",
    email: "hello@sonlafood.vn",
    facebook: "https://facebook.com/sonlafood",
    instagram: "https://instagram.com/sonlafood",
    twitter: "",
    copyright: "© 2026 Sơn La Food. All Rights Reserved.",
  };
  const initialBookings: AdminBooking[] = [
    { id: 1, customerName: "Nguyễn Mai Anh", email: "maianh@example.com", phone: "0912345678", tourName: "Combo đặc sản Sơn La dùng thử", bookingDate: "2026-07-20", travelDate: "2026-08-05", numberOfTravelers: 1, totalPrice: "590.000đ", status: "Chờ xử lý", notes: "Giao trong giờ hành chính." },
    { id: 2, customerName: "Trần Đức Huy", email: "huy.tran@example.com", phone: "0987654321", tourName: "Set quà Mộc Châu cao cấp", bookingDate: "2026-07-22", travelDate: "2026-08-10", numberOfTravelers: 3, totalPrice: "2.670.000đ", status: "Đang xử lý", notes: "Cần in thiệp chúc mừng riêng." },
  ];
  const initialLanguages: LanguageSetting[] = [
    { id: 1, code: "vi", name: "Tiếng Việt", flag: "ðŸ‡»ðŸ‡³", isActive: true, isDefault: true },
    { id: 2, code: "en", name: "English", flag: "ðŸ‡ºðŸ‡¸", isActive: true, isDefault: false },
    { id: 3, code: "zh", name: "ä¸­æ–‡", flag: "ðŸ‡¨ðŸ‡³", isActive: false, isDefault: false },
    { id: 4, code: "ja", name: "æ—¥æœ¬èªž", flag: "ðŸ‡¯ðŸ‡µ", isActive: false, isDefault: false }
  ];

  const initialTranslations: StaticTranslation[] = [
    { id: 1, key: "home_hero", description: "Tiêu đề lớn tại trang chủ", translations: { vi: "Đặc sản Sơn La giao tận nhà", en: "Son La specialties delivered", zh: "山罗特产配送", ja: "ソンラ特産品" } },
    { id: 2, key: "search_products", description: "Placeholder cho thanh tìm kiếm sản phẩm", translations: { vi: "Tìm combo, món đặc sản...", en: "Search sets and specialties...", zh: "搜索特产组合...", ja: "特産品を検索..." } },
    { id: 3, key: "contact_us", description: "Menu liên hệ", translations: { vi: "Liên hệ", en: "Contact", zh: "联系", ja: "お問い合わせ" } },
    { id: 4, key: "request_advice", description: "Nút nhận tư vấn", translations: { vi: "Nhận tư vấn", en: "Get advice", zh: "获取咨询", ja: "相談する" } },
  ];
  const initialReviews: AdminReview[] = [
    { id: 1, customerName: "Nguyễn Mai Anh", packageName: "Combo đặc sản Sơn La dùng thử", rating: 5, comment: "Đóng gói sạch, thịt trâu thơm và chẩm chéo rất hợp khẩu vị gia đình.", date: "2026-07-20", status: "Hiển thị", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
    { id: 2, customerName: "Trần Đức Huy", packageName: "Set quà Mộc Châu cao cấp", rating: 5, comment: "Giỏ quà nhìn lịch sự, tư vấn nhanh, phù hợp biếu đối tác.", date: "2026-07-22", status: "Hiển thị", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
  ];

  const initialCustomers: AdminCustomer[] = [
    { id: 1, name: "Nguyễn Mai Anh", email: "maianh@example.com", phone: "0912345678", totalBookings: 1, totalSpent: "590.000đ", dateAdded: "2026-07-20", status: "Hoạt động", notes: "Thích combo có thịt trâu và gia vị." },
    { id: 2, name: "Trần Đức Huy", email: "huy.tran@example.com", phone: "0987654321", totalBookings: 1, totalSpent: "890.000đ", dateAdded: "2026-07-22", status: "Hoạt động", notes: "Khách mua quà doanh nghiệp." },
  ];
  const initialMediaFiles: MediaFile[] = [
    { id: 1, name: "son-la-food-table.jpg", url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80", type: "image", size: "485 KB", dimensions: "1200x800", uploadedAt: "2026-07-20 14:30" },
    { id: 2, name: "tay-bac-spices.jpg", url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80", type: "image", size: "512 KB", dimensions: "1200x900", uploadedAt: "2026-07-21 09:15" },
    { id: 3, name: "gift-set.jpg", url: "https://images.unsplash.com/photo-1607344645866-009c7d88bc49?auto=format&fit=crop&w=800&q=80", type: "image", size: "620 KB", dimensions: "1600x1000", uploadedAt: "2026-07-22 16:45" },
  ];
  const initialSeoConfigs: SeoConfig[] = [
    { id: 1, page: "Trang chủ", urlPath: "/", metaTitle: "Sơn La Food - Đặc sản Sơn La và quà tặng Tây Bắc", metaDescription: "Combo đặc sản Sơn La, thịt gác bếp, chẩm chéo, chè Shan tuyết và trái cây theo mùa giao tận nhà.", metaKeywords: "đặc sản Sơn La, thịt gác bếp, chẩm chéo, chè Shan tuyết", ogImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80" },
    { id: 2, page: "Combo đặc sản", urlPath: "/goi-du-lich", metaTitle: "Combo đặc sản Sơn La - Sơn La Food", metaDescription: "Danh sách combo đặc sản, quà biếu Tây Bắc, gia vị và nông sản Sơn La theo mùa.", metaKeywords: "combo đặc sản, quà biếu Tây Bắc, đặc sản Mộc Châu", ogImage: "https://images.unsplash.com/photo-1607344645866-009c7d88bc49?auto=format&fit=crop&w=1200&q=80" },
    { id: 3, page: "Câu chuyện ẩm thực", urlPath: "/tin-tuc", metaTitle: "Câu chuyện ẩm thực Sơn La - Sơn La Food", metaDescription: "Mẹo chọn quà, dùng gia vị, bảo quản món khô và mua nông sản Sơn La đúng mùa.", metaKeywords: "ẩm thực Sơn La, quà biếu Sơn La, nông sản Sơn La", ogImage: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80" },
    { id: 4, page: "Liên hệ", urlPath: "/lien-he", metaTitle: "Liên hệ tư vấn combo đặc sản - Sơn La Food", metaDescription: "Liên hệ Sơn La Food để được tư vấn combo đặc sản, set quà biếu và thời gian giao hàng phù hợp.", metaKeywords: "liên hệ Sơn La Food, tư vấn quà biếu, combo đặc sản", ogImage: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80" },
  ];
  // State Definitions with lazy localstorage loading
  const [posts, setPosts] = useState<AdminPost[]>(() => {
    if (typeof window === "undefined") return initialPosts;
    const saved = window.localStorage.getItem(postStorageKey);
    return saved ? JSON.parse(saved) : initialPosts;
  });

  const [packages, setPackages] = useState<AdminPackage[]>(() => {
    if (typeof window === "undefined") return initialPackages;
    const saved = window.localStorage.getItem(packageStorageKey);
    return saved ? JSON.parse(saved) : initialPackages;
  });

  const [postCategories, setPostCategories] = useState<PostCategory[]>(() => {
    if (typeof window === "undefined") return initialPostCategories;
    const saved = window.localStorage.getItem(postCatStorageKey);
    return saved ? JSON.parse(saved) : initialPostCategories;
  });

  const [packageCategories, setPackageCategories] = useState<PackageCategory[]>(() => {
    if (typeof window === "undefined") return initialPackageCategories;
    const saved = window.localStorage.getItem(pkgCatStorageKey);
    return saved ? JSON.parse(saved) : initialPackageCategories;
  });

  const [promoPackages, setPromoPackages] = useState<PromoPackage[]>(() => {
    if (typeof window === "undefined") return initialPromoPackages;
    const saved = window.localStorage.getItem(promoStorageKey);
    return saved ? JSON.parse(saved) : initialPromoPackages;
  });

  const [servicePackages, setServicePackages] = useState<ServicePackage[]>(() => {
    if (typeof window === "undefined") return initialServicePackages;
    const saved = window.localStorage.getItem(serviceStorageKey);
    return saved ? JSON.parse(saved) : initialServicePackages;
  });

  const [banners, setBanners] = useState<AdminBanner[]>(() => {
    if (typeof window === "undefined") return initialBanners;
    const saved = window.localStorage.getItem(bannerStorageKey);
    return saved ? JSON.parse(saved) : initialBanners;
  });

  const [headerMenu, setHeaderMenu] = useState<HeaderMenuItem[]>(() => {
    if (typeof window === "undefined") return initialHeaderMenu;
    const saved = window.localStorage.getItem(headerStorageKey);
    return saved ? JSON.parse(saved) : initialHeaderMenu;
  });

  const [footerInfo, setFooterInfo] = useState<FooterInfo>(() => {
    if (typeof window === "undefined") return initialFooterInfo;
    const saved = window.localStorage.getItem(footerStorageKey);
    return saved ? JSON.parse(saved) : initialFooterInfo;
  });

  const [bookings, setBookings] = useState<AdminBooking[]>(() => {
    if (typeof window === "undefined") return initialBookings;
    const saved = window.localStorage.getItem(bookingStorageKey);
    return saved ? JSON.parse(saved) : initialBookings;
  });

  const [languages, setLanguages] = useState<LanguageSetting[]>(() => {
    if (typeof window === "undefined") return initialLanguages;
    const saved = window.localStorage.getItem(languageStorageKey);
    return saved ? JSON.parse(saved) : initialLanguages;
  });

  const [translations, setTranslations] = useState<StaticTranslation[]>(() => {
    if (typeof window === "undefined") return initialTranslations;
    const saved = window.localStorage.getItem(translationStorageKey);
    return saved ? JSON.parse(saved) : initialTranslations;
  });

  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(() => {
    if (typeof window === "undefined") return initialMediaFiles;
    const saved = window.localStorage.getItem(mediaStorageKey);
    return saved ? JSON.parse(saved) : initialMediaFiles;
  });

  const [seoConfigs, setSeoConfigs] = useState<SeoConfig[]>(() => {
    if (typeof window === "undefined") return initialSeoConfigs;
    const saved = window.localStorage.getItem(seoStorageKey);
    return saved ? JSON.parse(saved) : initialSeoConfigs;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    // HTTP-only cookie mới là nguồn xác thực chính; chờ /api/admin/me trước khi kết luận.
    return true;
  });
  const [authReady, setAuthReady] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<{ id: number; email: string; fullName: string; role: string } | null>(null);
  // Kiá»ƒm tra phiÃªn lÃ m viá»‡c ngay khi load trang
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/admin/me");
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(data.isAuthenticated);
          setCurrentAdmin(data.admin);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(authStorageKey, "1");
          }
        } else {
          setIsAuthenticated(false);
          setCurrentAdmin(null);
          if (typeof window !== "undefined") {
            window.localStorage.removeItem(authStorageKey);
          }
        }
      } catch (err) {
        console.error("Lá»—i kiá»ƒm tra phiÃªn lÃ m viá»‡c:", err);
        setIsAuthenticated(false);
        setCurrentAdmin(null);
      } finally {
        setAuthReady(true);
      }
    }
    checkSession();
  }, []);

  // Tải danh sách bài viết từ database khi đã đăng nhập
  useEffect(() => {
    async function loadDbPosts() {
      if (authReady && isAuthenticated) {
        try {
          const res = await fetch("/api/admin/posts");
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.posts)) {
              setPosts(data.posts);
            }
          }
        } catch (err) {
          console.error("Lỗi khi tải danh sách bài viết từ database:", err);
        }
      }
    }
    loadDbPosts();
  }, [authReady, isAuthenticated]);

  useEffect(() => {
    async function loadDbPackages() {
      if (authReady && isAuthenticated) {
        try {
          const res = await fetch("/api/admin/packages");
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.packages)) {
              setPackages(data.packages);
            }
          }
        } catch (err) {
          console.error("Lỗi khi tải danh sách combo đặc sản từ database:", err);
        }
      }
    }
    loadDbPackages();
  }, [authReady, isAuthenticated]);

  useEffect(() => {
    async function loadDbBookings() {
      if (authReady && isAuthenticated) {
        try {
          const res = await fetch("/api/admin/bookings");
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.bookings)) {
              setBookings(data.bookings);
            }
          }
        } catch (err) {
          console.error("Lá»—i khi táº£i danh sÃ¡ch bookings tá»« database:", err);
        }
      }
    }
    loadDbBookings();
  }, [authReady, isAuthenticated]);

  useEffect(() => {
    async function loadDbReviews() {
      if (authReady && isAuthenticated) {
        try {
          const res = await fetch("/api/admin/reviews");
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.reviews)) {
              setReviews(data.reviews);
            }
          }
        } catch (err) {
          console.error("Lá»—i khi táº£i danh sÃ¡ch reviews tá»« database:", err);
        }
      }
    }
    loadDbReviews();
  }, [authReady, isAuthenticated]);

  useEffect(() => {
    async function loadDbCustomers() {
      if (authReady && isAuthenticated) {
        try {
          const res = await fetch("/api/admin/customers");
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.customers)) {
              setCustomers(data.customers);
            }
          }
        } catch (err) {
          console.error("Lá»—i khi táº£i danh sÃ¡ch khÃ¡ch hÃ ng tá»« database:", err);
        }
      }
    }
    loadDbCustomers();
  }, [authReady, isAuthenticated]);

  // Effects to save states to localstorage
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(postStorageKey, JSON.stringify(posts)); }, [posts]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(packageStorageKey, JSON.stringify(packages)); }, [packages]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(postCatStorageKey, JSON.stringify(postCategories)); }, [postCategories]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(pkgCatStorageKey, JSON.stringify(packageCategories)); }, [packageCategories]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(promoStorageKey, JSON.stringify(promoPackages)); }, [promoPackages]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(serviceStorageKey, JSON.stringify(servicePackages)); }, [servicePackages]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(bannerStorageKey, JSON.stringify(banners)); }, [banners]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(headerStorageKey, JSON.stringify(headerMenu)); }, [headerMenu]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(footerStorageKey, JSON.stringify(footerInfo)); }, [footerInfo]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(bookingStorageKey, JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(languageStorageKey, JSON.stringify(languages)); }, [languages]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(translationStorageKey, JSON.stringify(translations)); }, [translations]);

  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(mediaStorageKey, JSON.stringify(mediaFiles)); }, [mediaFiles]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(seoStorageKey, JSON.stringify(seoConfigs)); }, [seoConfigs]);

  async function addPost(p: {
    title: string;
    category: string;
    status?: string;
    date?: string;
    imageUrl?: string;
    contentImageUrl?: string;
    excerpt?: string;
    readTime?: string;
    seoDescription?: string;
    summary?: string;
    translations?: ContentTranslationMap;
  }) {
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.post) {
          setPosts((current) => [data.post, ...current]);
        } else {
          alert(data.error || "Lá»—i khi táº¡o bÃ i viáº¿t.");
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Lá»—i káº¿t ná»‘i mÃ¡y chá»§ khi táº¡o bÃ i viáº¿t.");
      }
    } catch (err) {
      console.error("Lá»—i khi thÃªm bÃ i viáº¿t:", err);
      alert("Lá»—i há»‡ thá»‘ng khi thÃªm bÃ i viáº¿t.");
    }
  }

  async function updatePost(id: number, updated: Partial<AdminPost>) {
    try {
      const res = await fetch("/api/admin/posts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updated }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.post) {
          setPosts((current) =>
            current.map((post) => (post.id === id ? { ...post, ...data.post } : post))
          );
        } else {
          alert(data.error || "Lá»—i khi cáº­p nháº­t bÃ i viáº¿t.");
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Lá»—i káº¿t ná»‘i mÃ¡y chá»§ khi cáº­p nháº­t bÃ i viáº¿t.");
      }
    } catch (err) {
      console.error("Lá»—i khi cáº­p nháº­t bÃ i viáº¿t:", err);
      alert("Lá»—i há»‡ thá»‘ng khi cáº­p nháº­t bÃ i viáº¿t.");
    }
  }

  async function removePost(id: number) {
    try {
      const res = await fetch(`/api/admin/posts?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPosts((current) => current.filter((p) => p.id !== id));
        } else {
          alert(data.error || "Lá»—i khi xÃ³a bÃ i viáº¿t.");
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Lá»—i káº¿t ná»‘i mÃ¡y chá»§ khi xÃ³a bÃ i viáº¿t.");
      }
    } catch (err) {
      console.error("Lá»—i khi xÃ³a bÃ i viáº¿t:", err);
      alert("Lá»—i há»‡ thá»‘ng khi xÃ³a bÃ i viáº¿t.");
    }
  }

  function addPackage(p: { name: string; destination: string; duration?: string; price?: string; status?: string }) {
    setPackages((current) => [
      {
        id: Date.now(),
        name: p.name,
        destination: p.destination,
        duration: p.duration ?? "3 ngÃ y 2 Ä‘Ãªm",
        price: p.price ?? "Liên hệ",
        status: p.status ?? "Äang má»Ÿ",
      },
      ...current,
    ]);
  }

  function updatePackage(id: number, updated: Partial<AdminPackage>) {
    setPackages((current) => current.map((it) => (it.id === id ? { ...it, ...updated } : it)));
  }

  function removePackage(id: number) {
    setPackages((current) => current.filter((i) => i.id !== id));
  }

  // Post Categories CRUD
  function addPostCategory(name: string, slug?: string) {
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setPostCategories((current) => [...current, { id: Date.now(), name, slug: finalSlug }]);
  }

  function updatePostCategory(id: number, name: string, slug: string) {
    setPostCategories((current) =>
      current.map((cat) => (cat.id === id ? { ...cat, name, slug } : cat))
    );
  }

  function removePostCategory(id: number) {
    setPostCategories((current) => current.filter((c) => c.id !== id));
  }

  // Package Categories CRUD
  function addPackageCategory(cat: Omit<PackageCategory, "id">) {
    setPackageCategories((current) => [...current, { id: Date.now(), ...cat }]);
  }

  function updatePackageCategory(id: number, updated: Partial<PackageCategory>) {
    setPackageCategories((current) => current.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  }

  function removePackageCategory(id: number) {
    setPackageCategories((current) => current.filter((c) => c.id !== id));
  }

  // Promo Packages CRUD
  function addPromoPackage(promo: Omit<PromoPackage, "id">) {
    setPromoPackages((current) => [...current, { id: Date.now(), ...promo }]);
  }

  function updatePromoPackage(id: number, updated: Partial<PromoPackage>) {
    setPromoPackages((current) => current.map((p) => (p.id === id ? { ...p, ...updated } : p)));
  }

  function removePromoPackage(id: number) {
    setPromoPackages((current) => current.filter((p) => p.id !== id));
  }

  // Service Packages CRUD
  function addServicePackage(service: Omit<ServicePackage, "id">) {
    setServicePackages((current) => [...current, { id: Date.now(), ...service }]);
  }

  function updateServicePackage(id: number, updated: Partial<ServicePackage>) {
    setServicePackages((current) => current.map((s) => (s.id === id ? { ...s, ...updated } : s)));
  }

  function removeServicePackage(id: number) {
    setServicePackages((current) => current.filter((s) => s.id !== id));
  }

  // Banners CRUD
  function addBanner(banner: Omit<AdminBanner, "id">) {
    setBanners((current) => [...current, { id: Date.now(), ...banner }]);
  }

  function updateBanner(id: number, updated: Partial<AdminBanner>) {
    setBanners((current) => current.map((b) => (b.id === id ? { ...b, ...updated } : b)));
  }

  function removeBanner(id: number) {
    setBanners((current) => current.filter((b) => b.id !== id));
  }

  // Header Menu CRUD
  function addHeaderMenuItem(item: Omit<HeaderMenuItem, "id">) {
    setHeaderMenu((current) => [...current, { id: Date.now(), ...item }]);
  }

  function updateHeaderMenuItem(id: number, updated: Partial<HeaderMenuItem>) {
    setHeaderMenu((current) => current.map((item) => (item.id === id ? { ...item, ...updated } : item)));
  }

  function removeHeaderMenuItem(id: number) {
    setHeaderMenu((current) => current.filter((item) => item.id !== id));
  }

  // Footer Info update
  function updateFooterInfo(info: Partial<FooterInfo>) {
    setFooterInfo((current) => ({ ...current, ...info }));
  }

  // Booking CRUD
  async function addBooking(b: Omit<AdminBooking, "id" | "bookingDate" | "status">) {
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(b),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.booking) {
          setBookings((current) => [data.booking, ...current]);
        } else {
          alert(data.error || "Lá»—i khi táº¡o booking.");
        }
      }
    } catch (err) {
      console.error("Lá»—i khi thÃªm booking:", err);
      alert("Lá»—i há»‡ thá»‘ng khi thÃªm booking.");
    }
  }

  async function updateBooking(id: number, updated: Partial<AdminBooking>) {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.booking) {
          setBookings((current) => current.map((it) => (it.id === id ? { ...it, ...data.booking } : it)));
        } else {
          alert(data.error || "Lá»—i khi cáº­p nháº­t booking.");
        }
      }
    } catch (err) {
      console.error("Lá»—i khi cáº­p nháº­t booking:", err);
      alert("Lá»—i há»‡ thá»‘ng khi cáº­p nháº­t booking.");
    }
  }

  async function removeBooking(id: number) {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBookings((current) => current.filter((it) => it.id !== id));
        } else {
          alert(data.error || "Lá»—i khi xÃ³a booking.");
        }
      }
    } catch (err) {
      console.error("Lá»—i khi xÃ³a booking:", err);
      alert("Lá»—i há»‡ thá»‘ng khi xÃ³a booking.");
    }
  }

  // Language CRUD
  function addLanguage(lang: Omit<LanguageSetting, "id">) {
    setLanguages((current) => [...current, { id: Date.now(), ...lang }]);
  }

  function updateLanguage(id: number, updated: Partial<LanguageSetting>) {
    setLanguages((current) => current.map((it) => (it.id === id ? { ...it, ...updated } : it)));
  }

  function removeLanguage(id: number) {
    setLanguages((current) => current.filter((it) => it.id !== id));
  }

  // Translation CRUD
  function addTranslation(trans: Omit<StaticTranslation, "id">) {
    setTranslations((current) => [...current, { id: Date.now(), ...trans }]);
  }

  function updateTranslation(id: number, updated: Partial<StaticTranslation>) {
    setTranslations((current) => current.map((it) => (it.id === id ? { ...it, ...updated } : it)));
  }

  function removeTranslation(id: number) {
    setTranslations((current) => current.filter((it) => it.id !== id));
  }

  // Review CRUD
  async function addReview(rev: Omit<AdminReview, "id" | "date">) {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rev),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.review) {
          setReviews((current) => [data.review, ...current]);
        }
      }
    } catch (err) {
      console.error("Lá»—i khi thÃªm review:", err);
    }
  }

  async function updateReview(id: number, updated: Partial<AdminReview>) {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.review) {
          setReviews((current) => current.map((it) => (it.id === id ? { ...it, ...data.review } : it)));
        }
      }
    } catch (err) {
      console.error("Lá»—i khi cáº­p nháº­t review:", err);
    }
  }

  async function removeReview(id: number) {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setReviews((current) => current.filter((it) => it.id !== id));
        }
      }
    } catch (err) {
      console.error("Lá»—i khi xÃ³a review:", err);
    }
  }


  // Customer CRUD
  async function addCustomer(c: Omit<AdminCustomer, "id" | "dateAdded" | "totalBookings" | "totalSpent">) {
    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.customer) {
          setCustomers((current) => [data.customer, ...current]);
        }
      }
    } catch (err) {
      console.error("Lá»—i khi thÃªm customer:", err);
    }
  }

  async function updateCustomer(id: number, updated: Partial<AdminCustomer>) {
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.customer) {
          setCustomers((current) => current.map((it) => (it.id === id ? { ...it, ...data.customer } : it)));
        }
      }
    } catch (err) {
      console.error("Lá»—i khi cáº­p nháº­t customer:", err);
    }
  }

  async function removeCustomer(id: number) {
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCustomers((current) => current.filter((it) => it.id !== id));
        }
      }
    } catch (err) {
      console.error("Lá»—i khi xÃ³a customer:", err);
    }
  }

  // Media CRUD
  function addMediaFile(file: Omit<MediaFile, "id" | "uploadedAt">) {
    setMediaFiles((current) => [
      {
        id: Date.now(),
        uploadedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        ...file,
      },
      ...current,
    ]);
  }

  function removeMediaFile(id: number) {
    setMediaFiles((current) => current.filter((it) => it.id !== id));
  }

  // SEO Update
  function updateSeoConfig(id: number, updated: Partial<SeoConfig>) {
    setSeoConfigs((current) => current.map((it) => (it.id === id ? { ...it, ...updated } : it)));
  }

  async function login(username: string, password: string) {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.admin) {
        setIsAuthenticated(true);
        setCurrentAdmin(data.admin);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(authStorageKey, "1");
        }
        return true;
      } else {
        // NÃ©m lá»—i nháº­n Ä‘Æ°á»£c tá»« API Ä‘á»ƒ Client báº¯t Ä‘Æ°á»£c thÃ´ng bÃ¡o lá»—i cá»¥ thá»ƒ
        throw new Error(data.error || "TÃªn Ä‘Äƒng nháº­p hoáº·c máº­t kháº©u khÃ´ng há»£p lá»‡.");
      }
    } catch (error) {
      setIsAuthenticated(false);
      setCurrentAdmin(null);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(authStorageKey);
      }
      throw error;
    }
  }

  async function logout() {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch (error) {
      console.error("Lá»—i gá»i API Ä‘Äƒng xuáº¥t:", error);
    } finally {
      setIsAuthenticated(false);
      setCurrentAdmin(null);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(authStorageKey);
      }
    }
  }

  function resetDatabase() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(postStorageKey);
      window.localStorage.removeItem(packageStorageKey);
      window.localStorage.removeItem(postCatStorageKey);
      window.localStorage.removeItem(pkgCatStorageKey);
      window.localStorage.removeItem(promoStorageKey);
      window.localStorage.removeItem(serviceStorageKey);
      window.localStorage.removeItem(bannerStorageKey);
      window.localStorage.removeItem(headerStorageKey);
      window.localStorage.removeItem(footerStorageKey);

      window.localStorage.removeItem(bookingStorageKey);
      window.localStorage.removeItem(languageStorageKey);
      window.localStorage.removeItem(translationStorageKey);
      window.localStorage.removeItem(reviewStorageKey);

      window.localStorage.removeItem(customerStorageKey);
      window.localStorage.removeItem(mediaStorageKey);
      window.localStorage.removeItem(seoStorageKey);
    }
    setPosts(initialPosts);
    setPackages(initialPackages);
    setPostCategories(initialPostCategories);
    setPackageCategories(initialPackageCategories);
    setPromoPackages(initialPromoPackages);
    setServicePackages(initialServicePackages);
    setBanners(initialBanners);
    setHeaderMenu(initialHeaderMenu);
    setFooterInfo(initialFooterInfo);

    setBookings(initialBookings);
    setLanguages(initialLanguages);
    setTranslations(initialTranslations);
    setReviews(initialReviews);

    setCustomers(initialCustomers);
    setMediaFiles(initialMediaFiles);
    setSeoConfigs(initialSeoConfigs);
  }

  const value: AdminContextValue = {
    posts,
    packages,
    postCategories,
    packageCategories,
    promoPackages,
    servicePackages,
    banners,
    headerMenu,
    footerInfo,
    bookings,
    languages,
    translations,
    reviews,
    customers,
    mediaFiles,
    seoConfigs,

    addPost,
    updatePost,
    removePost,

    addPackage,
    updatePackage,
    removePackage,

    addPostCategory,
    updatePostCategory,
    removePostCategory,

    addPackageCategory,
    updatePackageCategory,
    removePackageCategory,

    addPromoPackage,
    updatePromoPackage,
    removePromoPackage,

    addServicePackage,
    updateServicePackage,
    removeServicePackage,

    addBanner,
    updateBanner,
    removeBanner,

    addHeaderMenuItem,
    updateHeaderMenuItem,
    removeHeaderMenuItem,

    updateFooterInfo,

    addBooking,
    updateBooking,
    removeBooking,

    addLanguage,
    updateLanguage,
    removeLanguage,

    addTranslation,
    updateTranslation,
    removeTranslation,

    addReview,
    updateReview,
    removeReview,



    addCustomer,
    updateCustomer,
    removeCustomer,

    addMediaFile,
    removeMediaFile,

    updateSeoConfig,

    isAuthenticated,
    authReady,
    currentAdmin,
    login,
    logout,
    resetDatabase,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}



