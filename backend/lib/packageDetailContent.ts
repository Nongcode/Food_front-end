import { packageDetailExtras } from "@/app/data/travel";
import { normalizeLegacyText } from "@/lib/text/encoding";

export type PackageDetailContent = {
  gallery: string[];
  overviewSuffix: string;
  moments: Array<{ title: string; description: string }>;
  offers: string[];
  included: string[];
  itinerary: string[];
  benefits: string[];
  consultTitle: string;
  consultCopy: string;
  consultPoints: string[];
  seoTitle?: string;
  seoDescription?: string;
  bannerImageUrl?: string;
};

export const defaultPackageDetailContent: PackageDetailContent = {
  gallery: packageDetailExtras.gallery,
  overviewSuffix: "Nội dung combo có thể điều chỉnh theo khẩu vị, ngân sách, số lượng phần và thời điểm cần nhận hàng.",
  moments: [
    {
      title: "Sản phẩm đúng vị Sơn La",
      description: "Ưu tiên các món đặc trưng như thịt gác bếp, chẩm chéo, chè Shan tuyết và trái cây theo mùa.",
    },
    {
      title: "Đóng gói sạch và dễ biếu",
      description: "Gợi ý quy cách hút chân không, hộp quà hoặc túi giấy phù hợp với từng dịp tặng.",
    },
    {
      title: "Hướng dẫn dùng ngon hơn",
      description: "Bổ sung cách hâm nóng, pha chấm, bảo quản và kết hợp món để giữ trọn hương vị Tây Bắc.",
    },
  ],
  offers: packageDetailExtras.offers,
  included: packageDetailExtras.included,
  itinerary: packageDetailExtras.itinerary,
  benefits: packageDetailExtras.benefits,
  consultTitle: "Giữ lại combo này và nhận tư vấn phù hợp với nhu cầu thực tế.",
  consultCopy: "Chỉ cần để lại email hoặc số điện thoại. Sơn La Food sẽ liên hệ để xác nhận món còn hàng, cách đóng gói, ngân sách và thời gian giao phù hợp.",
  consultPoints: [
    "Không cần thanh toán ngay",
    "Có thể đổi món theo khẩu vị",
    "Phản hồi tư vấn trong 24 giờ",
  ],
};
const zhPackageDetailContent: Omit<PackageDetailContent, "gallery" | "seoTitle" | "seoDescription" | "bannerImageUrl"> = {
  overviewSuffix: "组合内容可根据口味、预算、数量和收货时间灵活调整。",
  moments: [
    {
      title: "山罗代表风味",
      description: "优先推荐熏肉、蘸料、山雪茶和时令果干等具有地方特色的产品。",
    },
    {
      title: "整洁包装，适合送礼",
      description: "可按礼盒、纸袋或真空包装准备，方便家庭食用或商务赠礼。",
    },
    {
      title: "附带食用建议",
      description: "补充加热、蘸料、保存和搭配方式，让西北风味更容易在家中呈现。",
    },
  ],
  offers: [
    "首次组合咨询免费",
    "可按预算调整礼盒内容",
    "可为节日或商务赠礼建议包装方式",
  ],
  included: [
    "产品组合建议",
    "基础包装建议",
    "保存和食用说明",
    "按口味替换部分产品",
    "发货前确认库存和数量",
    "网站不要求在线付款",
  ],
  itinerary: [
    "确认口味、预算和收货时间。",
    "推荐合适的山罗特产组合。",
    "确认包装、数量和配送信息。",
  ],
  benefits: [
    "按预算和人数建议组合",
    "优先选择易保存、易赠送的产品",
    "24 小时内回复咨询信息",
  ],
  consultTitle: "保留这个组合，并获得更贴合实际需求的建议。",
  consultCopy: "只需留下邮箱或电话号码。Sơn La Food 会联系你，按预算、数量和送礼场景推荐合适的特产组合。",
  consultPoints: [
    "无需立即付款",
    "可按口味替换产品",
    "24 小时内发送咨询回复",
  ],
};

function normalizeStringArray(items: string[]) {
  return items.map((item) => normalizeLegacyText(item));
}

function normalizeMoments(items: Array<{ title: string; description: string }>) {
  return items.map((item) => ({
    title: normalizeLegacyText(item.title),
    description: normalizeLegacyText(item.description),
  }));
}

function normalizePackageDetailText(content: PackageDetailContent): PackageDetailContent {
  return {
    ...content,
    overviewSuffix: normalizeLegacyText(content.overviewSuffix),
    moments: normalizeMoments(content.moments),
    offers: normalizeStringArray(content.offers),
    included: normalizeStringArray(content.included),
    itinerary: normalizeStringArray(content.itinerary),
    benefits: normalizeStringArray(content.benefits),
    consultTitle: normalizeLegacyText(content.consultTitle),
    consultCopy: normalizeLegacyText(content.consultCopy),
    consultPoints: normalizeStringArray(content.consultPoints),
    seoTitle: content.seoTitle ? normalizeLegacyText(content.seoTitle) : undefined,
    seoDescription: content.seoDescription ? normalizeLegacyText(content.seoDescription) : undefined,
  };
}

function asStringArray(value: unknown, fallback: string[]) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : fallback;
}

function asMoments(value: unknown) {
  if (!Array.isArray(value)) return defaultPackageDetailContent.moments;
  const moments = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      return {
        title: typeof record.title === "string" ? record.title : "",
        description: typeof record.description === "string" ? record.description : "",
      };
    })
    .filter((item): item is { title: string; description: string } => Boolean(item?.title || item?.description));
  return moments.length ? moments : defaultPackageDetailContent.moments;
}

export function normalizePackageDetailContent(value: unknown): PackageDetailContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaultPackageDetailContent;
  const record = value as Record<string, unknown>;
  const overview = typeof record.overview === "string" ? record.overview : "";
  const overviewSuffix = typeof record.overviewSuffix === "string" ? record.overviewSuffix : overview;

  return normalizePackageDetailText({
    gallery: asStringArray(record.gallery, defaultPackageDetailContent.gallery),
    overviewSuffix: overviewSuffix || defaultPackageDetailContent.overviewSuffix,
    moments: asMoments(record.highlights || record.moments),
    offers: asStringArray(record.offers, defaultPackageDetailContent.offers),
    included: asStringArray(record.included, defaultPackageDetailContent.included),
    itinerary: asStringArray(record.itinerary, defaultPackageDetailContent.itinerary),
    benefits: asStringArray(record.benefits, defaultPackageDetailContent.benefits),
    consultTitle: typeof record.consultTitle === "string" ? record.consultTitle : defaultPackageDetailContent.consultTitle,
    consultCopy: typeof record.consultCopy === "string" ? record.consultCopy : defaultPackageDetailContent.consultCopy,
    consultPoints: asStringArray(record.consultPoints, defaultPackageDetailContent.consultPoints),
    seoTitle: typeof record.seoTitle === "string" ? record.seoTitle : undefined,
    seoDescription: typeof record.seoDescription === "string" ? record.seoDescription : undefined,
    bannerImageUrl: typeof record.bannerImageUrl === "string" ? record.bannerImageUrl : undefined,
  });
}

export function localizePackageDetailContent(content: PackageDetailContent, locale: string): PackageDetailContent {
  if (locale !== "zh-CN") return normalizePackageDetailText(content);

  return {
    ...content,
    ...zhPackageDetailContent,
    gallery: content.gallery,
    seoTitle: content.seoTitle,
    seoDescription: content.seoDescription,
    bannerImageUrl: content.bannerImageUrl,
  };
}