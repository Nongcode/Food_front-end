/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeLocale } from "@/lib/i18n/config";
import { getActiveLanguages, getStaticTranslationMap, localizeContent } from "@/lib/i18n/server";
import { getSiteChromeConfig } from "@/lib/siteChrome";
import { getPublicPackageBySlug, getPublicPackageCollections, getPublicPackages } from "@/lib/packages";
import { normalizeLegacyText } from "@/lib/text/encoding";

const legacyDecoder = new TextDecoder("windows-1252");
const toLegacyMojibake = (value: string) => legacyDecoder.decode(Buffer.from(value, "utf8"));
const toDoubleLegacyMojibake = (value: string) => toLegacyMojibake(toLegacyMojibake(value));

const PUBLISHED_STATUS = "Đã xuất bản";
const OPEN_STATUS = "Đang mở";
const VISIBLE_STATUS = "Hiển thị";
export const PUBLISHED_STATUSES = [PUBLISHED_STATUS, toLegacyMojibake(PUBLISHED_STATUS), toDoubleLegacyMojibake(PUBLISHED_STATUS)];
export const OPEN_STATUSES = [OPEN_STATUS, toLegacyMojibake(OPEN_STATUS), toDoubleLegacyMojibake(OPEN_STATUS)];
export const VISIBLE_STATUSES = [VISIBLE_STATUS, toLegacyMojibake(VISIBLE_STATUS), toDoubleLegacyMojibake(VISIBLE_STATUS)];

const pageStatusKeys = [
  "site_status",
  "page_home_status",
  "page_tours_status",
  "page_offers_status",
  "page_destinations_status",
  "page_news_status",
  "page_contact_status",
  "page_local_specialties_status",
] as const;

export function getLocaleFromRequest(request: Request) {
  return normalizeLocale(new URL(request.url).searchParams.get("locale"));
}

export function publicJson(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: { "Cache-Control": "no-store", ...(init?.headers || {}) },
  });
}

export function getDateLocale(locale: string) {
  if (locale === "en") return "en-US";
  if (locale === "zh-CN") return "zh-CN";
  return "vi-VN";
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? normalizeLegacyText(value) : value;
}

export async function getPublicSiteChromeState(locale: string) {
  const [siteChrome, staticTranslations, activeLanguages, settings] = await Promise.all([
    getSiteChromeConfig(),
    getStaticTranslationMap(locale).catch(() => ({})),
    getActiveLanguages().catch(() => []),
    prisma.siteSetting.findMany({ where: { settingKey: { in: [...pageStatusKeys] } } }),
  ]);
  const pageStatuses = settings.reduce<Record<string, string | null>>((result, item) => {
    result[item.settingKey] = item.settingValue;
    return result;
  }, {});
  const hiddenPageKeys = Object.entries(pageStatuses).filter(([, value]) => value === "inactive").map(([key]) => key);
  return { siteChrome, staticTranslations, activeLanguages, siteStatus: pageStatuses.site_status || "active", pageStatuses, hiddenPageKeys };
}

export async function getHomePayload(locale: string) {
  const [packages, packageCollections, dbPosts, homepageBanners] = await Promise.all([
    getPublicPackages(locale),
    getPublicPackageCollections(locale),
    prisma.post.findMany({ where: { status: { in: PUBLISHED_STATUSES } }, orderBy: { createdAt: "desc" }, take: 3, include: { category: true } }),
    prisma.banner.findMany({ where: { bannerType: "homepage", status: { in: OPEN_STATUSES } }, orderBy: { updatedAt: "desc" }, take: 6 }),
  ]);
  const localizedPosts = await Promise.all(dbPosts.map((post) => localizeContent("post", post, locale)));
  const dateLocale = getDateLocale(locale);
  return {
    packages,
    packageCollections,
    homepageBanners: homepageBanners.map((banner) => ({
      id: banner.id,
      title: normalizeText(banner.title),
      subtitle: normalizeText(banner.subtitle),
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      mediaType: banner.mediaType,
      bannerType: banner.bannerType,
      status: banner.status,
      updatedAt: banner.updatedAt,
    })),
    posts: localizedPosts.map((post) => ({
      id: post.id,
      category: post.category?.name || "Chưa phân loại",
      title: post.title,
      excerpt: post.excerpt || "",
      image: post.imageUrl || "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1000&q=80",
      readTime: post.readTime || "5 phút đọc",
      date: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(dateLocale) : new Date(post.createdAt).toLocaleDateString(dateLocale),
    })),
  };
}

