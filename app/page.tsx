import { publicPageMetadata } from "@/lib/seo";
import { PageDisabled } from "./components/PageDisabled";
import Link from "next/link";
import { JsonLd } from "./components/JsonLd";
import { DestinationTabs } from "./components/DestinationTabs";
import { PackageCarousel } from "./components/PackageCarousel";
import { PostCarousel } from "./components/PostCarousel";
import { CustomSelect } from "./components/CustomSelect";
import { HeroMediaCarousel } from "./components/HeroMediaCarousel";
import { SiteHeader } from "./components/SiteHeader";
import { tripStyles } from "./data/travel";
import { isSitePageInactive } from "@/lib/siteSettings";
import { withLocalePrefix } from "@/lib/i18n/config";
import { getRequestLocale, getStaticTranslationMap, translateFromMap } from "@/lib/i18n/server";
import { getPublicHome } from "@/lib/publicContent";
import type { PublicPackage, PublicPackageCollection } from "@/lib/packages";

export const dynamic = "force-dynamic";

export const metadata = publicPageMetadata({
  title: "Sơn La Food - Đặc sản Tây Bắc, quà biếu và ẩm thực Sơn La",
  description: "Sơn La Food giới thiệu đặc sản Sơn La, set quà biếu Tây Bắc, thịt gác bếp, chẩm chéo, chè Shan tuyết và nông sản theo mùa.",
  path: "/",
});

const legacyDecoder = new TextDecoder("windows-1252");
const toLegacyMojibake = (value: string) => legacyDecoder.decode(Buffer.from(value, "utf8"));
const toDoubleLegacyMojibake = (value: string) => toLegacyMojibake(toLegacyMojibake(value));

const PUBLISHED_STATUS = "Đã xuất bản";
const OPEN_STATUS = "Đang mở";
const PUBLISHED_STATUSES = [PUBLISHED_STATUS, toLegacyMojibake(PUBLISHED_STATUS), toDoubleLegacyMojibake(PUBLISHED_STATUS)];
const OPEN_STATUSES = [OPEN_STATUS, toLegacyMojibake(OPEN_STATUS), toDoubleLegacyMojibake(OPEN_STATUS)];

const collectionFlavorTags: Record<string, string[]> = {
  family: ["Bữa cơm nhà", "Dễ dùng", "Vị quen"],
  youth: ["Dễ chia sẻ", "Nhỏ gọn", "Quà bạn bè"],
  vietnam: ["Đậm bản địa", "Nên thử", "Chuẩn Sơn La"],
  gift: ["Biếu tặng", "Hộp đẹp", "Chỉn chu"],
  spice: ["Cay thơm", "Mắc khén", "Chấm nướng"],
  fruit: ["Theo mùa", "Tươi mới", "Yên Châu"],
};

function getCollectionFlavorTags(accent: string) {
  return collectionFlavorTags[accent] || ["Đặc sản", "Dễ chọn", "Giao tận nơi"];
}

type ProductCategoryCopy = {
  eyebrow: string;
  title: string;
  description: string;
};

const productCategoryCopyByAccent: Record<string, ProductCategoryCopy> = {
  family: {
    eyebrow: "DANH MỤC GIA ĐÌNH",
    title: "Món ngon dùng hằng ngày",
    description: "Các đặc sản dễ ăn, dễ chế biến và phù hợp cho bữa cơm nhà hoặc mua thử lần đầu.",
  },
  youth: {
    eyebrow: "ĐỒ ĂN CHIA SẺ",
    title: "Món nhỏ gọn cho bạn bè",
    description: "Đồ khô, gia vị và sản phẩm đóng gói tiện mang đi chơi, picnic hoặc tặng người thân.",
  },
  vietnam: {
    eyebrow: "ĐẶC SẢN TIÊU BIỂU",
    title: "Hương vị Sơn La nên thử",
    description: "Những sản phẩm đại diện cho ẩm thực Tây Bắc, phù hợp để khách mới dễ chọn đúng món.",
  },
  gift: {
    eyebrow: "QUÀ BIẾU",
    title: "Set quà chỉn chu theo dịp",
    description: "Các sản phẩm có thể phối thành hộp quà, giỏ quà hoặc set biếu tặng cho đối tác và gia đình.",
  },
  spice: {
    eyebrow: "GIA VỊ TÂY BẮC",
    title: "Mắc khén, chẩm chéo và đồ chấm",
    description: "Nhóm gia vị giúp món nướng, món luộc và trái cây xanh rõ hương vị Sơn La hơn.",
  },
  fruit: {
    eyebrow: "NÔNG SẢN THEO MÙA",
    title: "Trái cây và sản phẩm mùa vụ",
    description: "Mận hậu, xoài Yên Châu và các món sấy đóng gói theo lịch thu hái thực tế.",
  },
};

const travelBannerMarkers = [
  "danang",
  "hanoi",
  "visa",
  "journey",
  "travel",
  "tour",
  "drone_flight",
  "landscape",
  "beach",
];

function isLegacyTravelBanner(imageUrl: string) {
  const normalizedImageUrl = imageUrl.toLowerCase();
  const isOldLocalVideoBanner = normalizedImageUrl.includes("/banners/") && /\.(mp4|webm|mov)(\?|$)/i.test(normalizedImageUrl);

  return isOldLocalVideoBanner || travelBannerMarkers.some((marker) => normalizedImageUrl.includes(marker));
}
const productCategoryOrder = ["family", "youth", "vietnam", "gift", "spice", "fruit"] as const;
type ProductCategoryAccent = (typeof productCategoryOrder)[number];

const productCategoryKeywords: Record<ProductCategoryAccent, string[]> = {
  family: ["combo", "dac-san", "dung-thu", "gia-dinh", "gac-bep", "thit"],
  youth: ["do-kho", "gia-vi", "trai-cay", "say", "combo", "qua"],
  vietnam: [],
  gift: ["qua", "set-qua", "gift", "hop-qua", "gio-qua", "moc-chau"],
  spice: ["gia-vi", "cham-cheo", "mac-khen", "cay-thom"],
  fruit: ["trai-cay", "yen-chau", "xoai", "man", "say", "theo-mua"],
};
const comboTabCopyByAccent: Record<ProductCategoryAccent, { label: string; title: string }> = {
  family: { label: "Combo bữa cơm nhà", title: "Set đặc sản cho bữa cơm gia đình" },
  youth: { label: "Combo chia sẻ", title: "Món nhỏ gọn cho bạn bè và picnic" },
  vietnam: { label: "Combo dùng thử", title: "Hương vị Sơn La dễ chọn lần đầu" },
  gift: { label: "Combo quà biếu", title: "Set quà chỉn chu theo dịp" },
  spice: { label: "Combo gia vị", title: "Mắc khén, chẩm chéo và đồ chấm" },
  fruit: { label: "Combo theo mùa", title: "Trái cây và nông sản mùa vụ" },
};
function getProductCategoryCopy(collection: { eyebrow: string; title: string; description: string; accent: string }) {
  return productCategoryCopyByAccent[collection.accent] || {
    eyebrow: collection.eyebrow || "DANH MỤC SẢN PHẨM",
    title: collection.title,
    description: collection.description,
  };
}

