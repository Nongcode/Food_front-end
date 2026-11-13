export const destinations = [
  "Sơn La",
  "Mộc Châu",
  "Yên Châu",
  "Thuận Châu",
  "Mai Sơn",
  "Phù Yên",
];

const foodImages = {
  hero: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  smoked: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
  spice: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80",
  tea: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=1200&q=80",
  fruit: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?auto=format&fit=crop&w=1200&q=80",
  gift: "https://images.unsplash.com/photo-1607344645866-009c7d88bc49?auto=format&fit=crop&w=1200&q=80",
};

export const posts = [
  {
    id: 1,
    category: "Ẩm thực Sơn La",
    title: "Gợi ý chọn quà biếu đặc sản Sơn La",
    excerpt: "Cách phối giỏ quà Tây Bắc theo ngân sách, dịp tặng và khẩu vị người nhận.",
    image: foodImages.gift,
    readTime: "5 phút đọc",
    date: "01/07/2026",
    status: "Đã xuất bản",
  },
  {
    id: 2,
    category: "Gia vị Tây Bắc",
    title: "Chẩm chéo mắc khén dùng với món gì ngon?",
    excerpt: "Từ thịt nướng, gà luộc đến xoài xanh, một hũ chẩm chéo có thể làm bữa ăn vui hơn rất nhiều.",
    image: foodImages.spice,
    readTime: "4 phút đọc",
    date: "01/07/2026",
    status: "Đã xuất bản",
  },
  {
    id: 3,
    category: "Nông sản theo mùa",
    title: "Mua trái cây Sơn La theo mùa cần lưu ý gì?",
    excerpt: "Một vài kinh nghiệm để chọn mận, xoài và nông sản tươi khi vào vụ.",
    image: foodImages.fruit,
    readTime: "3 phút đọc",
    date: "01/07/2026",
    status: "Đã xuất bản",
  },
];

export const offers = [
  {
    id: 1,
    title: "Ưu đãi mùa mận Mộc Châu",
    description: "Giảm nhẹ cho combo trái cây và set quà có mận, xoài, chè Shan tuyết khi đặt trước.",
    tag: "Nông sản theo mùa",
    validUntil: "30/09/2026",
    image: foodImages.fruit,
  },
];

export const packages = [
  {
    id: 1,
    slug: "combo-dac-san-son-la",
    name: "Combo đặc sản Sơn La dùng thử",
    destination: "Sơn La",
    duration: "Giao 2 - 4 ngày",
    price: "Từ 590.000đ",
    summary: "Set gồm thịt trâu gác bếp, chẩm chéo, chè Shan tuyết và một món trái cây sấy theo mùa.",
    image: foodImages.gift,
    status: "Đang mở",
  },
  {
    id: 2,
    slug: "set-qua-moc-chau-cao-cap",
    name: "Set quà Mộc Châu cao cấp",
    destination: "Mộc Châu",
    duration: "Đặt trước 1 ngày",
    price: "Từ 890.000đ",
    summary: "Giỏ quà gồm trà, mận sấy, sữa chua nếp cẩm, mật ong và thiệp chúc mừng.",
    image: foodImages.gift,
    status: "Đang mở",
  },
  {
    id: 3,
    slug: "gia-vi-cham-cheo-mac-khen",
    name: "Bộ gia vị chẩm chéo và mắc khén",
    destination: "Sơn La",
    duration: "Giao 2 - 4 ngày",
    price: "Từ 180.000đ",
    summary: "Gia vị Tây Bắc dùng chấm thịt nướng, rau luộc, hoa quả xanh hoặc ướp món nướng.",
    image: foodImages.spice,
    status: "Đang mở",
  },
  {
    id: 4,
    slug: "combo-trai-cay-yen-chau",
    name: "Combo trái cây Yên Châu theo mùa",
    destination: "Yên Châu",
    duration: "Theo lịch thu hái",
    price: "Từ 320.000đ",
    summary: "Xoài tròn Yên Châu, mận hậu hoặc trái cây sấy tùy mùa, đóng gói trong ngày.",
    image: foodImages.fruit,
    status: "Đang mở",
  },
];