export async function getPackagesPayload(locale: string) {
  const [packages, collections] = await Promise.all([getPublicPackages(locale), getPublicPackageCollections(locale)]);
  return { packages, collections };
}

export async function getPackageDetailPayload(slug: string, locale: string) {
  const [item, packages] = await Promise.all([getPublicPackageBySlug(slug, locale), getPublicPackages(locale)]);
  return item ? { package: item, packages } : null;
}

export async function getSpecialtiesPayload(locale: string) {
  const specialtiesRaw = await prisma.localSpecialty.findMany({ where: { status: { in: VISIBLE_STATUSES } }, orderBy: { createdAt: "desc" }, include: { destination: true } });
  const specialties = await Promise.all(specialtiesRaw.map(async (item) => {
    const localized = await localizeContent("local_specialty", item, locale);
    return {
      id: localized.id,
      slug: localized.slug,
      name: localized.name,
      type: localized.type,
      description: localized.description || "",
      imageUrl: localized.imageUrl || "",
      priceText: localized.priceText || "",
      priceValue: item.price ?? null,
      priceUnit: item.priceUnit ?? null,
      whereToBuy: localized.whereToBuy || "",
      destinationName: item.destination?.name || "",
    };
  }));
  return { specialties };
}

export async function getSpecialtyDetailPayload(slug: string, locale: string) {
  const itemRaw = await prisma.localSpecialty.findUnique({ where: { slug }, include: { detail: true } });
  if (!itemRaw || !VISIBLE_STATUSES.includes(itemRaw.status)) return null;
  const item = await localizeContent("local_specialty", itemRaw, locale);
  const detailRaw = itemRaw.detail;
  const detailLocalized = detailRaw ? await localizeContent("local_specialty_detail", detailRaw, locale) : null;
  const allSpecialtiesRaw = await prisma.localSpecialty.findMany({ where: { status: { in: VISIBLE_STATUSES } } });
  const specialtyNames = await Promise.all(allSpecialtiesRaw.map(async (specialty) => (await localizeContent("local_specialty", specialty, locale)).name));
  return {
    specialty: { ...item, priceValue: itemRaw.price ?? null, priceUnit: itemRaw.priceUnit ?? null },
    detail: {
      bannerImageUrl: detailLocalized?.bannerImageUrl || "",
      overview: detailLocalized?.overview || "",
      history: detailLocalized?.history || "",
      ingredients: detailLocalized?.ingredients || "",
      howToUse: detailLocalized?.howToUse || "",
      preservation: detailLocalized?.preservation || "",
    },
    specialtyNames,
  };
}

export async function getPostsPayload(locale: string) {
  const dbPosts = await prisma.post.findMany({ where: { status: { in: PUBLISHED_STATUSES } }, orderBy: { createdAt: "desc" }, include: { category: true } });
  const localizedPosts = await Promise.all(dbPosts.map((post) => localizeContent("post", post, locale)));
  const dateLocale = getDateLocale(locale);
  const posts = localizedPosts.map((post) => ({
    id: post.id,
    slug: post.slug,
    category: post.category?.name || "Cẩm nang",
    title: post.title,
    excerpt: post.excerpt || "",
    image: post.imageUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    readTime: post.readTime || "5 phút đọc",
    date: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(dateLocale) : new Date(post.createdAt).toLocaleDateString(dateLocale),
  }));
  return { posts, leadPost: posts[0] || null };
}

