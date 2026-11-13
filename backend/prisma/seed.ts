import crypto from "crypto";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { slugify } from "../lib/slug";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const img = {
  hero: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=80",
  heroSmoke: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1800&q=85",
  heroSpices: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1800&q=85",
  heroTea: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=1800&q=85",
  mocChau: "https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?auto=format&fit=crop&w=1200&q=80",
  smoked: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
  tea: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=1200&q=80",
  spice: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80",
  fruit: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?auto=format&fit=crop&w=1200&q=80",
  gift: "https://images.unsplash.com/photo-1607344645866-009c7d88bc49?auto=format&fit=crop&w=1200&q=80",
};

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function upsertMenu(label: string, url: string, menuOrder: number, location: string) {
  const existing = await prisma.navigationMenu.findFirst({ where: { label, url, location } });
  if (existing) return prisma.navigationMenu.update({ where: { id: existing.id }, data: { menuOrder } });
  return prisma.navigationMenu.create({ data: { label, url, menuOrder, location } });
}

async function upsertOffer(title: string, data: Prisma.OfferCreateInput) {
  const existing = await prisma.offer.findFirst({ where: { title } });
  if (existing) return prisma.offer.update({ where: { id: existing.id }, data });
  return prisma.offer.create({ data });
}

async function upsertBanner(bannerType: string, title: string, data: Prisma.BannerCreateInput) {
  const existing = await prisma.banner.findFirst({ where: { bannerType, title } });
  if (existing) return prisma.banner.update({ where: { id: existing.id }, data });
  return prisma.banner.create({ data });
}

