import { DEFAULT_SITE_CHROME_CONFIG } from "@/lib/siteChromeShared";
import { publicApiFetch } from "@/lib/publicApi";
import type { LanguageOption, TranslationMap } from "@/lib/i18n/server";
import { defaultLanguages } from "@/lib/i18n/defaults";
import { fallbackCollections, fallbackPackages, type PublicPackage, type PublicPackageCollection } from "@/lib/packages";
import { posts as fallbackPosts } from "@/app/data/food";

export type PublicSiteChromeState = {
  siteChrome: typeof DEFAULT_SITE_CHROME_CONFIG;
  staticTranslations: TranslationMap;
  activeLanguages: LanguageOption[];
  siteStatus: string;
  pageStatuses: Record<string, string | null>;
  hiddenPageKeys: string[];
};

export type PublicHomePayload = {
  packages: PublicPackage[];
  packageCollections: PublicPackageCollection[];
  homepageBanners: Array<{
    id: number;
    title: string | null;
    subtitle: string | null;
    imageUrl: string;
    linkUrl: string | null;
    mediaType: string;
    bannerType: string;
    status: string;
    updatedAt: string;
  }>;
  posts: Array<{
    id: number;
    category: string;
    title: string;
    excerpt: string;
    image: string;
    readTime: string;
    date: string;
  }>;
};

export type PublicSpecialty = {
  id: number;
  slug: string;
  name: string;
  type: string;
  description: string;
  imageUrl: string;
  priceText: string;
  priceValue: number | null;
  priceUnit: string | null;
  whereToBuy: string;
  destinationName: string;
};

export type PublicPostCard = {
  id: number;
  slug?: string | null;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  date: string;
};

export type PublicReview = {
  id: number;
  customerName: string;
  packageName: string;
  rating: number;
  comment: string;
  avatar: string | null;
};

const fallbackLanguages: LanguageOption[] = defaultLanguages.map((language) => ({
  code: language.code,
  name: language.name,
  nativeName: language.nativeName,
  flag: language.flag,
  isActive: language.isActive,
  isDefault: language.isDefault,
}));

const fallbackHomeBanners: PublicHomePayload["homepageBanners"] = [
  {
    id: -1,
    title: "Sản phẩm đặc sản từ Sơn La đến mâm cơm của bạn.",
    subtitle: "Combo quà tặng Tây Bắc, thịt gác bếp, chẩm chéo, chè Shan tuyết và trái cây theo mùa.",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=2200&q=85",
    linkUrl: "/combo-dac-san",
    mediaType: "image",
    bannerType: "hero",
    status: "active",
    updatedAt: new Date(0).toISOString(),
  },
  {
    id: -2,
    title: "Set quà Tây Bắc cho từng dịp.",
    subtitle: "Dễ phối theo ngân sách, khẩu vị và số lượng khách cần đặt.",
    imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=2200&q=85",
    linkUrl: "/combo-dac-san",
    mediaType: "image",
    bannerType: "hero",
    status: "active",
    updatedAt: new Date(0).toISOString(),
  },
  {
    id: -3,
    title: "Hương vị Sơn La trong từng món.",
    subtitle: "Từ gia vị Tây Bắc đến nông sản theo mùa, tất cả được gợi ý để khách dễ chọn.",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=2200&q=85",
    linkUrl: "/dac-san",
    mediaType: "image",
    bannerType: "hero",
    status: "active",
    updatedAt: new Date(0).toISOString(),
  },
];

const fallbackSpecialties: PublicSpecialty[] = fallbackPackages().map((item) => ({
  id: item.id,
  slug: item.slug,
  name: item.name,
  type: "FOOD",
  description: item.summary,
  imageUrl: item.image,
  priceText: item.price,
  priceValue: null,
  priceUnit: null,
  whereToBuy: "Sơn La Food",
  destinationName: item.destination,
}));