export const packageCollections = [
  {
    eyebrow: "Combo gia đình",
    title: "Set đặc sản dễ dùng cho bữa cơm nhà",
    description: "Các món quen vị, dễ chế biến, phù hợp dùng thử hoặc gửi cho người thân.",
    accent: "family",
    items: [packages[0], packages[2], packages[3]],
  },
  {
    eyebrow: "Quà tặng bạn bè",
    title: "Món Tây Bắc nhỏ gọn, dễ chia sẻ",
    description: "Đồ ăn vặt, gia vị và set quà đẹp để mang đi chơi, đi picnic hoặc tặng bạn bè.",
    accent: "youth",
    items: [packages[1], packages[2], packages[3]],
  },
  {
    eyebrow: "Đặc sản Sơn La tiêu biểu",
    title: "Những hương vị nên thử đầu tiên",
    description: "Tuyển chọn các món nổi bật nhất của Sơn La để khách mới dễ chọn.",
    accent: "vietnam",
    items: [packages[0], packages[1], packages[2], packages[3]],
  },
];

export const allPackages = Array.from(
  new Map(
    packageCollections
      .flatMap((collection) => collection.items)
      .map((item) => [item.slug, item]),
  ).values(),
);

export const packageDetailExtras = {
  gallery: [foodImages.gift, foodImages.smoked, foodImages.spice, foodImages.tea, foodImages.fruit],
  benefits: [
    "Tư vấn phối combo theo khẩu vị, ngân sách và dịp tặng",
    "Gợi ý cách bảo quản, hâm nóng và dùng kèm từng món",
    "Hỗ trợ đóng gói sạch, ghi chú quà biếu và giao hàng phù hợp",
  ],
  included: [
    "Tư vấn chọn sản phẩm",
    "Đóng gói cơ bản",
    "Hướng dẫn bảo quản",
    "Gợi ý món ăn kèm",
    "Hỗ trợ đổi món theo tình trạng hàng",
    "Không yêu cầu thanh toán trực tuyến trên website",
  ],
  offers: [
    "Miễn phí tư vấn phối set lần đầu",
    "Ưu tiên gợi ý combo phù hợp cho đơn quà biếu số lượng lớn",
    "Tặng hướng dẫn bảo quản và cách dùng từng món",
  ],
  itinerary: [
    "Bước 1: Chọn nhóm đặc sản, khẩu vị và ngân sách mong muốn.",
    "Bước 2: Nhân viên xác nhận tình trạng hàng, cách đóng gói và thời gian giao.",
    "Bước 3: Hoàn thiện combo, hướng dẫn bảo quản và gửi theo thông tin đã hẹn.",
  ],
};

export const tripStyles = [
  {
    title: "Combo dùng thử",
    detail: "Phối nhiều món nhỏ để khách mới dễ nếm đủ vị Sơn La trong một đơn hàng.",
    image: foodImages.gift,
  },
  {
    title: "Quà biếu chỉn chu",
    detail: "Ưu tiên hình thức đẹp, món dễ bảo quản và lời nhắn phù hợp từng dịp tặng.",
    image: foodImages.tea,
  },
  {
    title: "Gia vị Tây Bắc",
    detail: "Mắc khén, chẩm chéo và hạt dổi giúp bữa ăn gia đình thơm nồng hơn.",
    image: foodImages.spice,
  },
  {
    title: "Đồ khô gác bếp",
    detail: "Thịt trâu, lạp sườn và các món hun khói dùng lai rai hoặc làm quà đều hợp.",
    image: foodImages.smoked,
  },
  {
    title: "Trái cây theo mùa",
    detail: "Mận, xoài và nông sản Yên Châu, Mộc Châu được gợi ý theo vụ để giữ vị tươi.",
    image: foodImages.fruit,
  },
  {
    title: "Mâm vị bản địa",
    detail: "Gợi ý cách kết hợp xôi, cá nướng, rau rừng và chẩm chéo cho bữa ăn Tây Bắc.",
    image: foodImages.hero,
  },
];

export const packageDetailMediaBySlug: Record<
  string,
  {
    banner: string;
    gallery: string[];
  }
> = Object.fromEntries(
  packages.map((item) => [
    item.slug,
    {
      banner: item.image,
      gallery: [item.image, foodImages.smoked, foodImages.spice, foodImages.tea, foodImages.fruit],
    },
  ]),
);