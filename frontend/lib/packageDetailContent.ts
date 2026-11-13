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
  overviewSuffix: "Sơn La Food giới thiệu rõ nguồn gốc, hương vị, quy cách đóng gói và cách bảo quản của từng sản phẩm, đồng thời tư vấn chọn món phù hợp trước khi bạn đặt hàng.",
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
    "Sản phẩm được tuyển chọn từ các hộ sản xuất địa phương ở Sơn La.",
    "Đặt hàng đơn giản: thêm vào giỏ hàng rồi gửi yêu cầu, nhân viên sẽ gọi xác nhận.",
  ],
  consultTitle: "Giữ lại sản phẩm này và nhận tư vấn đặt hàng phù hợp.",
  consultCopy: "Bạn chỉ cần để lại thông tin liên hệ. Sơn La Food sẽ xác nhận món còn hàng, số lượng, cách đóng gói, thời gian giao và gợi ý thay thế nếu sản phẩm theo mùa chưa sẵn.",
  consultPoints: [
    "Không cần thanh toán ngay trên website",
    "Có thể đổi món theo khẩu vị hoặc ngân sách",
    "Xác nhận giá, số lượng và thời gian giao trước khi gửi hàng",
  ],
};

const zhPackageDetailContent: Omit<PackageDetailContent, "gallery" | "seoTitle" | "seoDescription" | "bannerImageUrl"> = {
  overviewSuffix: "Sơn La Food 清楚介绍每款产品的产地、风味、包装规格和保存方法，并在您下单前提供选购建议。",
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
    "产品精选自山罗本地生产户。",
    "下单简单：加入购物车并提交请求，工作人员会致电确认。",
  ],
  consultTitle: "保留此产品，并获取合适的下单建议。",
  consultCopy: "留下联系方式后，Sơn La Food 会确认库存、数量、包装、配送时间，并在时令产品暂缺时提供替代建议。",
  consultPoints: [
    "网站无需立即付款",
    "可按口味或预算替换产品",
    "发货前确认价格、数量和配送时间",
  ],
};

const enPackageDetailContent: Omit<PackageDetailContent, "gallery" | "seoTitle" | "seoDescription" | "bannerImageUrl"> = {
  overviewSuffix: "Sơn La Food explains the origin, flavour, packing and storage of every product, and helps you choose the right items before you order.",
  moments: [
    {
      title: "Clear specialty ingredients",
      description: "Each combo may include smoked meat, chẩm chéo dipping sauce, mắc khén pepper, Shan tuyết tea, dried fruit or seasonal produce from Sơn La.",
    },
    {
      title: "Great to try or to give",
      description: "Products are suggested for everyday meals, gifts, bulk orders or small packs to share with friends.",
    },
    {
      title: "Storage guidance included",
      description: "We remind you how to store, reheat, mix dipping sauces and pair dishes so the Northwest flavour stays intact after delivery.",
    },
  ],
  offers: [
    "Free advice on building a set for your taste, budget and occasion.",
    "Combo contents may change with the season and actual stock.",
    "Help choosing gift boxes, paper bags or shipping packaging.",
  ],
  included: [
    "Product origin information",
    "Taste suggestions",
    "Basic packing",
    "Storage guidance after delivery",
    "Substitution advice when out of stock",
    "Price and quantity confirmed before delivery",
  ],
  itinerary: [
    "Step 1: Choose products or combos, the expected quantity and whether it is for yourself or a gift.",
    "Step 2: Sơn La Food confirms stock, season, packing and the estimated cost.",
    "Step 3: We finalise the order, send storage tips and schedule a suitable delivery time.",
  ],
  benefits: [
    "Easy to choose thanks to products grouped by need.",
    "Products are sourced from local producers in Sơn La.",
    "Simple ordering: add to cart and send a request, our staff will call to confirm.",
  ],
  consultTitle: "Save this product and get advice on your order.",
  consultCopy: "Just leave your contact details. Sơn La Food will confirm availability, quantity, packing and delivery time, and suggest alternatives if a seasonal product is not ready yet.",
  consultPoints: [
    "No online payment required",
    "Swap items to suit your taste or budget",
    "Price, quantity and delivery time confirmed before shipping",
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
  const localized = locale === "zh-CN" ? zhPackageDetailContent : locale === "en" ? enPackageDetailContent : null;
  if (!localized) return content;

  return {
    ...content,
    ...localized,
    gallery: content.gallery,
    seoTitle: content.seoTitle,
    seoDescription: content.seoDescription,
    bannerImageUrl: content.bannerImageUrl,
  };
}