export const fallbackSiteChromeState: PublicSiteChromeState = {
  siteChrome: DEFAULT_SITE_CHROME_CONFIG,
  staticTranslations: {},
  activeLanguages: fallbackLanguages,
  siteStatus: "active",
  pageStatuses: {},
  hiddenPageKeys: [],
};

export function getPublicSiteChromeState(locale: string) {
  return publicApiFetch<PublicSiteChromeState>("/api/public/site-chrome", locale, fallbackSiteChromeState);
}

export function getPublicHome(locale: string) {
  return publicApiFetch<PublicHomePayload>("/api/public/home", locale, {
    packages: fallbackPackages(),
    packageCollections: fallbackCollections(),
    homepageBanners: fallbackHomeBanners,
    posts: fallbackPosts,
  });
}

export function getPublicSpecialties(locale: string) {
  return publicApiFetch<{ specialties: PublicSpecialty[] }>("/api/public/local-specialties", locale, { specialties: fallbackSpecialties });
}

export function getPublicSpecialtyDetail(slug: string, locale: string) {
  const fallbackItem = fallbackSpecialties.find((item) => item.slug === slug) || null;

  return publicApiFetch<{
    specialty: PublicSpecialty & Record<string, unknown>;
    detail: {
      bannerImageUrl: string;
      overview: string;
      history: string;
      ingredients: string;
      howToUse: string;
      preservation: string;
    };
    specialtyNames: string[];
  } | null>(`/api/public/local-specialties/${slug}`, locale, fallbackItem ? {
    specialty: fallbackItem,
    detail: {
      bannerImageUrl: fallbackItem.imageUrl,
      overview: fallbackItem.description,
      history: "Sản phẩm được chọn theo tinh thần ẩm thực Sơn La, ưu tiên hương vị bản địa và cách dùng gần gũi trong bữa cơm Việt.",
      ingredients: "Thành phần thay đổi theo từng set và mùa vụ, nhân viên sẽ xác nhận trước khi đóng gói.",
      howToUse: "Dùng trực tiếp hoặc chế biến theo hướng dẫn đi kèm. Có thể phối cùng chẩm chéo, mắc khén hoặc trà Shan tuyết tùy món.",
      preservation: "Bảo quản nơi khô ráo, thoáng mát. Với đồ tươi hoặc đã mở gói, nên dùng theo hướng dẫn trên bao bì.",
    },
    specialtyNames: fallbackSpecialties.map((item) => item.name),
  } : null);
}

export function getPublicPosts(locale: string) {
  return publicApiFetch<{ posts: PublicPostCard[]; leadPost: PublicPostCard | null }>("/api/public/posts", locale, {
    posts: fallbackPosts,
    leadPost: fallbackPosts[0] || null,
  });
}

export function getPublicPostDetail(id: string, locale: string) {
  return publicApiFetch<{
    post: {
      id: number;
      slug?: string | null;
      category: string;
      title: string;
      date: string;
      readTime: string;
      author: { name: string; avatar: string; role: string };
      image: string;
      summary: string;
      relatedPackageSlug: string | null;
      blocks: unknown[];
      createdAt: string;
      updatedAt: string;
      publishedAt: string | null;
    };
    relatedPackage: PublicPackage | null;
    relatedPosts: PublicPostCard[];
  } | null>(`/api/public/posts/${id}`, locale, null);
}

export function getPublicReviews(locale: string) {
  return publicApiFetch<{ reviews: PublicReview[] }>("/api/public/reviews", locale, {
    reviews: [
      {
        id: -1,
        customerName: "Nguyễn Mai Anh",
        packageName: "Combo đặc sản Sơn La dùng thử",
        rating: 5,
        comment: "Đóng gói sạch, thịt trâu thơm và chẩm chéo rất hợp khẩu vị gia đình.",
        avatar: null,
      },
      {
        id: -2,
        customerName: "Trần Đức Huy",
        packageName: "Set quà Mộc Châu cao cấp",
        rating: 5,
        comment: "Giỏ quà nhìn lịch sự, tư vấn nhanh, phù hợp biếu đối tác.",
        avatar: null,
      },
    ],
  });
}