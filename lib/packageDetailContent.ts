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

const foodDetailGallery = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=82",
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=82",
  "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1400&q=82",
  "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=1400&q=82",
  "https://images.unsplash.com/photo-1559181567-c3190ca9959b?auto=format&fit=crop&w=1400&q=82",
];

export const defaultPackageDetailContent: PackageDetailContent = {
  gallery: foodDetailGallery,
  overviewSuffix: "Mẫu demo này dùng chung cho các trang chi tiết sản phẩm, tập trung vào nguồn gốc, hương vị, quy cách đóng gói và cách tư vấn đặt hàng. Nội dung có thể thay bằng dữ liệu thật của từng hộ kinh doanh khi vận hành.",
  moments: [
    {
      title: "Thành phần đặc sản rõ ràng",
      description: "Mỗi combo có thể gồm thịt gác bếp, chẩm chéo, mắc khén, chè Shan tuyết, trái cây sấy hoặc nông sản theo mùa của Sơn La.",
    },
    {
      title: "Phù hợp ăn thử hoặc làm quà",
      description: "Sản phẩm được gợi ý theo nhu cầu dùng hằng ngày, biếu tặng, đặt số lượng lớn hoặc chọn món nhỏ gọn để chia sẻ với bạn bè.",
    },
    {
      title: "Có hướng dẫn bảo quản",
      description: "Khách được nhắc cách bảo quản, hâm nóng, pha chấm và kết hợp món để giữ hương vị Tây Bắc trọn vẹn hơn sau khi nhận hàng.",
    },
  ],
  offers: [
    "Tư vấn phối set miễn phí theo khẩu vị, ngân sách và dịp mua hàng.",
    "Có thể thay đổi thành phần combo theo mùa vụ và tình trạng hàng thực tế.",
    "Hỗ trợ gợi ý quy cách hộp quà, túi giấy hoặc đóng gói vận chuyển.",
  ],
  included: [
    "Thông tin nguồn gốc sản phẩm",
    "Gợi ý khẩu vị phù hợp",
    "Quy cách đóng gói cơ bản",
    "Hướng dẫn bảo quản sau nhận hàng",
    "Tư vấn thay món nếu hết hàng",
    "Xác nhận giá và số lượng trước khi giao",
  ],
  itinerary: [
    "Bước 1: Khách chọn sản phẩm hoặc combo, số lượng dự kiến và nhu cầu mua dùng hay làm quà.",
    "Bước 2: Sơn La Food xác nhận tình trạng hàng, mùa vụ, cách đóng gói và chi phí dự kiến.",
    "Bước 3: Hoàn thiện đơn, gửi hướng dẫn bảo quản và hẹn thời gian giao phù hợp.",
  ],
  benefits: [
    "Dễ chọn món nhờ nhóm sản phẩm theo nhu cầu mua hàng.",
    "Nội dung có thể mở rộng cho nhiều hộ kinh doanh cùng bán trên sàn.",
    "Phù hợp demo luồng xem sản phẩm, thêm giỏ hàng và gửi yêu cầu tư vấn.",
  ],
  consultTitle: "Giữ lại sản phẩm này và nhận tư vấn đặt hàng phù hợp.",
  consultCopy: "Bạn chỉ cần để lại thông tin liên hệ. Sơn La Food sẽ xác nhận món còn hàng, số lượng, cách đóng gói, thời gian giao và gợi ý thay thế nếu sản phẩm theo mùa chưa sẵn.",
  consultPoints: [
    "Không cần thanh toán ngay trên website",
    "Có thể đổi món theo khẩu vị hoặc ngân sách",
    "Phù hợp demo cho gian hàng đặc sản Sơn La",
  ],
};

const zhPackageDetailContent: Omit<PackageDetailContent, "gallery" | "seoTitle" | "seoDescription" | "bannerImageUrl"> = {
  overviewSuffix: "此演示模板适用于所有产品详情页，重点展示产地、风味、包装方式和下单咨询流程。正式运营时可替换为每个商户的真实数据。",
  moments: [
    {
      title: "清晰的地方特产组合",
      description: "组合可包含熏肉、蘸料、山雪茶、果干或山罗时令农产品。",
    },
    {
      title: "适合试吃或送礼",
      description: "可按日常食用、礼品、批量采购或朋友分享等场景推荐产品。",
    },
    {
      title: "附带保存建议",
      description: "提供保存、加热、蘸料和搭配建议，让西北风味更容易呈现。",
    },
  ],
  offers: [
    "按口味、预算和购买场景免费建议组合。",
    "可根据季节和库存调整组合内容。",
    "支持礼盒、纸袋或运输包装建议。",
  ],
  included: [
    "产品产地信息",
    "口味推荐",
    "基础包装建议",
    "收货后保存说明",
    "缺货时替换建议",
    "发货前确认价格和数量",
  ],
  itinerary: [
    "步骤 1：选择产品或组合、预计数量和购买用途。",
    "步骤 2：确认库存、季节、包装和预计费用。",
    "步骤 3：完成订单，发送保存说明并约定配送时间。",
  ],
  benefits: [
    "按购买需求分组，便于快速选品。",
    "内容可扩展给多个本地商户共同销售。",
    "适合演示查看产品、加入购物车和提交咨询的流程。",
  ],
  consultTitle: "保留此产品，并获取合适的下单建议。",
  consultCopy: "留下联系方式后，Sơn La Food 会确认库存、数量、包装、配送时间，并在时令产品暂缺时提供替代建议。",
  consultPoints: [
    "网站无需立即付款",
    "可按口味或预算替换产品",
    "适合山罗特产店铺演示",
  ],
};

function asStringArray(value: unknown, fallback: string[]) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : fallback;
}

export function normalizePackageDetailContent(value: unknown): PackageDetailContent {
  const record = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};

  return {
    ...defaultPackageDetailContent,
    gallery: asStringArray(record.gallery, defaultPackageDetailContent.gallery),
    seoTitle: typeof record.seoTitle === "string" ? record.seoTitle : undefined,
    seoDescription: typeof record.seoDescription === "string" ? record.seoDescription : undefined,
    bannerImageUrl: typeof record.bannerImageUrl === "string" ? record.bannerImageUrl : undefined,
  };
}

export function localizePackageDetailContent(content: PackageDetailContent, locale: string): PackageDetailContent {
  if (locale !== "zh-CN") return content;

  return {
    ...content,
    ...zhPackageDetailContent,
    gallery: content.gallery,
    seoTitle: content.seoTitle,
    seoDescription: content.seoDescription,
    bannerImageUrl: content.bannerImageUrl,
  };
}
