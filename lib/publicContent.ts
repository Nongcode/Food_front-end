import { DEFAULT_SITE_CHROME_CONFIG } from "@/lib/siteChromeShared";
import { publicApiFetch } from "@/lib/publicApi";
import type { LanguageOption, TranslationMap } from "@/lib/i18n/server";
import type { PublicPackage, PublicPackageCollection } from "@/lib/packages";

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

export const fallbackSiteChromeState: PublicSiteChromeState = {
  siteChrome: DEFAULT_SITE_CHROME_CONFIG,
  staticTranslations: {},
  activeLanguages: [],
  siteStatus: "active",
  pageStatuses: {},
  hiddenPageKeys: [],
};

export function getPublicSiteChromeState(locale: string) {
  return publicApiFetch<PublicSiteChromeState>("/api/public/site-chrome", locale, fallbackSiteChromeState);
}

export function getPublicHome(locale: string) {
  return publicApiFetch<PublicHomePayload>("/api/public/home", locale, {
    packages: [],
    packageCollections: [],
    homepageBanners: [],
    posts: [],
  });
}

export function getPublicSpecialties(locale: string) {
  return publicApiFetch<{ specialties: PublicSpecialty[] }>("/api/public/local-specialties", locale, { specialties: [] });
}

export function getPublicSpecialtyDetail(slug: string, locale: string) {
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
  } | null>(`/api/public/local-specialties/${slug}`, locale, null);
}

export function getPublicPosts(locale: string) {
  return publicApiFetch<{ posts: PublicPostCard[]; leadPost: PublicPostCard | null }>("/api/public/posts", locale, { posts: [], leadPost: null });
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
  return publicApiFetch<{ reviews: PublicReview[] }>("/api/public/reviews", locale, { reviews: [] });
}