/* eslint-disable @typescript-eslint/no-explicit-any */
import { allPackages, packageCollections as staticCollections } from "@/app/data/food";
import { publicApiFetch } from "@/lib/publicApi";

export type PublicPackage = {
  id: number;
  slug: string;
  name: string;
  destination: string;
  rawDestination: string;
  duration: string;
  price: string;
  priceValue?: number | null;
  priceUnit?: string | null;
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

function fromStaticPackage(item: any): PublicPackage {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    destination: item.destination,
    rawDestination: item.destination,
    duration: item.duration,
    price: item.price || "",
    priceValue: null,
    priceUnit: null,
    summary: item.summary,
    description: item.description || item.summary,
    minPeople: null,
    maxPeople: null,
    peopleNote: "",
    offer: null,
    image: item.image,
    status: item.status,
  };
}

export function fallbackPackages() {
  return allPackages.map(fromStaticPackage);
}

export function fallbackCollections(): PublicPackageCollection[] {
  const packages = fallbackPackages();
  const bySlug = new Map(packages.map((pkg) => [pkg.slug, pkg]));
  return staticCollections.map((collection, index) => ({
    key: collection.accent || `static-${index}`,
    eyebrow: collection.eyebrow,
    title: collection.title,
    description: collection.description,
    accent: collection.accent,
    items: collection.items.map((item) => bySlug.get(item.slug) || fromStaticPackage(item)),
  }));
}

export async function getPublicPackages(locale = "vi") {
  const payload = await publicApiFetch<{ packages: PublicPackage[] }>("/api/public/packages", locale, { packages: fallbackPackages() });
  return payload.packages;
}

export async function getPublicPackageBySlug(slug: string, locale = "vi") {
  const payload = await publicApiFetch<{ package: PublicPackage } | null>(`/api/public/packages/${slug}`, locale, null);
  if (payload?.package) return payload.package;
  return fallbackPackages().find((item) => item.slug === slug) || null;
}

export async function getPublicPackageCollections(locale = "vi") {
  const payload = await publicApiFetch<{ collections: PublicPackageCollection[] }>("/api/public/packages", locale, { collections: fallbackCollections() });
  return payload.collections;
}