/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { allPackages, packageCollections as staticCollections } from "@/app/data/travel";
import { normalizeLocale } from "@/lib/i18n/config";
import { localizeContent } from "@/lib/i18n/server";
import { normalizeLegacyText } from "@/lib/text/encoding";

export type PublicPackage = {
  id: number;
  slug: string;
  name: string;
  destination: string;
  rawDestination: string;
  duration: string;
  price: string;
  priceValue: number | null;
  priceUnit: string | null;
  summary: string;
  description: string;
  minPeople?: number | null;
  maxPeople?: number | null;
  peopleNote?: string;
  offer?: { id: number; title: string; description?: string; tag?: string } | null;
  image: string;
  status: string;
  detailContent?: unknown;
};

export type PublicPackageCollection = {
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  items: PublicPackage[];
};

const fallbackImage = "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80";

const collectionTranslations: Record<string, Record<string, { eyebrow: string; title: string; description: string }>> = {
  family: {
    en: {
      eyebrow: "Family food sets",
      title: "Easy Son La specialty sets for family meals",
      description: "Ready-to-use smoked meats, tea, spices and seasonal fruit sets that are simple to serve, gift and reorder.",
    },
    "zh-CN": {
      eyebrow: "家庭特产组合",
      title: "适合家庭餐桌的山罗特产组合",
      description: "精选熏肉、茶、香料和时令水果，方便食用、送礼和再次订购。",
    },
  },
  youth: {
    en: {
      eyebrow: "Gifts for friends",
      title: "Compact Northwest flavors made for sharing",
      description: "Small food gifts, dipping spices and neatly packed sets for friends, picnics, office treats or casual tasting sessions.",
    },
    "zh-CN": {
      eyebrow: "朋友礼物",
      title: "适合分享的小份西北风味",
      description: "小份食品礼盒、蘸料和整洁包装的组合，适合送朋友、野餐或办公室分享。",
    },
  },
  vietnam: {
    en: {
      eyebrow: "Signature Son La specialties",
      title: "The first Son La flavors worth trying",
      description: "Representative smoked meats, cham cheo spice, Shan tea and seasonal produce for customers discovering Son La cuisine.",
    },
    "zh-CN": {
      eyebrow: "山罗代表特产",
      title: "值得先尝试的山罗风味",
      description: "代表性的熏肉、蘸料、山雪茶和时令农产，适合初次了解山罗美食的顾客。",
    },
  },
};

function formatPriceText(price: string, locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  if (normalizedLocale === "vi") return price;
  const match = price.match(/[\d.]+/);
  if (!match) return price;
  const amount = match[0].replace(/\./g, ",");
  return normalizedLocale === "zh-CN" ? `${amount} VND` : `From ${amount} VND`;
}

const staticPackageTranslations: Record<string, Record<string, { name: string; summary: string }>> = {
  "combo-dac-san-son-la": {
    en: { name: "Son La Specialty Trial Set", summary: "A compact set with smoked buffalo, cham cheo spice, Shan tea and a seasonal dried fruit item." },
    "zh-CN": { name: "山罗特产尝鲜组合", summary: "包含熏牛肉、蘸料、山雪茶和一款时令果干的小份组合。" },
  },
  "set-qua-moc-chau-cao-cap": {
    en: { name: "Premium Moc Chau Gift Set", summary: "A polished gift basket with tea, dried plum, yogurt rice, honey and a greeting card." },
    "zh-CN": { name: "高端木州礼盒", summary: "包含茶、果干、蜂蜜和贺卡的精致礼篮。" },
  },
  "gia-vi-cham-cheo-mac-khen": {
    en: { name: "Cham Cheo and Mac Khen Spice Set", summary: "Northwest dipping spices for grilled meat, boiled vegetables, green fruit and marinades." },
    "zh-CN": { name: "蘸料和山胡椒香料组合", summary: "适合烤肉、蔬菜、水果和腌制的西北风味香料。" },
  },
  "combo-trai-cay-yen-chau": {
    en: { name: "Seasonal Yen Chau Fruit Set", summary: "Fresh or dried Yen Chau fruit packed according to the harvest season." },
    "zh-CN": { name: "安州时令水果组合", summary: "按采收季节包装的新鲜或果干组合。" },
  },
};

function fromStaticPackage(item: any, locale = "vi"): PublicPackage {
  const normalizedLocale = normalizeLocale(locale);
  const translated = staticPackageTranslations[item.slug]?.[normalizedLocale];

  return {
    id: item.id,
    slug: item.slug,
    name: normalizeLegacyText(translated?.name || item.name),
    destination: normalizeLegacyText(item.destination),
    rawDestination: normalizeLegacyText(item.destination),
    duration: normalizeLegacyText(item.duration),
    price: formatPriceText(item.price || "", locale),
    priceValue: null,
    priceUnit: null,
    summary: normalizeLegacyText(translated?.summary || item.summary),
    description: normalizeLegacyText(translated?.summary || item.description || item.summary),
    minPeople: null,
    maxPeople: null,
    peopleNote: "",
    offer: null,
    image: item.image,
    status: item.status,
  };
}

