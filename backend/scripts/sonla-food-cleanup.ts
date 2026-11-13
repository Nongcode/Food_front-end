import "dotenv/config";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { defaultLanguages, defaultStaticTranslations } from "../lib/i18n/defaults";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const oldPackageSlugs = [
  "hoi-an-di-cham",
  "cung-duong-anh-ha-giang",
  "ky-nghi-gia-dinh-phu-quoc",
  "ninh-binh-cuoi-tuan",
  "da-nang-nghi-duong-bien",
  "quy-nhon-roadtrip",
  "da-lat-san-may",
  "con-dao-nghi-duong-rieng-tu",
  "ha-long-gia-dinh-du-thuyen",
  "phu-yen-tuoi-tre-bien-xanh",
  "hoi-an-dem-pho-co",
  "sa-pa-mua-may",
  "ninh-binh-di-san-xanh",
  "combo-hoi-an-da-nang-4n3d-kem-buoi-chup-anh-pho-co",
  "ha-giang-mua-vang-tu-van-mien-phi-lich-trinh-5-ngay",
  "mua-hoa-da-lat-uu-dai-10-homestay-ngam-thung-lung",
  "quy-nhon-tron-goi-mien-phi-xe-dua-don-san-bay-phu-cat",
  "ninh-binh-mua-lua-chin-tang-ve-cheo-kayak-trang-an",
  "dau-he-giam-15-goi-nghi-duong-phu-quoc",
];

const oldPostTitles = [
  "48 giờ ở Hội An: lịch trình chậm, ẩm thực địa phương và ánh sáng phố cổ",
  "Phú Yên sau mùa nắng: những điểm dừng đáng giá trước khi đông khách",
  "Đà Lạt ngoài trung tâm: homestay yên tĩnh, cafe rừng và chợ địa phương",
  "Kỳ nghỉ ngắn ngày ở Ninh Bình cho gia đình có trẻ nhỏ",
];

const oldDestinationNames = [
  "Vịnh Hạ Long",
  "Đà Nẵng - Hội An",
  "Đà Nẵng",
  "Hội An",
  "Phú Quốc",
  "Hà Giang",
  "Sapa",
  "Sa Pa",
  "Nha Trang",
  "Phú Yên",
  "Đà Lạt",
  "Côn Đảo",
  "Hạ Long",
  "Quy Nhơn",
  "Ninh Bình",
  "Hoi An",
  "Ha Giang",
  "Phu Quoc",
  "Da Nang",
  "Quy Nhon",
  "Da Lat",
  "Con Dao",
  "Ha Long",
  "Phu Yen",
  "Ninh Binh",
];

const oldPackageCategorySlugs = ["adventure-tours", "luxury-cruises", "cultural-heritage", "wellness-spa", "eco-tourism-nature"];
const oldCollectionAccents = ["family", "youth", "vietnam"];
const oldOfferTitles = [
  "Early Bird 15%",
  "Summer Deal 10%",
  "Ưu đãi mùa vàng Hà Giang",
  "Dấu hè giảm 15% gói nghỉ dưỡng Phú Quốc",
];
const oldReviewPackageNames = [
  "Hội An đi chậm",
  "Cung đường ảnh Hà Giang",
  "Kỳ nghỉ gia đình Phú Quốc",
];
const oldBookingPackageNames = [...oldReviewPackageNames];

const img = {
  hero: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=80",
  heroSmoke: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1800&q=85",
  heroSpices: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1800&q=85",
  heroTea: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=1800&q=85",
  mocChau: "https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?auto=format&fit=crop&w=1200&q=80",
  gift: "https://images.unsplash.com/photo-1607344645866-009c7d88bc49?auto=format&fit=crop&w=1200&q=80",
};

async function upsertSetting(settingKey: string, settingValue: string) {
  await prisma.siteSetting.upsert({ where: { settingKey }, update: { settingValue }, create: { settingKey, settingValue } });
}

async function upsertMenu(label: string, url: string, menuOrder: number, location: string) {
  const existing = await prisma.navigationMenu.findFirst({ where: { url, location } });
  if (existing) await prisma.navigationMenu.update({ where: { id: existing.id }, data: { label, menuOrder } });
  else await prisma.navigationMenu.create({ data: { label, url, menuOrder, location } });
}

async function upsertBanner(title: string, data: Prisma.BannerCreateInput) {
  const existing = await prisma.banner.findFirst({ where: { title, bannerType: data.bannerType as string } });
  if (existing) await prisma.banner.update({ where: { id: existing.id }, data });
  else await prisma.banner.create({ data });
}

async function upsertStaticTranslations() {
  for (const language of defaultLanguages) {
    await prisma.language.upsert({ where: { code: language.code }, update: language, create: language });
  }

  for (const row of defaultStaticTranslations) {
    const key = await prisma.staticTranslationKey.upsert({
      where: { namespace_key: { namespace: row.namespace, key: row.key } },
      update: { description: row.description },
      create: { namespace: row.namespace, key: row.key, description: row.description },
    });
    for (const [locale, value] of Object.entries(row.values)) {
      await prisma.staticTranslationValue.upsert({
        where: { keyId_locale: { keyId: key.id, locale } },
        update: { value },
        create: { keyId: key.id, locale, value },
      });
    }
  }
}