export async function getPostDetailPayload(idOrSlug: string, locale: string) {
  const numericId = Number(idOrSlug);
  const where = Number.isInteger(numericId) && numericId > 0 ? { id: numericId } : { slug: idOrSlug };
  const dbPost = await prisma.post.findUnique({ where, include: { category: true, author: true, relatedPackage: true } });
  if (!dbPost || !PUBLISHED_STATUSES.includes(dbPost.status)) return null;
  const localizedDbPost = await localizeContent("post", dbPost, locale);
  const dateLocale = getDateLocale(locale);
  const post = {
    id: localizedDbPost.id,
    slug: localizedDbPost.slug,
    category: localizedDbPost.category?.name || "Cẩm nang",
    title: localizedDbPost.title,
    date: localizedDbPost.publishedAt ? new Date(localizedDbPost.publishedAt).toLocaleDateString(dateLocale) : new Date(localizedDbPost.createdAt).toLocaleDateString(dateLocale),
    readTime: localizedDbPost.readTime || "5 phút đọc",
    author: {
      name: localizedDbPost.author?.name || "Sơn La Food Editor",
      avatar: localizedDbPost.author?.avatarUrl || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80",
      role: localizedDbPost.author?.role || "Người kể chuyện ẩm thực",
    },
    image: localizedDbPost.imageUrl || "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=85",
    summary: localizedDbPost.summary || "",
    relatedPackageSlug: localizedDbPost.relatedPackage?.slug || null,
    blocks: (localizedDbPost.contentBlocks as unknown[]) || [],
    createdAt: localizedDbPost.createdAt,
    updatedAt: localizedDbPost.updatedAt,
    publishedAt: localizedDbPost.publishedAt,
  };
  const [relatedPackage, dbRelatedPosts] = await Promise.all([
    post.relatedPackageSlug ? getPublicPackageBySlug(post.relatedPackageSlug, locale) : Promise.resolve(null),
    prisma.post.findMany({ where: { status: { in: PUBLISHED_STATUSES }, id: { not: post.id } }, orderBy: { createdAt: "desc" }, take: 2, include: { category: true } }),
  ]);
  const localizedRelatedPosts = await Promise.all(dbRelatedPosts.map((item) => localizeContent("post", item, locale)));
  const relatedPosts = localizedRelatedPosts.map((relatedPost) => ({
    id: relatedPost.id,
    category: relatedPost.category?.name || "Cẩm nang",
    title: relatedPost.title,
    excerpt: relatedPost.excerpt || "",
    image: relatedPost.imageUrl || "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1000&q=80",
    readTime: relatedPost.readTime || "5 phút đọc",
    date: relatedPost.publishedAt ? new Date(relatedPost.publishedAt).toLocaleDateString(dateLocale) : new Date(relatedPost.createdAt).toLocaleDateString(dateLocale),
  }));
  return { post, relatedPackage, relatedPosts };
}

export async function getReviewsPayload(locale: string) {
  const reviewTranslations: Record<string, Record<string, { comment: string; package: string }>> = {
    "Nguyễn Mai Anh": {
      en: { comment: "Clean packaging, fragrant smoked meat and cham cheo that suited my family very well.", package: "Son La Specialty Trial Set" },
      "zh-CN": { comment: "包装干净，熏肉很香，蘸料很适合家庭口味。", package: "山罗特产尝鲜组合" },
    },
    "Trần Đức Huy": {
      en: { comment: "The gift basket looked polished, advice was quick, and it worked well for business gifting.", package: "Premium Moc Chau Gift Set" },
      "zh-CN": { comment: "礼篮很精致，咨询回复很快，适合商务赠礼。", package: "高端木州礼盒" },
    },
  };
  const dbReviews = await prisma.review.findMany({ where: { status: { in: VISIBLE_STATUSES } }, orderBy: { createdAt: "desc" }, take: 6 });
  return { reviews: dbReviews.map((review) => ({
    id: review.id,
    customerName: review.customerName,
    packageName: reviewTranslations[review.customerName]?.[locale]?.package || review.packageName,
    rating: review.rating,
    comment: reviewTranslations[review.customerName]?.[locale]?.comment || review.comment,
    avatar: review.avatar,
  })) };
}