function fromDbPackage(item: any, locale = "vi"): PublicPackage {
  return {
    id: item.id,
    slug: item.slug,
    name: normalizeLegacyText(item.name),
    destination: normalizeLegacyText(typeof item.destination === "string" ? item.destination : item.destination?.name || ""),
    rawDestination: normalizeLegacyText(item.rawDestination || (typeof item.destination === "string" ? item.destination : item.destination?.name || "")),
    duration: normalizeLegacyText(item.duration || ""),
    price: formatPriceText(item.priceText || "", locale),
    priceValue: typeof item.price === "number" ? item.price : null,
    priceUnit: item.priceUnit || null,
    summary: normalizeLegacyText(item.summary || ""),
    description: normalizeLegacyText(item.description || item.summary || ""),
    minPeople: item.minPeople ?? null,
    maxPeople: item.maxPeople ?? null,
    peopleNote: item.peopleNote || "",
    offer: item.offer ? { id: item.offer.id, title: item.offer.title, description: item.offer.description || "", tag: item.offer.tag || "" } : null,
    image: item.imageUrl || item.image || fallbackImage,
    status: item.status,
    detailContent: item.detail || item.detailContent,
  };
}

function localizeCollectionCopy(collection: { eyebrow: string; title: string; description: string; accent: string }, locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const translated = collectionTranslations[collection.accent]?.[normalizedLocale];
  return translated ? { ...collection, ...translated } : collection;
}

function uniquePackages(items: PublicPackage[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.slug || String(item.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function uniqueCollections(collections: PublicPackageCollection[]) {
  const seen = new Set<string>();
  return collections.filter((collection) => {
    const key = collection.accent || collection.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function ensureMinimumCollectionItems(items: PublicPackage[], fallbackItems: PublicPackage[], minItems = 5) {
  const sourceItems = uniquePackages(items);
  const baseItems = sourceItems.length > 0 ? sourceItems : uniquePackages(fallbackItems);
  if (baseItems.length === 0) return [];

  const result = [...baseItems];
  let index = 0;
  while (result.length < minItems) {
    result.push(baseItems[index % baseItems.length]);
    index += 1;
  }
  return result;
}

export async function getPublicPackages(locale = "vi") {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { id: "asc" },
      include: { destination: true, offer: true, detail: true },
    });
    if (packages.length === 0) return allPackages.map((item) => fromStaticPackage(item, locale));

    const localized = await Promise.all(
      packages.map(async (pkg) => {
        const source = { ...pkg, destination: pkg.destination?.name || "", rawDestination: pkg.destination?.name || "" } as any;
        return fromDbPackage(await localizeContent("package", source, locale), locale);
      }),
    );
    return localized;
  } catch (error) {
    console.error("Failed to load public packages:", error);
    return allPackages.map((item) => fromStaticPackage(item, locale));
  }
}

export async function getPublicPackageBySlug(slug: string, locale = "vi") {
  try {
    const pkg = await prisma.package.findUnique({
      where: { slug },
      include: { destination: true, offer: true, detail: true },
    });
    if (!pkg) {
      const fallback = allPackages.find((item) => item.slug === slug);
      return fallback ? fromStaticPackage(fallback, locale) : null;
    }
    const source = { ...pkg, destination: pkg.destination?.name || "", rawDestination: pkg.destination?.name || "" } as any;
    return fromDbPackage(await localizeContent("package", source, locale), locale);
  } catch (error) {
    console.error("Failed to load public package:", error);
    const fallback = allPackages.find((item) => item.slug === slug);
    return fallback ? fromStaticPackage(fallback, locale) : null;
  }
}

export async function getPublicPackageCollections(locale = "vi"): Promise<PublicPackageCollection[]> {
  const packages = await getPublicPackages(locale);
  const bySlug = new Map(packages.map((pkg) => [pkg.slug, pkg]));

  try {
    const collections = await prisma.packageCollection.findMany({
      orderBy: { id: "asc" },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          include: { package: { include: { destination: true, offer: true, detail: true } } },
        },
      },
    });

    if (collections.length === 0) throw new Error("NO_COLLECTIONS");

    const mappedCollections = collections.map((collection, index) => {
      const copy = localizeCollectionCopy(
        {
          eyebrow: collection.eyebrow || "",
          title: collection.title,
          description: collection.description || "",
          accent: collection.accent || "collection",
        },
        locale,
      );

      return {
        key: collection.accent || `db-${collection.id}-${index}`,
        ...copy,
        items: ensureMinimumCollectionItems(collection.items.map((item) => bySlug.get(item.package.slug) || fromDbPackage(item.package, locale)).filter(Boolean), packages, 5),
      };
    });

    return uniqueCollections(mappedCollections);
  } catch {
    const mappedCollections = staticCollections.map((collection, index) => {
      const copy = localizeCollectionCopy(collection, locale);
      return {
        key: collection.accent || `static-${index}`,
        ...copy,
        items: ensureMinimumCollectionItems(collection.items.map((item) => bySlug.get(item.slug) || fromStaticPackage(item, locale)), packages, 5),
      };
    });

    return uniqueCollections(mappedCollections);
  }
}



