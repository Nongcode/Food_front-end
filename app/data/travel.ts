export const destinations = [
  "Sơn La",
  "Mộc Châu",
  "Yên Châu",
  "Thuận Châu",
  "Mai Sơn",
  "Phù Yên",
];

export const foodImages = {
  hero: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=82",
  table: "https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=1400&q=82",
  smoked: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=82",
  spice: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1400&q=82",
  tea: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=1400&q=82",
  fruit: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?auto=format&fit=crop&w=1400&q=82",
  gift: "https://images.unsplash.com/photo-1607344645866-009c7d88bc49?auto=format&fit=crop&w=1400&q=82",
  dried: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=1400&q=82",
  honey: "https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?auto=format&fit=crop&w=1400&q=82",
  rice: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1400&q=82",
  hamper: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1400&q=82",
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
    summary: "Giỏ quà gồm trà, mận sấy, mật ong, bánh đặc sản và thiệp chúc mừng.",
    image: foodImages.hamper,
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
  {
    id: 5,
    slug: "thit-trau-gac-bep-cham-cheo",
    name: "Thịt trâu gác bếp kèm chẩm chéo",
    destination: "Sơn La",
    duration: "Giao 2 - 4 ngày",
    price: "Từ 450.000đ",
    summary: "Thịt trâu gác bếp thái sẵn, gói kèm chẩm chéo để dùng trong bữa cơm hoặc làm mồi nhâm nhi.",
    image: foodImages.smoked,
    status: "Đang mở",
  },
  {
    id: 6,
    slug: "che-shan-tuyet-ta-xua",
    name: "Chè Shan tuyết Tà Xùa",
    destination: "Bắc Yên",
    duration: "Giao 2 - 4 ngày",
    price: "Từ 260.000đ",
    summary: "Trà Shan tuyết hương dịu, hợp uống hằng ngày hoặc phối cùng hộp quà biếu nhẹ nhàng.",
    image: foodImages.tea,
    status: "Đang mở",
  },
  {
    id: 7,
    slug: "xoai-say-yen-chau",
    name: "Xoài sấy dẻo Yên Châu",
    destination: "Yên Châu",
    duration: "Giao 2 - 4 ngày",
    price: "Từ 150.000đ",
    summary: "Xoài sấy dẻo vị chua ngọt, đóng túi nhỏ tiện mang đi chơi, văn phòng hoặc tặng bạn bè.",
    image: foodImages.dried,
    status: "Đang mở",
  },
  {
    id: 8,
    slug: "mat-ong-rung-son-la",
    name: "Mật ong rừng Sơn La",
    destination: "Thuận Châu",
    duration: "Giao 2 - 4 ngày",
    price: "Từ 220.000đ",
    summary: "Mật ong đóng chai gọn, dùng pha trà, nấu ăn hoặc phối trong set quà chăm sóc sức khỏe.",
    image: foodImages.honey,
    status: "Đang mở",
  },
  {
    id: 9,
    slug: "set-bua-com-tay-bac",
    name: "Set bữa cơm Tây Bắc",
    destination: "Sơn La",
    duration: "Giao 2 - 4 ngày",
    price: "Từ 520.000đ",
    summary: "Gợi ý gồm thịt gác bếp, gia vị chấm, rau củ sấy và hướng dẫn dùng cho bữa cơm gia đình.",
    image: foodImages.table,
    status: "Đang mở",
  },
  {
    id: 10,
    slug: "do-kho-picnic-son-la",
    name: "Set đồ khô đi chơi cuối tuần",
    destination: "Mộc Châu",
    duration: "Giao 1 - 3 ngày",
    price: "Từ 350.000đ",
    summary: "Đồ khô, trái cây sấy và gia vị chấm đóng gói nhỏ, tiện chia sẻ khi picnic hoặc đi xa.",
    image: foodImages.dried,
    status: "Đang mở",
  },
  {
    id: 11,
    slug: "hop-qua-doi-tac-tay-bac",
    name: "Hộp quà đối tác Tây Bắc",
    destination: "Sơn La",
    duration: "Đặt trước 2 ngày",
    price: "Từ 1.250.000đ",
    summary: "Hộp quà chỉnh chu gồm trà, mật ong, trái cây sấy, gia vị và thiệp riêng cho doanh nghiệp.",
    image: foodImages.hamper,
    status: "Đang mở",
  },
  {
    id: 12,
    slug: "combo-gia-vi-nuong",
    name: "Combo gia vị món nướng Tây Bắc",
    destination: "Sơn La",
    duration: "Giao 2 - 4 ngày",
    price: "Từ 240.000đ",
    summary: "Mắc khén, hạt dổi, muối chẩm chéo và gợi ý tẩm ướp cho thịt nướng, gà nướng, rau củ.",
    image: foodImages.spice,
    status: "Đang mở",
  },
  {
    id: 13,
    slug: "man-hau-moc-chau-theo-mua",
    name: "Mận hậu Mộc Châu theo mùa",
    destination: "Mộc Châu",
    duration: "Theo lịch thu hái",
    price: "Từ 280.000đ",
    summary: "Mận hậu chọn lứa, đóng hộp theo ngày thu hái, phù hợp ăn tươi hoặc làm quà mùa hè.",
    image: foodImages.fruit,
    status: "Theo mùa",
  },
  {
    id: 14,
    slug: "gao-nep-nuong-son-la",
    name: "Gạo nếp nương Sơn La",
    destination: "Mai Sơn",
    duration: "Giao 2 - 4 ngày",
    price: "Từ 190.000đ",
    summary: "Gạo nếp thơm dùng nấu xôi, làm bánh hoặc phối cùng combo bữa cơm gia đình.",
    image: foodImages.rice,
    status: "Đang mở",
  },
  {
    id: 15,
    slug: "set-qua-tet-son-la",
    name: "Set quà Tết Sơn La",
    destination: "Sơn La",
    duration: "Đặt trước 3 ngày",
    price: "Từ 1.490.000đ",
    summary: "Set quà lớn gồm trà, thịt gác bếp, mật ong, trái cây sấy và gia vị, phù hợp biếu gia đình hoặc đối tác.",
    image: foodImages.gift,
    status: "Đang mở",
  },
  {
    id: 16,
    slug: "combo-trai-cay-say-mix",
    name: "Combo trái cây sấy mix",
    destination: "Yên Châu",
    duration: "Giao 2 - 4 ngày",
    price: "Từ 210.000đ",
    summary: "Xoài, mận, chuối và nông sản sấy theo mùa, chia túi nhỏ dễ dùng và dễ làm quà.",
    image: foodImages.dried,
    status: "Đang mở",
  },
];