function getPackageSearchText(item: PublicPackage) {
  return [
    item.slug,
    item.name,
    item.destination,
    item.rawDestination,
    item.duration,
    item.summary,
    item.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getFallbackCategoryItems(accent: ProductCategoryAccent, packages: PublicPackage[]) {
  const keywords = productCategoryKeywords[accent];
  if (keywords.length === 0) return packages;

  const matched = packages.filter((item) => {
    const searchText = getPackageSearchText(item);
    return keywords.some((keyword) => searchText.includes(keyword));
  });

  return matched.length > 0 ? matched : packages;
}

function buildDisplayProductCategories(
  packageCollections: PublicPackageCollection[],
  packages: PublicPackage[],
): PublicPackageCollection[] {
  const collectionByAccent = new Map(packageCollections.map((collection) => [collection.accent, collection]));

  return productCategoryOrder.map((accent) => {
    const sourceCollection = collectionByAccent.get(accent);
    const copy = productCategoryCopyByAccent[accent];

    return {
      key: sourceCollection?.key || accent,
      accent,
      eyebrow: copy.eyebrow,
      title: copy.title,
      description: copy.description,
      items: sourceCollection?.items?.length ? sourceCollection.items : getFallbackCategoryItems(accent, packages),
    };
  });
}
const homeAssurances = [
  {
    title: "Giao hàng",
    description: "Toàn quốc",
    icon: String.raw`<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 512 512">
                                            <path d="M512,459v5c-2,2.58-3.68,5.53-6.08,7.67-4.83,4.33-9.91,8.41-15.13,12.27a74.41,74.41,0,0,1-46.6,15.1c-13.85-.23-26.3-4.94-38.6-10.74-18-8.5-36.43-11.66-55.26-2.32-6.41,3.17-12.78,6.42-19.17,9.65-19,9.58-38.82,12-59,5.1-11-3.75-21.42-9.1-31.86-14.23Q216.86,475,193,484.82c-10,4.12-19.63,9-29.55,13.34-11.77,5.09-24.11,6-36.72,4.34-13.57-1.77-25.89-7.19-38.14-12.85-13.47-6.22-27-5.92-40.72-.55C34.59,494.3,24.17,503.69,13,512H0V500c3.64-7.83,11.05-11.82,17.47-16.67,13.78-10.42,29-18.15,46.63-18.16,10.15,0,20.3,1.92,30.43,3-.25-.85-.67-2.42-1.14-4q-24.51-82.49-49-165c-2.57-8.67-1.36-11.8,6.44-16.54,13.8-8.38,27.57-16.81,41.46-25C95,256,96.1,254.26,96.08,251c-.15-26-.09-52-.07-78,0-9.49,3.5-12.95,13-13,5.59,0,11.18,0,17,0V134.33c0-11.23,3.06-14.31,14.2-14.32h27.3c0-9.38-.06-18.18,0-27,.08-9.49,3.59-13,13-13,13.32,0,26.65,0,40,0H226c0-22.68.12-44.65-.07-66.62C225.87,7,227.85,2.38,234,0h44c6.15,2.38,8.13,7,8.07,13.39-.19,20.33-.07,40.66-.07,61V80h44.54c10.72,0,13.93,3.22,14,14,0,8.46,0,16.92,0,25.94h20.35c20.67,0,21.14.47,21.14,20.88V160c5.95,0,11.25,0,16.56,0,10.12,0,13.43,3.36,13.44,13.57,0,25.5.08,51-.09,76.49,0,3.75,1,5.94,4.33,7.91,13.66,8,27.12,16.28,40.64,24.48,8.38,5.07,9.37,7.75,6.52,17.32q-23.61,79.4-47.22,158.79c-1.21,4.09-2.32,8.22-3.5,12.4,17.52,8.78,35.09,11.88,52.64,2.74,8.3-4.32,15.64-10.66,23-16.63C500.86,450.1,505.57,450.31,512,459ZM266,187.78V472c0,.67-.22,1.45.05,2,.66,1.31,1.31,3.32,2.38,3.62,8.43,2.37,16.84,5.22,25.47,6.36,13,1.71,24.44-3.71,35.45-9.88,21.46-12,44-17.8,68.83-11.47,16.39-55.18,32.67-109.95,49-165ZM64.92,297.48c.29,1.17.45,2,.68,2.75q9.23,31.11,18.44,62.2,17,57.4,34,114.83c1,3.35,2.61,5.33,6,5.38,7.27.1,15,1.51,21.71-.41,10.44-3,20.43-7.8,30.21-12.67,12.64-6.28,25.76-10.45,39.84-9.37,10,.76,19.91,3.21,29.79,4.9V188ZM365.76,140.35H146.4v19.42H365.76Zm-146.16,40H116.33V243Zm74.3-.12-.32.85L395.74,243V180.25Zm30.43-79.85H187.82v19.24H324.33ZM265.79,20.28h-19.5V79.66h19.5Z">
                                            </path>
                                            <path d="M406.28,303.72a9.51,9.51,0,0,1-12.56,9.4,20.26,20.26,0,0,1-4.49-2.12Q359,292.43,328.85,273.77a18.1,18.1,0,0,1-4.58-3.8c-2.92-3.65-3.12-7.76-.44-11.56s6.36-5.28,10.93-3.83a18.44,18.44,0,0,1,4.06,1.87q30.63,18.84,61.23,37.74C403.6,296.39,406.36,299.13,406.28,303.72Z">
                                            </path>
                                            <path d="M307.74,243.26a10,10,0,0,1-9.63,9.62A10.45,10.45,0,0,1,288,243.16c-.1-5.21,4.51-10.07,9.64-10.16C303,232.89,307.77,237.72,307.74,243.26Z">
                                            </path>
                                            <path d="M110.21,303.91c2.72-3.48,4.32-7,7.06-8.79,20.54-13.28,41.28-26.27,62-39.23,5.77-3.61,11.95-2.43,15,2.42s1.44,10.73-4.44,14.47c-20.5,13-41.09,25.94-61.63,38.92-3.84,2.43-8,3.27-11.67.47C114.14,310.35,112.7,307.28,110.21,303.91Z">
                                            </path>
                                            <path d="M220.08,232.17c4.95.14,9.82,5.39,9.62,10.36a10.25,10.25,0,0,1-10.35,9.5,9.94,9.94,0,0,1,.73-19.86Z">
                                            </path>
                                        </svg>`,
  },
  {
    title: "Đóng gói",
    description: "Sạch sẽ & kỹ càng",
    icon: String.raw`<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 387 369.2">
                                            <path d="M1.5,197.6a4.7,4.7,0,0,0,.6-.9c3.5-11.9,11.3-17.8,23.6-17.8h7.8a126,126,0,0,1,19-45.4,5.9,5.9,0,0,0,.3-4.7c-3.6-11.3-7.1-22.7-6.3-34.8.6-9.5,5.7-14.6,15.2-14.9a57.7,57.7,0,0,1,34.8,9.6c2.1,1.4,3.6,1.1,5.7.1,9.2-4.4,18.6-8.4,27.9-12.6l2.4-1.1c-4.9-25.8,2-47.2,23.4-62.3s42.3-15.1,63.5-2.2c24,14.7,31.9,37.1,26.9,64.7,4.4,1.7,8.9,3.4,13.4,5.3,32.8,14.2,58.8,36,75.3,68.3a115.2,115.2,0,0,1,11.9,41.5c.1,1.4,1.1,3.6,2.2,4a17.4,17.4,0,0,0,24-16.8c-.2-3.3-1.4-6.6-2.5-9.7s-.8-7.5,2.4-9.1,6.9-.2,8.6,3.6,2.6,6.9,3.9,10.4v9.8c-.2.7-.5,1.4-.7,2.1-3.1,12.8-11.6,20.9-24.7,22.8-4.1.6-8.3.1-11.6.1-2.8,11.3-4.7,22.7-8.4,33.4-7.7,22.3-21.6,40.4-39.3,55.7-1.7,1.4-3.5,3.5-3.7,5.5-1.5,13-2.5,26.1-3.7,39.2-1.4,14.9-11.8,25.2-26.4,26.2s-25.2-8.4-28.6-22.6c-1.1-4.8-2.3-9.6-3.5-14.8a188.5,188.5,0,0,1-91.1,0c-1.3,5.6-2.3,10.9-3.6,16-3.4,13.2-15.6,22.4-28.5,21.4s-24.8-11.1-26.2-24.5-2.4-26.9-3.8-40.3a8.8,8.8,0,0,0-2.7-5.2,140.5,140.5,0,0,1-30.4-35.3,4.6,4.6,0,0,0-4.8-2.6q-9.7.2-19.5,0a22.7,22.7,0,0,1-22-16.6,16.7,16.7,0,0,0-.8-2Zm244-91.7c4.6,1.8,6.3,4.9,4.9,8.6s-4.8,4.6-9.5,2.9c-32-12.2-64.3-12.8-96.9-2.3-2.5.8-4.9,1.9-7.3,2.7s-7.2-.1-8.4-3.4.2-6.6,4-8.1,9.6-3.5,14.3-5.2c-3-4.4-5.8-8.7-8.9-12.9-.4-.6-2.3-.7-3.1-.3-10.3,4.6-20.5,9.1-30.5,14.1-4,2.1-7,2.4-10.6-.4A50.1,50.1,0,0,0,67.3,91.3c-8-.8-10,.8-8.4,8.8a269.7,269.7,0,0,0,6.9,27.5c1.2,4.1,1.3,7.2-1.3,10.8a107,107,0,0,0-19.4,46.2c-.9,5.2-2.8,6.7-8.1,6.8H24.2c-5.9.2-10.1,3.8-10.2,9.8q-.3,18.2,0,36.3c.2,5.9,4.4,9.6,10.4,9.6q12.1.3,24.3,0c3.8,0,6.4,1.3,8.2,4.7A121.4,121.4,0,0,0,89.6,290a10.8,10.8,0,0,1,4.3,8.2c1.1,14.1,2.4,28.1,3.7,42.2.7,8.2,6.7,14.3,14.4,14.7s14.3-4.4,16.2-12.5,3.1-13.4,4.6-20.1,4.1-7.1,9.2-5.7a173,173,0,0,0,94.4.1c5.6-1.6,8.3.1,9.6,6l4.5,19.7c2,8.3,8.5,13.1,16.7,12.5s13.2-6.6,14-14.7c1.2-13.9,2.6-27.9,3.6-41.8a11.7,11.7,0,0,1,5-9.1c17.5-14,31.1-31.1,38.6-52.4,13.3-37.4,6.7-71.9-17.4-103-17.2-22.3-40-36.8-66.4-46.1-2.4-.9-3.6-.5-4.7,1.8a41.7,41.7,0,0,1-3.7,5.6c-1.3,1.8-2.7,3.5-4.4,5.6C236.6,102.7,241.1,104.2,245.5,105.9ZM146.1,44.6a46,46,0,0,0,13.2,50.8,7.1,7.1,0,0,0,6.3,1.9,160.9,160.9,0,0,1,48.5-.1,5.4,5.4,0,0,0,4.3-1.1C232.8,83.6,238.7,68,234,49.4s-17.3-29.8-36-34.1a82,82,0,0,0-8.5-1A46.8,46.8,0,0,0,146.1,44.6Z" transform="translate(0 0.1)"></path>
                                            <path d="M265.1,369.2c-13.3,0-24.8-9.6-28.2-23.8-.7-3.3-1.5-6.5-2.3-9.9l-.8-3.5a190.4,190.4,0,0,1-88.8,0l-.9,3.8c-.8,3.7-1.6,7.2-2.5,10.8-3.5,13.8-16.4,23.5-30,22.5S85.5,357.4,84,343.3c-.6-6.1-1.1-12.3-1.7-18.3s-1.3-14.7-2.1-22a7.3,7.3,0,0,0-2.1-4.3C65.1,287.7,55,276,47.3,263a3.2,3.2,0,0,0-3.4-1.8c-6,.1-12.4.1-19.6,0A24.3,24.3,0,0,1,.9,243.6a11.2,11.2,0,0,0-.5-1.3l-.3-.6a1.3,1.3,0,0,1-.1-.6V197.6a1.9,1.9,0,0,1,.2-.8l.3-.4.2-.2c3.7-12.4,12.1-18.8,25-18.8h6.6a125.2,125.2,0,0,1,19-44.7,4.9,4.9,0,0,0,.1-3.4C48,118.7,44.2,106.7,45,93.9c.6-10.3,6.4-15.9,16.7-16.3a60,60,0,0,1,35.6,9.8c1.6,1,2.4.9,4.2.1,6.8-3.3,13.8-6.4,20.6-9.4l7.4-3.3,1.3-.6c-4.7-26.9,3.4-47.9,24.2-62.6s43.5-15.5,65.1-2.3c23.4,14.3,32.8,36.2,27.8,65l3.1,1.2,9.3,3.7c35.4,15.4,60.2,38,76,69a117.8,117.8,0,0,1,12.1,42,4.6,4.6,0,0,0,1.3,2.8,16,16,0,0,0,15.3-1.7,15.8,15.8,0,0,0,6.6-13.7c-.2-3.1-1.4-6.3-2.4-9.2-1.9-4.9-.7-9,3.2-10.9a7.4,7.4,0,0,1,5.8-.4,8.2,8.2,0,0,1,4.8,4.7,72.8,72.8,0,0,1,2.8,7.3c.4,1.1.7,2.2,1.1,3.2a1.1,1.1,0,0,1,.1.5v9.8a.9.9,0,0,1-.1.5,1.4,1.4,0,0,0-.2.7,6.1,6.1,0,0,0-.5,1.2c-3.2,13.5-12.4,22-25.9,24a51.3,51.3,0,0,1-8.7.2h-1.9c-.8,3.2-1.5,6.4-2.2,9.5-1.7,7.6-3.4,15.5-6,22.9-7.3,21.2-20.3,39.6-39.8,56.3a9.1,9.1,0,0,0-3.1,4.6c-1.1,9.4-1.9,19.1-2.8,28.5l-.9,10.6c-1.5,15.7-12.4,26.5-27.8,27.6Zm-30.2-40.5a1.1,1.1,0,0,1,.8.2,1.6,1.6,0,0,1,.7.9l1.2,5c.7,3.4,1.5,6.6,2.3,9.9,3.2,13.5,14.3,22.3,27,21.4s23.7-10.7,25-24.9l.9-10.6c.9-9.4,1.7-19.1,2.8-28.6.4-3,3.3-5.7,4.2-6.5,19-16.3,31.8-34.3,38.9-54.9a203.9,203.9,0,0,0,5.9-22.7c.8-3.5,1.6-7.1,2.5-10.7a1.4,1.4,0,0,1,1.4-1.1h3.2a45.2,45.2,0,0,0,8.2-.2c12.4-1.8,20.5-9.3,23.4-21.7l.6-1.6c0-.1.1-.2.1-.4v-9.2c-.4-1-.7-2-1-3s-1.7-4.8-2.7-7.1a5.9,5.9,0,0,0-3.1-3.1,4.3,4.3,0,0,0-3.5.3c-3.1,1.5-2.6,4.7-1.7,7.2a34.8,34.8,0,0,1,2.6,10.1,18.9,18.9,0,0,1-26,18.3c-1.9-.7-3-3.6-3.2-5.3a113.7,113.7,0,0,0-11.8-40.9c-15.4-30.4-39.8-52.5-74.5-67.6l-9.2-3.7-4.2-1.6a1.5,1.5,0,0,1-.9-1.7c5.1-28.1-3.7-49.3-26.2-63.1C198-.7,176.6.1,156.8,14.1S129,48.7,134,74.8a1.7,1.7,0,0,1-.9,1.7l-2.4,1.1-7.4,3.3c-6.7,3-13.7,6.1-20.5,9.3-2.5,1.1-4.4,1.5-7.1-.2a56.1,56.1,0,0,0-33.9-9.4C53,80.9,48.5,85.3,48,94.1c-.8,12.2,3,23.9,6.3,34.2.5,1.8.6,4.4-.5,6A123.9,123.9,0,0,0,35,179.2a1.6,1.6,0,0,1-1.5,1.2H25.7c-11.6,0-18.8,5.5-22.2,16.7a3.1,3.1,0,0,1-.5,1v43a7.7,7.7,0,0,1,.7,1.6c2.9,9.5,10.6,15.3,20.6,15.5,7.1.1,13.4.1,19.4,0a6.1,6.1,0,0,1,6.1,3.3c7.5,12.7,17.4,24.2,30.1,34.9a10.4,10.4,0,0,1,3.2,6.3c.8,7.3,1.5,14.8,2.1,22S86.4,336.9,87,343c1.3,12.6,11.5,22.1,24.8,23.1s23.8-7.8,26.9-20.2c.9-3.5,1.7-7.1,2.5-10.8l1.2-5.2a1.3,1.3,0,0,1,.6-1,1.7,1.7,0,0,1,1.2-.2,186.8,186.8,0,0,0,90.4,0Zm30.9,28c-8.3,0-14.7-5.3-16.7-13.7-1.1-4.6-2.2-9.3-3.2-13.8-.4-2-.9-4-1.4-5.9s-1.4-4.3-2.6-5-2.7-.6-5.1,0a174.9,174.9,0,0,1-95.2,0c-2.1-.6-3.7-.6-4.8.1s-2,2.1-2.5,4.4l-2.1,9.2c-.8,3.7-1.7,7.3-2.5,10.9-2.1,8.8-9,14.2-17.8,13.7s-15-7.2-15.8-16.1l-.5-5.7c-1.1-11.9-2.3-24.3-3.2-36.5a9.1,9.1,0,0,0-3.7-7.1,125.4,125.4,0,0,1-33.1-38.7c-1.5-2.8-3.5-3.9-6.8-3.9-7.4.2-15.1.2-24.5,0-6.9,0-11.6-4.5-11.8-11-.2-12-.2-24.2,0-36.5.2-6.6,4.7-11,11.7-11.2H37c4.5-.1,5.8-1.2,6.6-5.6a109.2,109.2,0,0,1,19.7-46.8c2-2.8,2.3-5.3,1-9.5a277.6,277.6,0,0,1-6.9-27.6c-.9-4.6-.6-7.2.9-8.9s5-2.1,9.2-1.6a51.3,51.3,0,0,1,26.9,10.5c2.9,2.2,5.1,2.3,9,.3,8.5-4.3,17.3-8.3,25.8-12.1l4.7-2.1c1.4-.6,4.1-.5,5,.8,2.4,3.2,4.6,6.6,6.8,9.8l2.1,3.2a1.5,1.5,0,0,1,.2,1.3,1.6,1.6,0,0,1-.9.9l-4.3,1.5c-3.3,1.2-6.7,2.4-9.9,3.7s-4.2,3.5-3.2,6.2,3.4,3.5,6.5,2.5l3.5-1.3,3.9-1.4c32.9-10.7,65.9-9.9,97.8,2.3,2.7,1,6.2,1.5,7.6-2s-.2-5.2-4.1-6.7h0l-9.2-3.3-4.4-1.6a1.5,1.5,0,0,1-.9-1,1.2,1.2,0,0,1,.2-1.3l1.5-1.9c1.1-1.3,2-2.5,2.9-3.7l.5-.6a30.3,30.3,0,0,0,3.1-4.8c1.4-2.9,3.3-3.6,6.5-2.5,28.8,10.1,50.8,25.4,67.1,46.6,24.9,32.2,30.8,67.4,17.6,104.4-7.2,20.3-20.3,38.1-39.1,53.1-2.9,2.3-4.2,4.6-4.4,8-.8,11.1-1.9,22.4-2.9,33.3-.2,2.8-.5,5.7-.8,8.5-.8,8.8-7.1,15.5-15.3,16.1Zm-25.9-41.9a6.1,6.1,0,0,1,3.6,1c1.9,1.1,3.2,3.3,4,6.8s.9,4,1.3,6c1,4.5,2.1,9.1,3.2,13.7,1.7,7.4,7.7,11.9,15.1,11.3s11.9-6,12.6-13.3c.2-2.9.5-5.7.7-8.6,1.1-10.9,2.1-22.1,2.9-33.2.3-4.3,2-7.3,5.5-10.2,18.4-14.6,31.2-32,38.2-51.7,12.8-36,7-70.2-17.1-101.6-16-20.7-37.6-35.6-65.8-45.6-1.8-.6-2.1-.4-2.8,1a40.1,40.1,0,0,1-3.4,5.3l-.5.6c-.9,1.3-1.9,2.5-2.9,3.8l-.2.2,2.4.8c3.2,1.2,6.3,2.2,9.3,3.4h0c5.4,2.1,7.5,6,5.8,10.5s-6,5.8-11.4,3.8c-31.4-12-63.6-12.7-95.9-2.3l-3.7,1.4-3.7,1.3c-4.6,1.5-8.8-.3-10.2-4.3s.4-8.3,4.9-10,6.7-2.5,10-3.7l2.4-.8c-.3-.6-.7-1.1-1-1.6-2.1-3.2-4.3-6.5-6.6-9.6a3.3,3.3,0,0,0-1.4,0l-4.7,2.1c-8.5,3.9-17.3,7.8-25.7,12.1-3.6,1.8-7.6,3-12.2-.6a48.9,48.9,0,0,0-25.4-10c-3.8-.3-5.9-.1-6.7.8s-.8,2.8-.2,6.2c1.7,8.4,3.9,17.3,6.9,27.4,1.3,4.2,1.5,7.9-1.5,12.1a106.1,106.1,0,0,0-19.1,45.5c-1,5.9-3.5,8-9.6,8.1H24.3c-5.4.2-8.7,3.3-8.8,8.3-.2,12.2-.2,24.4,0,36.3.1,5,3.5,8.1,8.9,8.1,9.3.2,17,.2,24.3,0,4.4,0,7.5,1.7,9.5,5.5a121.7,121.7,0,0,0,32.3,37.7,12,12,0,0,1,4.9,9.3c.9,12.2,2.1,24.5,3.2,36.4l.5,5.8c.7,7.4,6,12.9,13,13.3s12.9-3.9,14.7-11.4c.8-3.6,1.6-7.2,2.5-10.8s1.3-6.2,2-9.2,2.1-5.3,4-6.4,4.2-1.3,7.2-.4a171.7,171.7,0,0,0,93.5,0A14.3,14.3,0,0,1,239.9,314.8ZM136.7,89.3Zm27.4,9.6a8.7,8.7,0,0,1-5.8-2.4,47.1,47.1,0,0,1-13.6-52.4l1.4.5-1.4-.5a47.8,47.8,0,0,1,44.7-31.3h.2l2.7.3a30.9,30.9,0,0,1,6,.8c19.8,4.5,32.3,16.3,37.1,35.1s-.6,34.9-16,48.2a7,7,0,0,1-5.5,1.5,158.2,158.2,0,0,0-48.1.1Zm25.3-83.1a44.7,44.7,0,0,0-41.8,29.4,43.9,43.9,0,0,0,12.6,49,5.7,5.7,0,0,0,5.2,1.6,160.3,160.3,0,0,1,48.9,0,5.7,5.7,0,0,0,3.2-.8c14.4-12.5,19.5-27.7,15-45.2s-16.2-28.8-34.8-33a35.5,35.5,0,0,0-5.7-.7Z" transform="translate(0 0.1)"></path>
                                            <path d="M70.8,176.2c0,2.3-.2,4.5,0,6.8.3,3.9,3,6.4,6.4,6.3s5.8-2.8,6-6.5.1-8.7,0-13.1-2.9-6.5-6.3-6.5-5.8,2.6-6.1,6.3S70.8,174,70.8,176.2Z" transform="translate(0 0.1)"></path>
                                            <path d="M76.9,190.8c-4.1,0-7.3-3.2-7.6-7.7-.1-1.6-.1-3.3-.1-4.8s.1-1.4.1-2.1-.1-1.3-.1-2,0-3.2.1-4.8c.3-4.5,3.4-7.6,7.6-7.7s7.6,3.4,7.8,8,.1,8.8,0,13.1-3.3,7.8-7.4,8Zm.1-26.1h-.1c-2.5,0-4.4,2-4.6,4.9s-.1,3-.1,4.5.1,1.4.1,2.1-.1,1.4-.1,2.1,0,3.1.1,4.5c.2,3.1,2.2,5.1,4.9,5s4.4-2.2,4.5-5c.1-4.4.1-8.7,0-13S79.6,164.7,77,164.7Z" transform="translate(0 0.1)"></path>
                                            <path d="M222.1,60.4a32.7,32.7,0,1,1-32.8-32.5A32.8,32.8,0,0,1,222.1,60.4Zm-12.3.4a20.7,20.7,0,0,0-20.4-20.6c-11.2,0-20.6,9.4-20.4,20.5a20.4,20.4,0,0,0,40.8.1Z" transform="translate(0 0.1)"></path>
                                            <path d="M189.4,94.8a34.1,34.1,0,0,1-34.2-34.2,34.3,34.3,0,0,1,34.1-34.2h.1a34.2,34.2,0,0,1,34.2,34h0a34.3,34.3,0,0,1-33.9,34.4Zm0-65.4h-.1a31.3,31.3,0,0,0-21.9,53.4,30.8,30.8,0,0,0,22.2,9,31.4,31.4,0,0,0,31-31.4h0A31.3,31.3,0,0,0,189.4,29.4Zm0,53h-.1a21.9,21.9,0,0,1-21.8-21.6,22,22,0,0,1,21.9-22.1h0a22.2,22.2,0,0,1,21.9,22.1h0A22,22,0,0,1,189.4,82.4Zm0-40.7A18.6,18.6,0,0,0,176,47.4a18.4,18.4,0,0,0-5.5,13.3,19,19,0,0,0,18.8,18.7h.1a19,19,0,0,0,18.9-18.6h0a19,19,0,0,0-5.5-13.4,18.6,18.6,0,0,0-13.4-5.7Z" transform="translate(0 0.1)"></path>
                                        </svg>`,
  },
  {
    title: "Nguồn gốc",
    description: "Uy tín & chất lượng",
    icon: String.raw`<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 342.2 339.61">
                                            <path d="M53.1,283.89c0-1.38.06-2.76,0-4.13-.32-6.9-2.26-8.74-9.24-8.75-10,0-18.13-6.45-19.28-16.3-.46-3.85.63-8.17,2-11.89,2.35-6.18.92-9.91-5.45-11.59-15.1-4-20-20.58-9.52-32.06,4.48-4.9,3.94-9.19-1.59-12.65-13.35-8.37-13.42-25-.14-33.5,5-3.21,5.75-6.13,2.8-11.31-1.11-2-2.41-3.79-3.61-5.7a18.22,18.22,0,0,1,9.21-26.94c1.16-.43,2.41-.64,3.61-1,5.31-1.51,6.84-5.55,5-10.82-1.4-4-2.79-8.5-2.33-12.57,1.1-9.84,9.35-16.29,19.3-16.25.63,0,1.25,0,1.88,0,5.24-.1,8.49-3.79,7.23-8.93A19.17,19.17,0,0,1,78.53,37c5.77,2.13,9.36-.31,10.33-6.47,1.65-10.54,7.49-16.75,17.11-18a18.8,18.8,0,0,1,13.11,3.41c5.92,4,9.88,2.77,12.68-3.72,6-13.94,22.84-16.42,32.7-4.81,4.6,5.43,8.66,5.45,13.3.09,10-11.53,26.61-9.07,32.75,4.83,2.86,6.47,6.78,7.57,12.72,3.57,12.45-8.39,27.72-1.57,30,13.38,1.19,7.91,4.09,9.71,11.83,7.34a19,19,0,0,1,24.43,21.73c-1.25,7.23,1.31,10.2,8.75,10.13,15.17-.15,24.3,14.21,17.72,27.9-3.1,6.43-1.4,10.11,5.5,12C336,112.17,341,128.81,330.86,140c-4.94,5.48-4.38,9.29,2,13.28,12.42,7.8,12.5,24.81.15,32.77-6.07,3.9-6.65,6.42-2.89,12.62a38.17,38.17,0,0,0,2.64,4.1c9.37,11.78-.94,26.2-10.95,28.29-.49.1-1,.16-1.47.29-5.35,1.5-7.38,5.74-4.87,10.73,2.09,4.14,3.3,8.38,2.47,13-1.71,9.57-9.54,16-19.35,15.92-8.05,0-10.25,2.51-9,10.5a19.16,19.16,0,0,1-24.36,21.37c-7.5-2.13-9.83-.86-12.07,6.61-.68,2.27-1.37,4.54-2,6.83-2.25,8.36-14,13.6-21.62,9.82-2.79-1.38-5.66-2.64-8.57-3.75-5.2-2-7.62-.72-10.26,4.25-1.55,2.92-3.35,6-5.79,8.11-7.92,6.9-19.43,5.82-26.56-2.07-5.28-5.85-7.79-6-13.79-1a28.9,28.9,0,0,0-3.08,2.75c-9.29,10.38-25.82,3.42-29.43-6.49-.17-.47-.38-.92-.58-1.38-2.36-5.56-6.68-6.92-11.7-3.49-4.65,3.17-9.58,4.68-15.21,3.61a18.9,18.9,0,0,1-15.32-15.49c-1.49-8.65-2.88-9.69-11.7-8.72a14.77,14.77,0,0,0-2.23.25C62.37,306.35,51.5,296.71,53.1,283.89Zm244-203.42c-10.19.19-18.13-6-19.79-15.72a28.72,28.72,0,0,1,.34-8.15c.68-5.42-1.76-8.53-7.21-8.47a31.78,31.78,0,0,0-7.77,1c-6.14,1.63-11-.43-15.32-4.63a18.81,18.81,0,0,1-5.82-12.23c-.59-6.81-4.44-9.19-10.84-6.75a33.94,33.94,0,0,0-5.74,2.73c-7.35,4.57-17.77,1.77-22.11-5.91a64.85,64.85,0,0,0-3.88-6c-4.07-5.69-7.75-5.88-12.39-.71-9.53,10.63-21.9,10.46-31.17-.43-4.11-4.82-10.54-4.21-12.52,1.69a19.52,19.52,0,0,1-30.73,8.82c-3.21-2.55-7.2-2.1-9.35.93a13.86,13.86,0,0,0-2,6.22A18.18,18.18,0,0,1,79.37,49.05c-1.84-.31-3.68-.73-5.54-.88-7.42-.59-10.23,2.52-8.89,9.77A18.88,18.88,0,0,1,51.46,79.67c-2.48.68-5.18.61-7.78.79-5.76.39-7.89,2.9-6.86,8.58a65.27,65.27,0,0,0,2.3,8.68,15.88,15.88,0,0,1-9,19.48,66.07,66.07,0,0,0-9,4.52c-3.48,2.14-4,4.77-2,8.32a21.72,21.72,0,0,0,2.49,3.27c8.12,9.55,6,22.87-4.6,29.44-7,4.32-7,9.69.09,14C27.88,183.3,29.86,197,21.37,206.4c-5.61,6.19-4.05,11.3,4.15,13.56A19.11,19.11,0,0,1,38.11,246.4a32,32,0,0,0-1.43,3.44c-1.41,4.64-.08,7.19,4.65,8.41a61.58,61.58,0,0,0,8.85,1.54c8.72.93,15,8.16,14.53,16.52a55.89,55.89,0,0,0,.12,7.87c.55,6.57,3.44,8.55,9.82,6.91.72-.18,1.42-.46,2.14-.65a18.8,18.8,0,0,1,22.45,11,31.05,31.05,0,0,1,1.55,6.89c.91,5.65,5.14,8.16,10.37,5.92,1.83-.78,3.42-2.13,5.27-2.85,2.39-.93,4.91-2.09,7.39-2.12,9.08-.1,15.2,4.37,18.9,12.72a10.59,10.59,0,0,0,5.35,5.08c3.27,1.25,5.77-.93,7.91-3.56,8.07-9.93,21.52-10.09,30-.48.49.56.94,1.17,1.48,1.69,3.93,3.85,7.34,3.73,10.68-.62a102.44,102.44,0,0,0,5.91-8.66c3.33-5.38,12.24-8,18-5.4,2.73,1.24,5.47,2.45,8.24,3.58,7,2.84,10.33.85,11.33-6.68,1.69-12.64,13.09-19.95,25.22-16.17,7.77,2.43,12-1.27,10.55-9.21a19.09,19.09,0,0,1,15.18-22.31,45.48,45.48,0,0,1,6-.29c5.77-.32,7.95-2.86,6.95-8.5a68.13,68.13,0,0,0-2.45-9.41c-2.26-6.82,1.58-15.5,8.42-18.44,2.63-1.13,5.24-2.34,7.78-3.68,5.95-3.14,6.62-6.79,2.29-11.95-9.21-11-7.34-23.3,4.69-30.81,5.63-3.51,5.83-9.77,0-12.82-12.25-6.41-13.9-22.71-4.32-31.37,2.59-2.34,3.44-5.64,1.29-8.44a12.81,12.81,0,0,0-6.37-4c-11-3.17-16.59-13.21-13-24,.54-1.66,1.18-3.31,1.56-5C306.89,83.57,304.23,80.34,297.08,80.47Z">
                                            </path>
                                            <path d="M291.16,169.61c-.33,63.42-43.77,119.82-120,119.79-76.84,0-120-56.94-120-119.75.05-63.21,43.71-119.71,120.13-119.6S290.75,106.6,291.16,169.61Zm-12,.1c-.31-56.62-39-107.65-108-107.69S63.23,113,63.15,169.54,102,277.5,171.22,277.43C240.71,277.35,278.89,225.79,279.16,169.71Z">
                                            </path>
                                            <path d="M159.81,135.66c-.43,10.62-3.05,20.73-10.88,28.84a24.68,24.68,0,0,1-35.55-.25C99.64,149.7,100.23,121,114.57,107A25,25,0,0,1,151,108.87C157.3,116.55,159.49,125.65,159.81,135.66Zm-13.12,0c-1.34-5.44-2.26-10.6-3.92-15.51s-5.46-7.35-10.58-7.52a11.24,11.24,0,0,0-11.35,7A38.67,38.67,0,0,0,120.4,152a11.27,11.27,0,0,0,11.17,7.33c5.29,0,9.31-2.53,11-7.47C144.37,146.6,145.35,141.08,146.69,135.69Z">
                                            </path>
                                            <path d="M238.7,202.87c0,8.67-1.85,16.86-6.64,24.2-10.86,16.65-33.25,16.67-43.36-.4-9.16-15.47-9-31.63.54-46.87,11.06-17.64,35.31-16.1,44.89,2.42C237,187.81,238.68,195.33,238.7,202.87Zm-12.85.47c-1.31-5.39-2.18-10.56-3.85-15.46s-5.54-7.59-10.85-7.75a11.35,11.35,0,0,0-11.38,7,38.61,38.61,0,0,0-.44,32.3c2.1,4.95,6.09,7.49,11.52,7.37,5.28-.12,9.25-2.73,10.94-7.63C223.56,214.05,224.53,208.64,225.85,203.34Z">
                                            </path>
                                            <path d="M219.06,108.79a56.32,56.32,0,0,1-3,5.82q-40.26,58.94-80.6,117.81c-3,4.34-6.52,5.31-10.12,2.94s-4.07-5.92-1-10.38q40.44-59,80.91-118c2.54-3.7,5.52-5.25,8.43-3.61C215.84,104.53,217.3,106.92,219.06,108.79Z">
                                            </path>
                                        </svg>`,
  },
  {
    title: "Đa dạng",
    description: "Sản phẩm & set quà",
    icon: String.raw`<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 449.3 513.5">
                                            <path d="M234.8.8c12.5,2.2,25.3,3.7,37.6,7,30.2,7.8,56,23.7,77.7,46,23.4,24,39,52.6,45.7,85.5,2.5,11.9,3.3,24,4.9,36,6,2,12.7,3.5,18.8,6.4,18.9,9,28.2,25.1,28.6,45.2.6,36,.8,72-.6,107.9-.9,24.2-17.7,41.4-41.4,46-4.7,1-6.5,2.5-6.7,7.5-.8,16.9-3.9,33.4-11.2,48.8-11.2,23.5-30.3,37.5-54.9,43.3-16.7,3.9-33.8,5.7-51.4,8.5.9,10.8-3.8,19.4-15.1,23.9h-70c-11.8-4.2-16.2-12.8-15.5-24.9.5-8,0-16,.1-24,.2-14,7.6-21.6,21.7-21.7h55.5c15.3,0,22.6,7.2,23,22.5,0,.9.1,1.7.2,3.3l18.2-1.2c13.7-1.2,27-3.7,39.7-9,19-8,30.8-22.6,35.8-42.2,2.7-10.4,3.8-21.2,5.8-32.8H364.8c-9.4,0-12.6-3.3-12.6-13.2V188.7c0-10,3.2-13.2,13.1-13.3h15.1c-1.2-49.8-19.7-91.2-58.7-121.3-53-41-111.4-46.6-170.5-15.4C97.6,66.9,71.7,114.1,68.8,175.4H84.1c10,0,13.2,3.1,13.2,13.1V370c0,10-3.2,13.3-13.2,13-13.9-.4-28.1,0-41.7-2.4-23.1-4.1-38.2-21.8-40.6-45.2a134.3,134.3,0,0,1-.9-15.5c-.1-28.1-.4-56.3.2-84.5a88,88,0,0,1,4.3-26.9c6.3-18,20.5-27.5,38.8-31.6,1.7-.4,3.5-.8,3.9-1.7,2.8-15.9,4.6-32,8.7-47.4,7.8-30.4,24.1-56.2,46.6-77.9A170.8,170.8,0,0,1,186.7,5.1c9.2-2,18.7-2.9,28-4.3ZM77.4,363.4V193.6c-9.8.5-19.3.2-28.6,1.6-16.1,2.4-26.8,13.3-28,29.3s-.8,32.3-.9,48.4c-.1,17.8-.2,35.6.1,53.4.3,15.5,6,28,21.4,34C53,364.8,65.2,363.4,77.4,363.4Zm294.5.2c7.3,0,14.1.3,20.9,0,22.5-1,35.5-13.9,36-36.3s.5-45.7.7-68.5c.1-9.3.4-18.6-.1-28-.8-19.1-9.6-31.1-26.6-34.4-10-2-20.4-1.5-30.9-2.2ZM201.1,461.9v31.2h60.7V461.9Z" transform="translate(0)"></path>
                                            <path d="M266.9,513.5H196.5c-11.5-4.1-16.7-12.5-15.9-25.6.3-4.9.2-10,.1-14.8,0-3-.1-6.1,0-9.2.1-14.4,8.1-22.3,22.4-22.4,17.5-.2,35.4-.1,52.6,0h2.9c15.8,0,23.3,7.3,23.7,23.2a9.2,9.2,0,0,0,.1,1.6,2.8,2.8,0,0,0,.1.9l4.8-.3,12.6-.9c15.3-1.3,28.2-4.2,39.6-8.9,18.3-7.8,30.2-21.8,35.3-41.7,1.8-7.1,2.9-14.4,4.1-22.1.4-3.1.9-6.4,1.5-9.7H364.8c-9.9-.1-13.4-3.7-13.4-14V188.7c0-10.5,3.5-14,13.9-14.1h14.3c-1.4-50.7-21-91.1-58.4-119.9C268.5,13.9,209.9,8.6,151.6,39.4c-51.3,26.9-78.9,72.4-82.1,135.2H84.1c10.4.1,13.9,3.6,13.9,13.9V370c0,5.5-.9,8.9-3.1,11s-5.5,2.9-10.8,2.8l-9.9-.2c-10.6-.2-21.5-.4-32-2.3-22.8-4-38.6-21.6-41.2-45.9-.5-5.1-.8-10.3-.8-15.5S.1,308.4.1,302.7c-.1-22.1-.2-44.9.2-67.3a89.4,89.4,0,0,1,4.4-27.1c5.8-16.8,19.1-27.6,39.3-32.1h.2c1.2-.3,2.8-.6,3.1-1.2.9-4.8,1.7-9.8,2.4-14.6,1.7-10.8,3.5-22,6.3-32.7C63.6,98.3,79.4,72,102.8,49.4A172.6,172.6,0,0,1,186.5,4.3c6.3-1.3,12.8-2.2,19.1-3l9-1.3h20.3l11.7,2a259,259,0,0,1,26,5c29.3,7.7,55.5,23.2,78,46.2s39.3,53.4,45.9,86c1.7,8.1,2.7,16.5,3.6,24.7.4,3.5.8,7.2,1.3,10.8a53.6,53.6,0,0,0,5.2,1.6,95.1,95.1,0,0,1,13.2,4.8c18.6,8.8,28.6,24.7,29,45.8.8,43.3.7,76.6-.5,108-.9,23.9-17.1,41.8-42.1,46.7-4.6.9-5.9,2.4-6.1,6.8-.9,19-4.6,35-11.3,49.1-10.8,22.9-29.4,37.5-55.4,43.6-11.4,2.7-22.9,4.4-35,6.1l-15.7,2.3c.7,11.4-4.7,19.7-15.7,23.9Zm-70-1.5h69.7c10.4-4.1,15.4-12,14.5-23v-.7h.7l16.4-2.5c12.1-1.7,23.5-3.3,34.9-6,25.4-6,43.8-20.4,54.4-42.9,6.6-13.8,10.2-29.7,11.1-48.5.3-5.8,2.7-7.3,7.3-8.2,24.3-4.8,40-22.1,40.9-45.3,1.2-31.4,1.3-64.6.5-107.9-.4-20.5-10.1-35.9-28.2-44.5a83.5,83.5,0,0,0-13-4.6l-5.7-1.8H400v-.5c-.5-3.8-.9-7.6-1.3-11.4-.9-8.1-1.9-16.5-3.5-24.5-6.6-32.4-22-61-45.6-85.2S301.2,16.1,272.2,8.5c-8.4-2.3-17.3-3.7-25.9-5.1L234.7,1.5h-20c-2.9.4-5.9.9-8.9,1.2-6.2.9-12.7,1.7-19,3.1a170.9,170.9,0,0,0-82.9,44.6C80.6,72.9,65,99,57.5,127.9c-2.8,10.7-4.6,21.9-6.3,32.7-.8,4.8-1.5,9.8-2.4,14.7h-.1c-.5,1.3-2.3,1.8-4.2,2.2h-.2C24.6,182,11.8,192.5,6.1,208.8a89.2,89.2,0,0,0-4.3,26.6c-.4,22.5-.3,45.2-.2,67.3,0,5.7,0,11.5.1,17.2s.3,10.3.8,15.4c2.5,23.6,17.8,40.6,40,44.6,10.4,1.8,21.2,2,31.7,2.2l9.9.2c4.9.1,7.9-.6,9.7-2.4s2.7-4.9,2.7-9.9V188.5c0-9.6-2.8-12.3-12.4-12.4H68v-.8C71,111.6,98.9,65.4,150.9,38c29.4-15.5,59-22.1,87.9-19.4s56.8,14.3,83.4,34.9c37.9,29.3,57.7,70.3,58.9,121.9v.7H365.3c-9.5.1-12.4,3-12.4,12.6V369.6c0,9.4,2.9,12.4,11.9,12.5h17.4l-.2.9c-.6,3.6-1.1,7.1-1.7,10.6a188.1,188.1,0,0,1-4.1,22.1c-5.2,20.5-17.4,34.8-36.2,42.7-11.5,4.9-24.6,7.8-39.9,9.1l-12.7.9-5.6.4h-.7v-.7c0-.7-.1-1.2-.1-1.7a9.7,9.7,0,0,1-.1-1.7c-.3-14.8-7.4-21.7-22.2-21.7h-2.9c-17.2-.1-35.1-.2-52.6,0-13.6.1-20.8,7.3-20.9,20.9-.1,3.1,0,6.2,0,9.2.1,4.8.2,9.9-.1,14.9C181.3,500.5,186,508.1,196.9,512Zm65.6-18.2H200.4V461.2h62.1Zm-60.6-1.5H261V462.7H201.9ZM386,364.5H371.2v-171h.8l9.7.4c7,.2,14.3.4,21.3,1.7,16.9,3.3,26.3,15.5,27.2,35.2.3,7.2.2,14.4.1,21.5,0,2.2,0,4.3-.1,6.5,0,5.9,0,11.7-.1,17.6-.1,16.7-.1,33.9-.5,50.9-.6,22.5-14,36.1-36.8,37.1Zm-13.3-1.6h6.5c4.7.1,9.1.1,13.6,0,22.2-1,34.7-13.7,35.3-35.6.4-17,.4-34.2.5-50.9.1-5.9.1-11.7.1-17.6.1-2.2.1-4.4.1-6.5.1-7.1.2-14.3-.1-21.4-.9-19.2-9.6-30.6-26-33.8-6.9-1.3-13.7-1.5-21-1.7l-9-.4ZM63.1,364.3c-7.4,0-14.8-.5-22-3.3-14.2-5.5-21.6-17.2-21.9-34.6s-.2-35.4-.1-53.5c.1-3.6.1-7.2.1-10.8,0-12.4,0-25.1.9-37.6,1.2-16.4,11.8-27.6,28.5-30.1a159.1,159.1,0,0,1,19.7-1.2l9.1-.3h.8V364.1H63.1ZM76.7,194.4l-8.4.3a153.1,153.1,0,0,0-19.4,1.2c-16,2.4-26.2,13.1-27.3,28.7-.9,12.4-.9,25.2-.9,37.5,0,3.6,0,7.2-.1,10.8-.1,18.1-.2,35.9.1,53.4s7.2,28,20.9,33.3c9.3,3.6,18.7,3.4,28.7,3.1h6.4Z" transform="translate(0)"></path>
                                        </svg>`,
  },
] as const;

export default async function Home() {
  if (await isSitePageInactive("page_home_status")) {
    return <PageDisabled pageName="Trang chủ" />;
  }

  const locale = await getRequestLocale();
  const translations = await getStaticTranslationMap(locale).catch(() => ({}));
  const t = (namespace: string, key: string, fallback: string) => translateFromMap(translations, namespace, key, fallback);
  const href = (path: string) => withLocalePrefix(path, locale);
  const packageGroupHref = (group: string) => `${href("/goi-du-lich")}?group=${encodeURIComponent(group)}`;
  const { packages: allPackages, packageCollections, homepageBanners, posts } = await getPublicHome(locale);
  const foodHomepageBanners = homepageBanners.filter((banner) => !isLegacyTravelBanner(banner.imageUrl));
  const displayProductCategories = buildDisplayProductCategories(packageCollections, allPackages);
  const featuredProductCategories = displayProductCategories.slice(0, 3);
  const comboTabs = featuredProductCategories.map((collection) => {
    const comboCopy = comboTabCopyByAccent[collection.accent as ProductCategoryAccent];

    return {
      id: collection.key || collection.accent,
      label: comboCopy?.label || collection.eyebrow,
      title: comboCopy?.title || collection.title,
      items: collection.items,
    };
  });

  const fallbackHeroMedia = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=2200&q=85";
  const heroSlides = foodHomepageBanners.length > 0
    ? foodHomepageBanners.map((banner) => ({
      src: banner.imageUrl,
      mediaType: banner.mediaType === "video" || banner.imageUrl.match(/\.(mp4|webm|mov)(\?|$)/i) ? "video" as const : "image" as const,
      title: banner.title,
    }))
    : [{ src: fallbackHeroMedia, mediaType: "image" as const, title: "Sơn La Food" }];
  const homepageBanner = foodHomepageBanners[0];
  const heroTitle = locale === "vi" && homepageBanner?.title ? homepageBanner.title : t("home", "hero_title", "Khám phá hương vị Sơn La ngay tại nhà.");
  const heroSubtitle = locale === "vi" && homepageBanner?.subtitle ? homepageBanner.subtitle : t("home", "hero_subtitle", "Sơn La Food tuyển chọn đặc sản Tây Bắc, set quà biếu, gia vị bản địa và nông sản theo mùa để bạn dễ chọn món ngon chuẩn vị.");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        url: process.env.NEXT_PUBLIC_SITE_URL || "https://timesgreen.net",
        name: "Sơn La Food",
        description: "Sơn La Food giới thiệu đặc sản Sơn La, set quà biếu Tây Bắc, thịt gác bếp, chẩm chéo, chè Shan tuyết và nông sản theo mùa.",
        publisher: {
          "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://timesgreen.net"}/#organization`
        }
      },
      {
        "@type": "Organization",
        "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://timesgreen.net"}/#organization`,
        name: "Sơn La Food",
        url: process.env.NEXT_PUBLIC_SITE_URL || "https://timesgreen.net",
        logo: {
          "@type": "ImageObject",
          url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://timesgreen.net"}/sonla-logo-readable.png`
        }
      }
    ]
  };

  return (
    <main>
      <JsonLd data={jsonLd} />
      <section className="hero-section">
        <HeroMediaCarousel items={heroSlides} />
        <div className="hero-overlay" />
        <SiteHeader variant="hero" />

        <div className="hero-content" id="top">
          <p className="eyebrow">{t("home", "hero_eyebrow", "Sơn La Food | Đặc sản Tây Bắc")}</p>
          <h1>{heroTitle}</h1>
          <p className="hero-copy">{heroSubtitle}</p>
          <div className="hero-actions">
            <a className="primary-action" href="#travel-packages">
              {t("home", "hero_cta_primary_products", "Xem sản phẩm nổi bật")}
            </a>
            <Link className="secondary-action" href={href("/goi-du-lich")}>
              {t("home", "hero_cta_secondary", "Khám phá đặc sản Sơn La")}
            </Link>
          </div>
          <form className="hero-search" id="trip-search" action={href("/goi-du-lich")}>
            <label>
              {t("home", "search_destination", "Sản phẩm")}
              <input suppressHydrationWarning name="destination" placeholder={t("home", "search_destination_placeholder", "Bạn muốn tìm món gì?")} />
            </label>
            <div className="hero-search-field">
              <span className="hero-search-label">{t("home", "search_style", "Nhu cầu")}</span>
              <CustomSelect
                name="style"
                defaultValue=""
                placeholder={t("home", "search_style_placeholder", "Chọn nhu cầu")}
                options={[
                  { value: "", label: t("home", "search_style_placeholder", "Chọn nhu cầu") },
                  { value: "family", label: t("home", "style_family", "Dùng gia đình") },
                  { value: "friends", label: t("home", "style_friends", "Quà bạn bè") },
                  { value: "resort", label: t("home", "style_resort", "Quà biếu") },
                  { value: "photo", label: t("home", "style_photo", "Món khô") },
                ]}
              />
            </div>
            <label>
              {t("home", "search_time", "Thời điểm nhận")}
              <input suppressHydrationWarning name="date" type="month" />
            </label>
            <button suppressHydrationWarning type="submit">{t("home", "search_submit", "Tìm đặc sản")}</button>
          </form>
        </div>
      </section>

      <section className="home-assurance-band" aria-label="Cam kết dịch vụ Sơn La Food">
        <div className="home-assurance-inner elementor-widget-wrap elementor-element-populated">
          {homeAssurances.map((item) => (
            <article className="home-assurance-item elementor-element elementor-position-left elementor-vertical-align-middle elementor-widget elementor-widget-icon-box" key={item.title}>
              <span className="home-assurance-icon elementor-icon" dangerouslySetInnerHTML={{ __html: item.icon }} />
              <span className="home-assurance-copy">
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="package-showcase" id="travel-packages">
        <div className="package-showcase-heading">
          <div>
            <p className="package-showcase-kicker">Chợ đặc sản Sơn La</p>
            <h2>{t("home", "marketplace_heading", "Mua theo danh mục, chọn thêm set gợi ý")}</h2>
            <p className="package-showcase-copy">{t("home", "marketplace_intro", "Ưu tiên cách duyệt như một sàn đặc sản: xem nhóm sản phẩm trước, sau đó chọn từng món hoặc set phối sẵn phù hợp nhu cầu.")}</p>
          </div>
          <Link href={href("/goi-du-lich")}>{t("home", "marketplace_all", "Khám phá gian hàng")}</Link>
        </div>

        <div className="collection-stack">
          {featuredProductCategories.map((collection, collectionIndex) => {
            const flavorTags = getCollectionFlavorTags(collection.accent);
            const categoryCopy = getProductCategoryCopy(collection);
            return (
              <section className={`package-collection ${collection.accent}`} key={collection.key || `${collection.accent}-${collectionIndex}`}>
                <div className="collection-copy">
                  <div className="collection-copy-top">
                    <p className="eyebrow">{categoryCopy.eyebrow}</p>
                    <h3>{categoryCopy.title}</h3>
                    <p>{categoryCopy.description}</p>
                    <div className="collection-flavor-tags" aria-label="Gợi ý danh mục">
                      {flavorTags.map((tag) => <span key={tag}>{tag}</span>)}
                    </div>
                  </div>
                  <Link href={packageGroupHref(collection.key || collection.accent)}>{t("home", "marketplace_view_current", "Xem danh mục này")}</Link>
                </div>
                <PackageCarousel items={collection.items} fallbackItems={allPackages} minItems={5} />
              </section>
            );
          })}
        </div>
      </section>

      <section className="feature-band" id="destinations">
        <div className="feature-copy">
          <p className="slogan-kicker">Sơn La Food</p>
          <h2>
            {t("home", "feature_combo_title", "Chọn hương vị theo khẩu vị, sở thích và nhu cầu,")}
            <span>{t("home", "feature_combo_title_span", "không chỉ theo tên món.")}</span>
          </h2>
          <p>{t("home", "feature_copy", "Từ set dùng thử, quà biếu đến gia vị Tây Bắc, mỗi tab gom sẵn nhóm combo để bạn chọn nhanh mà vẫn xem được từng sản phẩm bên trong.")}</p>
        </div>
        <DestinationTabs comboTabs={comboTabs} packages={allPackages} />
      </section>

      <section className="section-shell benefits-section">
        <div className="section-heading compact benefits-heading">
          <h2>{t("home", "benefits_title", "Vì sao khách hàng chọn Sơn La Food")}</h2>
          <p>{t("home", "benefits_copy", "Từ nguồn hàng địa phương, cách phối combo đến đóng gói quà biếu, mọi thứ được sắp xếp để khách dễ chọn món ngon và hộ bán dễ giới thiệu sản phẩm.")}</p>
        </div>
        <div className="style-grid benefits-grid">
          {tripStyles.map((item, index) => (
            <article key={`${item.title}-${index}`}>
              <div className="style-image" style={{ backgroundImage: `url(${item.image})` }} />
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="news-section" id="stories">
        <div className="news-heading">
          <div>
            <p className="eyebrow">{t("home", "news_eyebrow", "Câu chuyện ẩm thực")}</p>
            <h2>{t("home", "news_title", "Bài viết nổi bật")}</h2>
          </div>
          <p>{t("home", "news_copy", "Những câu chuyện về món ngon, cách chọn quà biếu, mùa nông sản và mẹo dùng gia vị Tây Bắc trước khi bạn đặt sản phẩm.")}</p>
        </div>

        <PostCarousel posts={posts} />
      </section>
    </main>
  );
}