async function main() {
  console.log("Seeding Son La food database...");

  await prisma.admin.upsert({
    where: { email: "admin" },
    update: { fullName: "Quản trị Sơn La Food", role: "admin", status: "active" },
    create: {
      email: "admin",
      passwordHash: hashPassword("admin123"),
      fullName: "Quản trị Sơn La Food",
      role: "admin",
      status: "active",
    },
  });

  for (const language of [
    { code: "vi", name: "Tiếng Việt", nativeName: "Tiếng Việt", flag: "VN", isActive: true, isDefault: true, sortOrder: 1 },
    { code: "en", name: "English", nativeName: "English", flag: "GB", isActive: true, isDefault: false, sortOrder: 2 },
    { code: "zh-CN", name: "Chinese Simplified", nativeName: "Chinese Simplified", flag: "CN", isActive: true, isDefault: false, sortOrder: 3 },
  ]) {
    await prisma.language.upsert({ where: { code: language.code }, update: language, create: language });
  }

  const settings: Record<string, string> = {
    site_status: "active",
    page_home_status: "active",
    page_tours_status: "active",
    page_visa_status: "inactive",
    page_news_status: "active",
    page_contact_status: "active",
    page_local_specialties_status: "active",
    header_company_name: "Sơn La Food",
    header_logo_alt: "Sơn La Food",
    footer_brand_name: "Sơn La Food",
    footer_description: "Cửa hàng giới thiệu đặc sản Sơn La, quà tặng Tây Bắc và những hương vị bản địa được tuyển chọn.",
    footer_address: "Thành phố Sơn La, Sơn La",
    footer_phone: "0900 123 456",
    footer_email: "hello@sonlafood.vn",
    footer_facebook: "https://facebook.com/sonlafood",
    footer_instagram: "https://instagram.com/sonlafood",
    footer_twitter: "",
    footer_copyright: "© 2026 Sơn La Food. All rights reserved.",
  };
  for (const [settingKey, settingValue] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({ where: { settingKey }, update: { settingValue }, create: { settingKey, settingValue } });
  }

  await upsertMenu("Trang chủ", "/", 1, "header");
  await upsertMenu("Combo đặc sản", "/goi-du-lich", 2, "header");
  await upsertMenu("Đặc sản Sơn La", "/dac-san", 3, "header");
  await upsertMenu("Câu chuyện ẩm thực", "/tin-tuc", 4, "header");
  await upsertMenu("Liên hệ", "/lien-he", 5, "header");
  await upsertMenu("Admin", "/admin", 6, "footer");

  const homepageBanners = [
    {
      title: "Gia vị rừng Tây Bắc",
      subtitle: "Mắc khén, chẩm chéo và các vị cay thơm được chọn lọc để bữa ăn Sơn La thêm đậm đà.",
      imageUrl: img.heroSpices,
      linkUrl: "/dac-san",
    },
    {
      title: "Thịt gác bếp chuẩn vị",
      subtitle: "Những món khô, hun khói và combo nhắm nhẹ đóng gói kỹ để gửi tặng người thân.",
      imageUrl: img.heroSmoke,
      linkUrl: "/goi-du-lich",
    },
    {
      title: "Chè Shan tuyết và quà biếu",
      subtitle: "Gợi ý set quà thanh nhã với trà, trái cây theo mùa và đặc sản bản địa Sơn La.",
      imageUrl: img.heroTea,
      linkUrl: "/lien-he",
    },
    {
      title: "Đặc sản Sơn La giao tận nhà",
      subtitle: "Combo quà tặng Tây Bắc, thịt gác bếp, chẩm chéo, chè Shan tuyết và trái cây theo mùa.",
      imageUrl: img.hero,
      linkUrl: "/dac-san",
    },
  ];

  for (const banner of homepageBanners) {
    await upsertBanner("homepage", banner.title, {
      title: banner.title,
      subtitle: banner.subtitle,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      bannerType: "homepage",
      mediaType: "image",
      status: "Đang mở",
    });
  }
  await upsertBanner("subpage", "Hương vị Tây Bắc", {
    title: "Hương vị Tây Bắc",
    subtitle: "Khám phá đặc sản Mộc Châu, Yên Châu, Thuận Châu và vùng cao Sơn La.",
    imageUrl: img.mocChau,
    linkUrl: "/tin-tuc",
    bannerType: "subpage",
    mediaType: "image",
    status: "Đang mở",
  });
  await upsertBanner("detail", "Quà biếu Sơn La", {
    title: "Quà biếu Sơn La",
    subtitle: "Tư vấn set quà theo ngân sách, số lượng và dịp tặng.",
    imageUrl: img.gift,
    linkUrl: "/lien-he",
    bannerType: "detail",
    mediaType: "image",
    status: "Đang mở",
  });

  for (const name of ["Sơn La", "Mộc Châu", "Yên Châu", "Thuận Châu", "Mai Sơn", "Phù Yên"]) {
    await prisma.destination.upsert({ where: { name }, update: { slug: slugify(name) }, create: { name, slug: slugify(name) } });
  }
  const sonLa = await prisma.destination.findUniqueOrThrow({ where: { name: "Sơn La" } });
  const mocChau = await prisma.destination.findUniqueOrThrow({ where: { name: "Mộc Châu" } });
  const yenChau = await prisma.destination.findUniqueOrThrow({ where: { name: "Yên Châu" } });

  const packageCategoryRows = await Promise.all([
    prisma.packageCategory.upsert({ where: { slug: "combo-dac-san" }, update: { name: "Combo đặc sản", description: "Các set sản phẩm đã phối sẵn cho gia đình, nhóm bạn hoặc quà biếu." }, create: { name: "Combo đặc sản", slug: "combo-dac-san", description: "Các set sản phẩm đã phối sẵn cho gia đình, nhóm bạn hoặc quà biếu." } }),
    prisma.packageCategory.upsert({ where: { slug: "qua-tang-tay-bac" }, update: { name: "Quà tặng Tây Bắc", description: "Giỏ quà đóng gói đẹp, phù hợp dịp lễ, Tết và biếu đối tác." }, create: { name: "Quà tặng Tây Bắc", slug: "qua-tang-tay-bac", description: "Giỏ quà đóng gói đẹp, phù hợp dịp lễ, Tết và biếu đối tác." } }),
    prisma.packageCategory.upsert({ where: { slug: "gia-vi-va-do-kho" }, update: { name: "Gia vị và đồ khô", description: "Mắc khén, chẩm chéo, thịt gác bếp và các món bảo quản lâu." }, create: { name: "Gia vị và đồ khô", slug: "gia-vi-va-do-kho", description: "Mắc khén, chẩm chéo, thịt gác bếp và các món bảo quản lâu." } }),
  ]);
  const cat = Object.fromEntries(packageCategoryRows.map((row) => [row.slug, row.id]));

  const collectionDefs = [
    { accent: "family", eyebrow: "Combo gia đình", title: "Set đặc sản dễ dùng cho bữa cơm nhà", description: "Các món quen vị, dễ chế biến, phù hợp dùng thử hoặc gửi cho người thân." },
    { accent: "youth", eyebrow: "Quà tặng bạn bè", title: "Món Tây Bắc nhỏ gọn, dễ chia sẻ", description: "Đồ ăn vặt, gia vị và set quà đẹp để mang đi chơi, đi picnic hoặc tặng bạn bè." },
    { accent: "vietnam", eyebrow: "Đặc sản Sơn La tiêu biểu", title: "Những hương vị nên thử đầu tiên", description: "Tuyển chọn các món nổi bật nhất của Sơn La để khách mới dễ chọn." },
  ];
  const collectionIds = new Map<string, number>();
  for (const collection of collectionDefs) {
    const existing = await prisma.packageCollection.findFirst({ where: { accent: collection.accent } });
    const row = existing ? await prisma.packageCollection.update({ where: { id: existing.id }, data: collection }) : await prisma.packageCollection.create({ data: collection });
    collectionIds.set(collection.accent, row.id);
  }

  const offer = await upsertOffer("Ưu đãi mùa mận Mộc Châu", {
    title: "Ưu đãi mùa mận Mộc Châu",
    description: "Giảm 10% cho đơn combo trái cây và đặc sản khô từ 2 set.",
    tag: "Mùa vụ",
    imageUrl: img.fruit,
    validUntil: new Date("2026-09-30"),
  });

  const packageDefs = [
    { slug: "combo-dac-san-son-la", name: "Combo đặc sản Sơn La dùng thử", categoryId: cat["combo-dac-san"], destinationId: sonLa.id, offerId: null, duration: "Giao 2 - 4 ngày", priceText: "Từ 590.000đ", summary: "Set gồm thịt trâu gác bếp, chẩm chéo, chè Shan tuyết và một món trái cây sấy theo mùa.", description: "Combo phù hợp cho khách muốn thử nhiều hương vị Sơn La trong một đơn hàng nhỏ gọn.", minPeople: 1, maxPeople: 4, peopleNote: "Phù hợp dùng trong gia đình hoặc làm quà nhỏ.", imageUrl: img.gift, status: "Đang mở", collections: ["family", "vietnam"] },
    { slug: "set-qua-moc-chau-cao-cap", name: "Set quà Mộc Châu cao cấp", categoryId: cat["qua-tang-tay-bac"], destinationId: mocChau.id, offerId: offer.id, duration: "Đặt trước 1 ngày", priceText: "Từ 890.000đ", summary: "Giỏ quà gồm trà, mận sấy, sữa chua nếp cẩm, mật ong và thiệp chúc mừng.", description: "Set quà lịch sự cho dịp lễ, Tết, sinh nhật hoặc quà đối tác.", minPeople: 1, maxPeople: 1, peopleNote: "Có thể tùy biến theo ngân sách.", imageUrl: img.mocChau, status: "Đang mở", collections: ["youth", "vietnam"] },
    { slug: "gia-vi-cham-cheo-mac-khen", name: "Bộ gia vị chẩm chéo và mắc khén", categoryId: cat["gia-vi-va-do-kho"], destinationId: sonLa.id, offerId: null, duration: "Giao 2 - 4 ngày", priceText: "Từ 180.000đ", summary: "Gia vị Tây Bắc dùng chấm thịt nướng, rau luộc, hoa quả xanh hoặc ướp món nướng.", description: "Bộ gia vị đóng hũ nhỏ, thơm mùi mắc khén, dễ bảo quản và dễ dùng trong bếp gia đình.", minPeople: 1, maxPeople: 6, peopleNote: "Một set dùng được nhiều bữa.", imageUrl: img.spice, status: "Đang mở", collections: ["family", "youth"] },
    { slug: "combo-trai-cay-yen-chau", name: "Combo trái cây Yên Châu theo mùa", categoryId: cat["combo-dac-san"], destinationId: yenChau.id, offerId: offer.id, duration: "Theo lịch thu hái", priceText: "Từ 320.000đ", summary: "Xoài tròn Yên Châu, mận hậu hoặc trái cây sấy tùy mùa, đóng gói trong ngày.", description: "Sản phẩm theo mùa, phù hợp đặt sớm để giữ độ tươi và hương vị đặc trưng.", minPeople: 1, maxPeople: 5, peopleNote: "Số lượng thay đổi theo mùa vụ.", imageUrl: img.fruit, status: "Đang mở", collections: ["family", "vietnam"] },
  ];
  const packageIds = new Map<string, number>();
  for (const item of packageDefs) {
    const { collections, ...data } = item;
    const pkg = await prisma.package.upsert({ where: { slug: item.slug }, update: data, create: data });
    packageIds.set(item.slug, pkg.id);
    await prisma.packageDetail.upsert({
      where: { packageId: pkg.id },
      update: { bannerImageUrl: item.imageUrl, overview: item.description, highlights: ["Sản phẩm tuyển chọn", "Đóng gói sạch", "Tư vấn set quà theo ngân sách"] as Prisma.InputJsonValue, included: ["Tư vấn chọn sản phẩm", "Đóng gói cơ bản", "Hướng dẫn bảo quản"] as Prisma.InputJsonValue, consultTitle: "Cần phối set quà riêng?", consultCopy: "Gửi ngân sách và số lượng, đội ngũ sẽ gợi ý combo phù hợp." },
      create: { packageId: pkg.id, bannerImageUrl: item.imageUrl, overview: item.description, highlights: ["Sản phẩm tuyển chọn", "Đóng gói sạch", "Tư vấn set quà theo ngân sách"] as Prisma.InputJsonValue, included: ["Tư vấn chọn sản phẩm", "Đóng gói cơ bản", "Hướng dẫn bảo quản"] as Prisma.InputJsonValue, consultTitle: "Cần phối set quà riêng?", consultCopy: "Gửi ngân sách và số lượng, đội ngũ sẽ gợi ý combo phù hợp." },
    });
    await prisma.packageCollectionItem.deleteMany({ where: { packageId: pkg.id } });
    for (const [sortOrder, accent] of collections.entries()) {
      const collectionId = collectionIds.get(accent);
      if (collectionId) await prisma.packageCollectionItem.create({ data: { collectionId, packageId: pkg.id, sortOrder } });
    }
  }

  const specialtyCategoryRows = await Promise.all([
    prisma.localSpecialtyCategory.upsert({ where: { slug: "mon-an-truyen-thong" }, update: { name: "Món ăn truyền thống", type: "FOOD", description: "Món ăn gắn với văn hóa người Thái, Mông và các cộng đồng Sơn La." }, create: { name: "Món ăn truyền thống", slug: "mon-an-truyen-thong", type: "FOOD", description: "Món ăn gắn với văn hóa người Thái, Mông và các cộng đồng Sơn La." } }),
    prisma.localSpecialtyCategory.upsert({ where: { slug: "do-kho" }, update: { name: "Đồ khô", type: "DRY_FOOD", description: "Các món dễ bảo quản, phù hợp vận chuyển xa." }, create: { name: "Đồ khô", slug: "do-kho", type: "DRY_FOOD", description: "Các món dễ bảo quản, phù hợp vận chuyển xa." } }),
    prisma.localSpecialtyCategory.upsert({ where: { slug: "gia-vi-tay-bac" }, update: { name: "Gia vị Tây Bắc", type: "SPICE", description: "Gia vị thơm nồng dùng cho món nướng, món chấm và món ướp." }, create: { name: "Gia vị Tây Bắc", slug: "gia-vi-tay-bac", type: "SPICE", description: "Gia vị thơm nồng dùng cho món nướng, món chấm và món ướp." } }),
    prisma.localSpecialtyCategory.upsert({ where: { slug: "trai-cay-theo-mua" }, update: { name: "Trái cây theo mùa", type: "FRUIT", description: "Mận hậu, xoài Yên Châu và nông sản nổi bật theo mùa." }, create: { name: "Trái cây theo mùa", slug: "trai-cay-theo-mua", type: "FRUIT", description: "Mận hậu, xoài Yên Châu và nông sản nổi bật theo mùa." } }),
    prisma.localSpecialtyCategory.upsert({ where: { slug: "tra-va-do-uong" }, update: { name: "Trà và đồ uống", type: "DRINK", description: "Trà vùng cao, đồ uống lên men và sản phẩm từ sữa Mộc Châu." }, create: { name: "Trà và đồ uống", slug: "tra-va-do-uong", type: "DRINK", description: "Trà vùng cao, đồ uống lên men và sản phẩm từ sữa Mộc Châu." } }),
  ]);
  const specialtyCat = Object.fromEntries(specialtyCategoryRows.map((row) => [row.slug, row.id]));

  const specialtyDefs = [
    { slug: "thit-trau-gac-bep-son-la", name: "Thịt trâu gác bếp Sơn La", type: "DRY_FOOD", categoryId: specialtyCat["do-kho"], destinationId: sonLa.id, description: "Thịt trâu tẩm mắc khén, hạt dổi rồi hun khói chậm, có vị ngọt thịt và hương khói đặc trưng.", imageUrl: img.smoked, priceText: "Từ 650.000đ/kg", whereToBuy: "Có thể đặt theo miếng hút chân không tại cửa hàng Sơn La Food.", overview: "Món quà biếu nổi bật của vùng Tây Bắc, hợp ăn lai rai hoặc xé nhỏ chấm chẩm chéo." },
    { slug: "pa-pinh-top", name: "Pa pỉnh tộp", type: "FOOD", categoryId: specialtyCat["mon-an-truyen-thong"], destinationId: sonLa.id, description: "Cá suối nướng gập đôi, ướp mắc khén, rau thơm rừng và gia vị của người Thái.", imageUrl: img.hero, priceText: "Từ 180.000đ/phần", whereToBuy: "Đặt trước theo ngày tại khu bếp địa phương.", overview: "Món ăn thơm mùi than hồng, hợp dùng cùng xôi nếp nương." },
    { slug: "cham-cheo-mac-khen", name: "Chẩm chéo mắc khén", type: "SPICE", categoryId: specialtyCat["gia-vi-tay-bac"], destinationId: sonLa.id, description: "Muối chấm thơm cay từ mắc khén, ớt, tỏi và rau thơm khô.", imageUrl: img.spice, priceText: "Từ 55.000đ/hũ", whereToBuy: "Có sẵn theo hũ 100g, 200g.", overview: "Gia vị nhỏ nhưng tạo đúng hồn Tây Bắc cho các món luộc, nướng và trái cây xanh." },
    { slug: "che-shan-tuyet-ta-xua", name: "Chè Shan tuyết Tà Xùa", type: "DRINK", categoryId: specialtyCat["tra-va-do-uong"], destinationId: sonLa.id, description: "Trà Shan tuyết vùng cao có hương thơm dịu, hậu ngọt và nước trà trong.", imageUrl: img.tea, priceText: "Từ 220.000đ/200g", whereToBuy: "Đóng gói túi bạc hoặc hộp quà.", overview: "Phù hợp uống hàng ngày hoặc làm quà tặng cho người thích trà." },
    { slug: "xoai-tron-yen-chau", name: "Xoài tròn Yên Châu", type: "FRUIT", categoryId: specialtyCat["trai-cay-theo-mua"], destinationId: yenChau.id, description: "Xoài quả nhỏ, thơm, vị ngọt thanh xen chút chua nhẹ, đặc trưng vùng Yên Châu.", imageUrl: img.fruit, priceText: "Theo mùa", whereToBuy: "Nhận đặt theo thùng khi vào vụ.", overview: "Nông sản theo mùa, phù hợp ăn tươi hoặc làm quà quê." },
  ];
  for (const item of specialtyDefs) {
    const { overview, ...data } = item;
    const specialty = await prisma.localSpecialty.upsert({ where: { slug: item.slug }, update: { ...data, status: "Hiển thị" }, create: { ...data, status: "Hiển thị" } });
    await prisma.localSpecialtyDetail.upsert({
      where: { specialtyId: specialty.id },
      update: { bannerImageUrl: item.imageUrl, overview, history: "Gắn với văn hóa ẩm thực vùng cao Sơn La.", ingredients: "Nguyên liệu bản địa được tuyển chọn.", howToUse: "Dùng theo hướng dẫn kèm sản phẩm.", preservation: "Bảo quản nơi khô mát, tránh nắng trực tiếp.", highlights: ["Nguồn gốc Sơn La", "Phù hợp làm quà", "Có hướng dẫn bảo quản"] as Prisma.InputJsonValue, seoTitle: `${item.name} | Đặc sản Sơn La`, seoDescription: item.description },
      create: { specialtyId: specialty.id, bannerImageUrl: item.imageUrl, overview, history: "Gắn với văn hóa ẩm thực vùng cao Sơn La.", ingredients: "Nguyên liệu bản địa được tuyển chọn.", howToUse: "Dùng theo hướng dẫn kèm sản phẩm.", preservation: "Bảo quản nơi khô mát, tránh nắng trực tiếp.", highlights: ["Nguồn gốc Sơn La", "Phù hợp làm quà", "Có hướng dẫn bảo quản"] as Prisma.InputJsonValue, seoTitle: `${item.name} | Đặc sản Sơn La`, seoDescription: item.description },
    });
  }

  const blogCategory = await prisma.category.upsert({ where: { name: "Ẩm thực Sơn La" }, update: { slug: "am-thuc-son-la" }, create: { name: "Ẩm thực Sơn La", slug: "am-thuc-son-la" } });
  const author = (await prisma.author.findFirst({ where: { name: "Sơn La Food Team" } })) || (await prisma.author.create({ data: { name: "Sơn La Food Team", role: "Biên tập ẩm thực" } }));
  for (const post of [
    { slug: "goi-y-qua-bieu-dac-san-son-la", title: "Gợi ý chọn quà biếu đặc sản Sơn La", excerpt: "Cách phối giỏ quà Tây Bắc theo ngân sách, dịp tặng và khẩu vị người nhận.", imageUrl: img.gift, summary: "Một giỏ quà dễ dùng nên có đủ món khô, gia vị, trà và một sản phẩm theo mùa.", readTime: "5 phút đọc", relatedPackageSlug: "set-qua-moc-chau-cao-cap" },
    { slug: "cham-cheo-mac-khen-dung-voi-mon-gi", title: "Chẩm chéo mắc khén dùng với món gì ngon?", excerpt: "Từ thịt nướng, gà luộc đến xoài xanh, một hũ chẩm chéo có thể làm bữa ăn vui hơn rất nhiều.", imageUrl: img.spice, summary: "Chẩm chéo hợp nhất với các món nướng, đồ luộc và trái cây xanh.", readTime: "4 phút đọc", relatedPackageSlug: "gia-vi-cham-cheo-mac-khen" },
    { slug: "mua-trai-cay-son-la-theo-mua", title: "Mua trái cây Sơn La theo mùa cần lưu ý gì?", excerpt: "Một vài kinh nghiệm để chọn mận, xoài và nông sản tươi khi vào vụ.", imageUrl: img.fruit, summary: "Trái cây Sơn La ngon nhất khi đặt đúng vụ và nhận hàng gần ngày thu hái.", readTime: "3 phút đọc", relatedPackageSlug: "combo-trai-cay-yen-chau" },
  ]) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: { title: post.title, categoryId: blogCategory.id, authorId: author.id, destinationId: sonLa.id, relatedPackageId: packageIds.get(post.relatedPackageSlug), excerpt: post.excerpt, summary: post.summary, imageUrl: post.imageUrl, contentImageUrl: post.imageUrl, readTime: post.readTime, seoDescription: post.excerpt, contentBlocks: [{ type: "paragraph", text: post.summary }, { type: "image", url: post.imageUrl, caption: post.title }] as Prisma.InputJsonValue, status: "Đã xuất bản", publishedAt: new Date("2026-07-01") },
      create: { slug: post.slug, title: post.title, categoryId: blogCategory.id, authorId: author.id, destinationId: sonLa.id, relatedPackageId: packageIds.get(post.relatedPackageSlug), excerpt: post.excerpt, summary: post.summary, imageUrl: post.imageUrl, contentImageUrl: post.imageUrl, readTime: post.readTime, seoDescription: post.excerpt, contentBlocks: [{ type: "paragraph", text: post.summary }, { type: "image", url: post.imageUrl, caption: post.title }] as Prisma.InputJsonValue, status: "Đã xuất bản", publishedAt: new Date("2026-07-01") },
    });
  }

  if ((await prisma.review.count()) === 0) {
    await prisma.review.createMany({ data: [
      { customerName: "Nguyễn Mai Anh", packageName: "Combo đặc sản Sơn La dùng thử", rating: 5, comment: "Đóng gói sạch, thịt trâu thơm và chẩm chéo rất hợp khẩu vị gia đình.", status: "Hiển thị", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
      { customerName: "Trần Đức Huy", packageName: "Set quà Mộc Châu cao cấp", rating: 5, comment: "Giỏ quà nhìn lịch sự, tư vấn nhanh, phù hợp biếu đối tác.", status: "Hiển thị", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
    ] });
  }

  if ((await prisma.customer.count()) === 0) {
    await prisma.customer.createMany({ data: [
      { name: "Nguyễn Mai Anh", email: "maianh@example.com", phone: "0912345678", totalBookings: 1, totalSpent: "590.000đ", notes: "Thích combo có thịt trâu và gia vị.", status: "Hoạt động" },
      { name: "Trần Đức Huy", email: "huy.tran@example.com", phone: "0987654321", totalBookings: 1, totalSpent: "890.000đ", notes: "Khách mua quà doanh nghiệp.", status: "Hoạt động" },
    ] });
  }

  if ((await prisma.booking.count()) === 0) {
    await prisma.booking.createMany({ data: [
      { customerName: "Nguyễn Mai Anh", email: "maianh@example.com", phone: "0912345678", tourName: "Combo đặc sản Sơn La dùng thử", travelDate: "2026-08-05", numberOfTravelers: 1, totalPrice: "590.000đ", notes: "Giao trong giờ hành chính.", status: "Chờ xử lý" },
      { customerName: "Trần Đức Huy", email: "huy.tran@example.com", phone: "0987654321", tourName: "Set quà Mộc Châu cao cấp", travelDate: "2026-08-10", numberOfTravelers: 3, totalPrice: "2.670.000đ", notes: "Cần in thiệp chúc mừng riêng.", status: "Đang xử lý" },
    ] });
  }

  console.log("Son La food seed completed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
  await pool.end();
});