const bySlug = Object.fromEntries(packages.map((item) => [item.slug, item]));
const pick = (...slugs: string[]) => slugs.map((slug) => bySlug[slug]).filter(Boolean);

export const packageCollections = [
  {
    eyebrow: "Combo gia đình",
    title: "Set đặc sản dễ dùng cho bữa cơm nhà",
    description: "Các món quen vị, dễ chế biến, phù hợp dùng thử hoặc gửi cho người thân.",
    accent: "family",
    items: pick("combo-dac-san-son-la", "thit-trau-gac-bep-cham-cheo", "set-bua-com-tay-bac", "gao-nep-nuong-son-la"),
  },
  {
    eyebrow: "Quà tặng bạn bè",
    title: "Món Tây Bắc nhỏ gọn, dễ chia sẻ",
    description: "Đồ ăn vặt, gia vị và set quà đẹp để mang đi chơi, đi picnic hoặc tặng bạn bè.",
    accent: "youth",
    items: pick("do-kho-picnic-son-la", "xoai-say-yen-chau", "combo-trai-cay-say-mix", "gia-vi-cham-cheo-mac-khen"),
  },
  {
    eyebrow: "Đặc sản Sơn La tiêu biểu",
    title: "Những hương vị nên thử đầu tiên",
    description: "Tuyển chọn các món nổi bật nhất của Sơn La để khách mới dễ chọn.",
    accent: "vietnam",
    items: pick("combo-dac-san-son-la", "che-shan-tuyet-ta-xua", "gia-vi-cham-cheo-mac-khen", "combo-trai-cay-yen-chau"),
  },
  {
    eyebrow: "Quà biếu",
    title: "Set quà chỉn chu theo dịp",
    description: "Hộp quà, giỏ quà và set biếu tặng có thể tùy chỉnh theo ngân sách, số lượng và dịp tặng.",
    accent: "gift",
    items: pick("set-qua-moc-chau-cao-cap", "hop-qua-doi-tac-tay-bac", "set-qua-tet-son-la", "mat-ong-rung-son-la"),
  },
  {
    eyebrow: "Gia vị Tây Bắc",
    title: "Mắc khén, chẩm chéo và đồ chấm",
    description: "Nhóm gia vị giúp món nướng, món luộc và trái cây xanh rõ hương vị Sơn La hơn.",
    accent: "spice",
    items: pick("gia-vi-cham-cheo-mac-khen", "combo-gia-vi-nuong", "thit-trau-gac-bep-cham-cheo", "set-bua-com-tay-bac"),
  },
  {
    eyebrow: "Nông sản theo mùa",
    title: "Trái cây và sản phẩm mùa vụ",
    description: "Mận hậu, xoài Yên Châu và các món sấy đóng gói theo lịch thu hái thực tế.",
    accent: "fruit",
    items: pick("combo-trai-cay-yen-chau", "man-hau-moc-chau-theo-mua", "xoai-say-yen-chau", "combo-trai-cay-say-mix"),
  },
];

export const allPackages = packages;

export const packageDetailExtras = {
  gallery: [foodImages.hero, foodImages.smoked, foodImages.spice, foodImages.tea, foodImages.fruit],
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
    title: "Tuyển chọn từ hộ bản địa phương",
    detail: "Ưu tiên sản phẩm có câu chuyện rõ ràng, phù hợp để giới thiệu đặc sản Sơn La tới khách mới.",
    image: foodImages.gift,
  },
  {
    title: "Combo linh hoạt theo nhu cầu",
    detail: "Dễ phối nhiều món thành set dùng thử, set gia đình, quà biếu hoặc đơn hàng nhóm bạn.",
    image: foodImages.hero,
  },
  {
    title: "Gợi ý đúng mùa, đúng vị",
    detail: "Mận, xoài, chè, đồ khô và gia vị được sắp xếp theo thời điểm mua để giữ hương vị tốt hơn.",
    image: foodImages.fruit,
  },
  {
    title: "Đóng gói sạch và kỹ càng",
    detail: "Mỗi set được trình bày gọn gàng, dễ vận chuyển và đủ lịch sự khi gửi tặng người thân, đối tác.",
    image: foodImages.tea,
  },
  {
    title: "Gia vị chuẩn hương Tây Bắc",
    detail: "Chẩm chéo, mắc khén, hạt dổi và đồ chấm giúp món nướng, món luộc rõ chất núi rừng hơn.",
    image: foodImages.spice,
  },
  {
    title: "Hỗ trợ chọn món sau mua",
    detail: "Khách được gợi ý cách bảo quản, dùng kèm và kết hợp món để bữa ăn Sơn La trọn vị hơn.",
    image: foodImages.smoked,
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
      gallery: [item.image, foodImages.hero, foodImages.smoked, foodImages.spice, foodImages.tea, foodImages.fruit],
    },
  ]),
);