async function deleteOldRows() {
  const [packages, posts] = await Promise.all([
    prisma.package.findMany({ where: { slug: { in: oldPackageSlugs } }, select: { id: true } }),
    prisma.post.findMany({ where: { title: { in: oldPostTitles } }, select: { id: true } }),
  ]);
  const packageIds = packages.map((item) => item.id);
  const postIds = posts.map((item) => item.id);

  if (packageIds.length || postIds.length) {
    await prisma.contentTranslation.deleteMany({
      where: {
        OR: [
          ...(packageIds.length ? [{ entityType: "package", entityId: { in: packageIds } }] : []),
          ...(postIds.length ? [{ entityType: "post", entityId: { in: postIds } }] : []),
        ],
      },
    });
  }

  await prisma.post.updateMany({ where: { relatedPackageId: { in: packageIds } }, data: { relatedPackageId: null } });
  await prisma.post.deleteMany({ where: { id: { in: postIds } } });
  await prisma.package.deleteMany({ where: { id: { in: packageIds } } });

  await prisma.packageCategory.deleteMany({ where: { slug: { in: oldPackageCategorySlugs } } });
  await prisma.packageCollection.deleteMany({ where: { accent: { in: oldCollectionAccents }, title: { in: ["Kỳ nghỉ nhẹ nhàng cho gia đình lớn", "Chuyến đi cho nhóm bạn thích khám phá và lưu giữ kỷ niệm", "Những hành trình khám phá Việt Nam"] } } });
  await prisma.offer.deleteMany({ where: { title: { in: oldOfferTitles } } });
  await prisma.destination.deleteMany({ where: { name: { in: oldDestinationNames } } });
  await prisma.review.deleteMany({ where: { packageName: { in: oldReviewPackageNames } } });
  await prisma.booking.deleteMany({ where: { tourName: { in: oldBookingPackageNames } } });
  await prisma.navigationMenu.deleteMany({ where: { url: { in: ["/huong-dan-visa", "/uu-dai"] } } });
  await prisma.banner.deleteMany({ where: { title: { in: ["Discover Untouched Vietnam", "Travel Guides & Insider Tips", "Exclusive Offers & Packages"] } } });
}

async function upsertFoodChrome() {
  await upsertMenu("Trang chủ", "/", 1, "header");
  await upsertMenu("Combo đặc sản", "/goi-du-lich", 2, "header");
  await upsertMenu("Đặc sản Sơn La", "/dac-san", 3, "header");
  await upsertMenu("Câu chuyện ẩm thực", "/tin-tuc", 4, "header");
  await upsertMenu("Liên hệ", "/lien-he", 5, "header");
  await upsertMenu("Admin", "/admin", 1, "footer");

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
  for (const [key, value] of Object.entries(settings)) await upsertSetting(key, value);

  const banners = [
    { title: "Đặc sản Sơn La giao tận nhà", subtitle: "Combo quà tặng Tây Bắc, thịt gác bếp, chẩm chéo, chè Shan tuyết và trái cây theo mùa.", imageUrl: img.hero, linkUrl: "/dac-san", bannerType: "homepage" },
    { title: "Chè Shan tuyết và quà biếu", subtitle: "Gợi ý set quà thanh nhã với trà, trái cây theo mùa và đặc sản bản địa Sơn La.", imageUrl: img.heroTea, linkUrl: "/lien-he", bannerType: "homepage" },
    { title: "Thịt gác bếp chuẩn vị", subtitle: "Những món khô, hun khói và combo nhắm nhẹ đóng gói kỹ để gửi tặng người thân.", imageUrl: img.heroSmoke, linkUrl: "/goi-du-lich", bannerType: "homepage" },
    { title: "Gia vị rừng Tây Bắc", subtitle: "Mắc khén, chẩm chéo và các vị cay thơm được chọn lọc để bữa ăn Sơn La thêm đậm đà.", imageUrl: img.heroSpices, linkUrl: "/dac-san", bannerType: "homepage" },
    { title: "Hương vị Tây Bắc", subtitle: "Khám phá đặc sản Mộc Châu, Yên Châu, Thuận Châu và vùng cao Sơn La.", imageUrl: img.mocChau, linkUrl: "/tin-tuc", bannerType: "subpage" },
    { title: "Quà biếu Sơn La", subtitle: "Tư vấn set quà theo ngân sách, số lượng và dịp tặng.", imageUrl: img.gift, linkUrl: "/lien-he", bannerType: "detail" },
  ];
  for (const banner of banners) await upsertBanner(banner.title, { ...banner, mediaType: "image", status: "Đang mở" });
}

async function main() {
  console.log("Removing exact old travel seed rows and refreshing Sơn La Food chrome...");
  await prisma.admin.updateMany({ where: { email: "admin" }, data: { fullName: "Quản trị Sơn La Food", role: "admin", status: "active" } });
  await deleteOldRows();
  await upsertFoodChrome();
  await upsertStaticTranslations();
  console.log("Exact cleanup completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });