import { MetadataRoute } from "next";
import { absoluteUrl, sitemapAlternates } from "@/lib/seo";
import { getPublicPackages } from "@/lib/packages";
import { getPublicPosts, getPublicSpecialties } from "@/lib/publicContent";

function sitemapEntry(path: string, lastModified: Date, changeFrequency: "daily" | "weekly" | "monthly", priority: number) {
  return {
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
    alternates: sitemapAlternates(path),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [{ posts }, packages, { specialties }] = await Promise.all([
    getPublicPosts("vi"),
    getPublicPackages("vi"),
    getPublicSpecialties("vi"),
  ]);

  const routes = [
    sitemapEntry("/", now, "daily", 1),
    sitemapEntry("/goi-du-lich", now, "daily", 0.9),
    sitemapEntry("/tin-tuc", now, "daily", 0.8),
    sitemapEntry("/dac-san", now, "daily", 0.8),
    sitemapEntry("/lien-he", now, "daily", 0.5),
  ];

  const postRoutes = posts.map((post) => sitemapEntry(`/tin-tuc/${post.id}`, now, "weekly", 0.8));
  const packageRoutes = packages.map((pkg) => sitemapEntry(`/goi-du-lich/${pkg.slug}`, now, "weekly", 0.8));
  const specialtyRoutes = specialties.map((spec) => sitemapEntry(`/dac-san/${spec.slug}`, now, "monthly", 0.8));

  return [...routes, ...postRoutes, ...packageRoutes, ...specialtyRoutes];
}