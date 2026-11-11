import "dotenv/config";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { slugify } from "../lib/slug";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const demoPassword = process.env.DEMO_ADMIN_PASSWORD || crypto.randomBytes(9).toString("base64url");
const shouldResetSystemAdmin = process.env.RESET_SYSTEM_ADMIN_PASSWORD === "true";

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}


const img = {
  spice: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=85",
  smoked: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85",
  fruit: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?auto=format&fit=crop&w=1200&q=85",
  gift: "https://images.unsplash.com/photo-1607344645866-009c7d88bc49?auto=format&fit=crop&w=1200&q=85",
  tea: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=1200&q=85",
};

async function upsertAdmin(email: string, fullName: string, role: string) {
  const existing = await prisma.admin.findUnique({ where: { email } });
  const passwordHash = hashPassword(demoPassword);
  if (existing) {
    await prisma.admin.update({
      where: { email },
      data: email.startsWith("vendor-") || shouldResetSystemAdmin ? { fullName, role, status: "active", passwordHash } : { fullName, role, status: "active" },
    });
    return;
  }
  await prisma.admin.create({ data: { email, fullName, role, status: "active", passwordHash } });
}

async function getDestination(name: string) {
  return prisma.destination.upsert({
    where: { name },
    update: { slug: slugify(name) },
    create: { name, slug: slugify(name) },
  });
}

async function getCategory(name: string, slug: string, description: string) {
  const existing = await prisma.packageCategory.findFirst({ where: { OR: [{ slug }, { name }] } });
  if (existing) {
    return prisma.packageCategory.update({ where: { id: existing.id }, data: { name, slug, description } });
  }
  return prisma.packageCategory.create({ data: { name, slug, description } });
}

async function upsertPackage(input: {
  slug: string;
  name: string;
  destinationId: number;
  categoryId: number;
  duration: string;
  priceText: string;
  summary: string;
  description: string;
  imageUrl: string;
  status?: string;
}) {
  return prisma.package.upsert({
    where: { slug: input.slug },
    update: {
      name: input.name,
      destinationId: input.destinationId,
      categoryId: input.categoryId,
      duration: input.duration,
      priceText: input.priceText,
      summary: input.summary,
      description: input.description,
      imageUrl: input.imageUrl,
      status: input.status || "\u0110ang m\u1edf b\u00e1n",
      minPeople: 1,
      maxPeople: 20,
      peopleNote: "T\u01b0 v\u1ea5n theo s\u1ed1 l\u01b0\u1ee3ng v\u00e0 ng\u00e2n s\u00e1ch.",
    },
    create: {
      slug: input.slug,
      name: input.name,
      destinationId: input.destinationId,
      categoryId: input.categoryId,
      duration: input.duration,
      priceText: input.priceText,
      summary: input.summary,
      description: input.description,
      imageUrl: input.imageUrl,
      status: input.status || "\u0110ang m\u1edf b\u00e1n",
      minPeople: 1,
      maxPeople: 20,
      peopleNote: "T\u01b0 v\u1ea5n theo s\u1ed1 l\u01b0\u1ee3ng v\u00e0 ng\u00e2n s\u00e1ch.",
    },
  });
}

async function upsertCustomer(input: { name: string; email: string; phone: string; totalBookings: number; totalSpent: string; notes: string }) {
  await prisma.customer.upsert({
    where: { email: input.email },
    update: { name: input.name, phone: input.phone, totalBookings: input.totalBookings, totalSpent: input.totalSpent, notes: input.notes, status: "Ho\u1ea1t \u0111\u1ed9ng" },
    create: { ...input, status: "Ho\u1ea1t \u0111\u1ed9ng" },
  });
}

async function createBookingIfMissing(input: {
  customerName: string;
  email: string;
  phone: string;
  tourName: string;
  totalPrice: string;
  status: string;
  notes: string;
  daysAgo: number;
}) {
  const existing = await prisma.booking.findFirst({ where: { phone: input.phone, tourName: input.tourName, totalPrice: input.totalPrice } });
  if (existing) {
    await prisma.booking.update({ where: { id: existing.id }, data: { status: input.status, notes: input.notes, totalPrice: input.totalPrice } });
    return;
  }

  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - input.daysAgo);
  await prisma.booking.create({
    data: {
      customerName: input.customerName,
      email: input.email,
      phone: input.phone,
      tourName: input.tourName,
      totalPrice: input.totalPrice,
      status: input.status,
      notes: input.notes,
      travelDate: "Theo l\u1ecbch t\u01b0 v\u1ea5n",
      numberOfTravelers: 1,
      createdAt,
    },
  });
}

async function main() {
  console.log("Seeding marketplace admin demo data...");

  await upsertAdmin("admin", "Qu\u1ea3n tr\u1ecb h\u1ec7 th\u1ed1ng Son La Food", "admin");
  await upsertAdmin("vendor-giavi", "Gian h\u00e0ng Gia v\u1ecb T\u00e2y B\u1eafc", "vendor");
  await upsertAdmin("vendor-mocchau", "Gian h\u00e0ng Qu\u00e0 M\u1ed9c Ch\u00e2u", "vendor");
  await upsertAdmin("vendor-yenchau", "Gian h\u00e0ng Tr\u00e1i c\u00e2y Y\u00ean Ch\u00e2u", "vendor");

  const sonLa = await getDestination("S\u01a1n La");
  const mocChau = await getDestination("M\u1ed9c Ch\u00e2u");
  const yenChau = await getDestination("Y\u00ean Ch\u00e2u");

  const combo = await getCategory("Combo \u0111\u1eb7c s\u1ea3n", "combo-dac-san-demo", "Set s\u1ea3n ph\u1ea9m \u0111\u00e3 ph\u1ed1i s\u1eb5n theo nhu c\u1ea7u mua h\u00e0ng.");
  const spice = await getCategory("Gia v\u1ecb v\u00e0 \u0111\u1ed3 kh\u00f4", "gia-vi-do-kho-demo", "M\u1eafc kh\u00e9n, ch\u1ea9m ch\u00e9o, th\u1ecbt g\u00e1c b\u1ebfp v\u00e0 \u0111\u1ed3 kh\u00f4.");
  const gift = await getCategory("Qu\u00e0 bi\u1ebfu", "qua-bieu-demo", "H\u1ed9p qu\u00e0, gi\u1ecf qu\u00e0 v\u00e0 set doanh nghi\u1ec7p.");

  await upsertPackage({
    slug: "demo-combo-bua-com-gia-dinh",
    name: "Combo b\u1eefa c\u01a1m gia \u0111\u00ecnh",
    destinationId: sonLa.id,
    categoryId: combo.id,
    duration: "Giao 2 - 4 ng\u00e0y",
    priceText: "T\u1eeb 590.000\u0111",
    summary: "Th\u1ecbt g\u00e1c b\u1ebfp, ch\u1ea9m ch\u00e9o, rau r\u1eebng s\u1ea5y v\u00e0 tr\u00e0 Shan tuy\u1ebft.",
    description: "Set d\u1ec5 d\u00f9ng cho gia \u0111\u00ecnh, ph\u00f9 h\u1ee3p kh\u00e1ch mua th\u1eed l\u1ea7n \u0111\u1ea7u.",
    imageUrl: img.gift,
  });
  await upsertPackage({
    slug: "demo-gia-vi-mac-khen-cham-cheo",
    name: "B\u1ed9 gia v\u1ecb m\u1eafc kh\u00e9n ch\u1ea9m ch\u00e9o",
    destinationId: sonLa.id,
    categoryId: spice.id,
    duration: "Giao trong ng\u00e0y",
    priceText: "T\u1eeb 180.000\u0111",
    summary: "Gia v\u1ecb \u0111\u00f3ng h\u0169 d\u00f9ng ch\u1ea5m th\u1ecbt n\u01b0\u1edbng, rau lu\u1ed9c v\u00e0 tr\u00e1i c\u00e2y xanh.",
    description: "S\u1ea3n ph\u1ea9m ch\u1ee7 l\u1ef1c c\u1ee7a gian h\u00e0ng Gia v\u1ecb T\u00e2y B\u1eafc.",
    imageUrl: img.spice,
  });
  await upsertPackage({
    slug: "demo-set-qua-moc-chau-doanh-nghiep",
    name: "Set qu\u00e0 M\u1ed9c Ch\u00e2u doanh nghi\u1ec7p",
    destinationId: mocChau.id,
    categoryId: gift.id,
    duration: "\u0110\u1eb7t tr\u01b0\u1edbc 1 ng\u00e0y",
    priceText: "T\u1eeb 890.000\u0111",
    summary: "Tr\u00e0, m\u1eadn s\u1ea5y, m\u1eadt ong v\u00e0 h\u1ed9p qu\u00e0 in thi\u1ec7p theo y\u00eau c\u1ea7u.",
    description: "G\u00f3i demo d\u00e0nh cho kh\u00e1ch h\u00e0ng doanh nghi\u1ec7p v\u00e0 qu\u00e0 T\u1ebft.",
    imageUrl: img.tea,
  });
  await upsertPackage({
    slug: "demo-trai-cay-yen-chau-theo-mua",
    name: "Combo tr\u00e1i c\u00e2y Y\u00ean Ch\u00e2u theo m\u00f9a",
    destinationId: yenChau.id,
    categoryId: combo.id,
    duration: "Theo l\u1ecbch thu h\u00e1i",
    priceText: "T\u1eeb 320.000\u0111",
    summary: "Xo\u00e0i tr\u00f2n, m\u1eadn h\u1eadu ho\u1eb7c tr\u00e1i c\u00e2y s\u1ea5y t\u00f9y m\u00f9a.",
    description: "Ngu\u1ed3n h\u00e0ng n\u00f4ng s\u1ea3n theo m\u00f9a cho kh\u00e1ch c\u00e1 nh\u00e2n v\u00e0 \u0111\u1ea1i l\u00fd.",
    imageUrl: img.fruit,
  });
  await upsertPackage({
    slug: "demo-thit-gac-bep-cao-cap",
    name: "Th\u1ecbt g\u00e1c b\u1ebfp cao c\u1ea5p h\u00fat ch\u00e2n kh\u00f4ng",
    destinationId: sonLa.id,
    categoryId: spice.id,
    duration: "Giao 2 - 4 ng\u00e0y",
    priceText: "T\u1eeb 450.000\u0111",
    summary: "Th\u1ecbt tr\u00e2u g\u00e1c b\u1ebfp th\u00e1i s\u1eb5n, g\u1eedi k\u00e8m ch\u1ea9m ch\u00e9o.",
    description: "S\u1ea3n ph\u1ea9m ph\u00f9 h\u1ee3p l\u00e0m m\u1ed3i nh\u1eadu, qu\u00e0 bi\u1ebfu ho\u1eb7c b\u00e1n l\u1ebb.",
    imageUrl: img.smoked,
  });

  await upsertCustomer({ name: "Nguy\u1ec5n Mai Anh", email: "maianh@example.com", phone: "0901 111 222", totalBookings: 3, totalSpent: "2.180.000\u0111", notes: "Hay mua combo gia \u0111\u00ecnh v\u00e0 qu\u00e0 bi\u1ebfu." });
  await upsertCustomer({ name: "Tr\u1ea7n \u0110\u1ee9c Huy", email: "huy.tran@example.com", phone: "0902 222 333", totalBookings: 2, totalSpent: "4.450.000\u0111", notes: "Kh\u00e1ch doanh nghi\u1ec7p, hay \u0111\u1eb7t set qu\u00e0." });
  await upsertCustomer({ name: "L\u00ea Thu H\u00e0", email: "thuha@example.com", phone: "0903 333 444", totalBookings: 4, totalSpent: "3.260.000\u0111", notes: "Quan t\u00e2m tr\u00e1i c\u00e2y theo m\u00f9a." });

  const bookingRows = [
    ["Nguy\u1ec5n Mai Anh", "maianh@example.com", "0901 111 222", "Combo b\u1eefa c\u01a1m gia \u0111\u00ecnh", "1.180.000\u0111", "Ho\u00e0n t\u1ea5t", "Giao 2 set t\u1ea1i TP S\u01a1n La", 2],
    ["Tr\u1ea7n \u0110\u1ee9c Huy", "huy.tran@example.com", "0902 222 333", "Set qu\u00e0 M\u1ed9c Ch\u00e2u doanh nghi\u1ec7p", "3.560.000\u0111", "\u0110ang x\u1eed l\u00fd", "B\u00e1o gi\u00e1 4 h\u1ed9p qu\u00e0 c\u00f3 thi\u1ec7p", 1],
    ["L\u00ea Thu H\u00e0", "thuha@example.com", "0903 333 444", "Combo tr\u00e1i c\u00e2y Y\u00ean Ch\u00e2u theo m\u00f9a", "960.000\u0111", "Ch\u1edd x\u1eed l\u00fd", "T\u01b0 v\u1ea5n th\u1eddi \u0111i\u1ec3m nh\u1eadn h\u00e0ng", 0],
    ["Ph\u1ea1m Quang Minh", "minh@example.com", "0904 444 555", "B\u1ed9 gia v\u1ecb m\u1eafc kh\u00e9n ch\u1ea9m ch\u00e9o", "540.000\u0111", "Ho\u00e0n t\u1ea5t", "\u0110\u01a1n b\u00e1n l\u1ebb 3 set", 5],
    ["C\u00f4ng ty An Ph\u00fa", "contact@anphu.vn", "0905 555 666", "Th\u1ecbt g\u00e1c b\u1ebfp cao c\u1ea5p h\u00fat ch\u00e2n kh\u00f4ng", "2.250.000\u0111", "\u0110\u00e3 x\u00e1c nh\u1eadn", "Ch\u1edd kh\u00e1ch ch\u1ed1t ng\u00e0y nh\u1eadn", 3],
    ["Nh\u00e0 h\u00e0ng Hoa Ban", "hoaban@example.com", "0906 666 777", "Combo gia v\u1ecb ch\u1ea9m ch\u00e9o m\u1eafc kh\u00e9n cho nh\u00e0 h\u00e0ng", "4.800.000\u0111", "Ho\u00e0n t\u1ea5t", "Gian h\u00e0ng gia vi giao 24 h\u0169 ch\u1ea9m ch\u00e9o v\u00e0 m\u1eafc kh\u00e9n", 4],
    ["\u0110\u1ea1i l\u00fd T\u00e2y B\u1eafc Mart", "daily@example.com", "0907 777 888", "\u0110\u1ed3 kh\u00f4 th\u1ecbt g\u00e1c b\u1ebfp v\u00e0 m\u1eafc kh\u00e9n \u0111\u1ea1i l\u00fd", "3.200.000\u0111", "\u0110\u00e3 x\u00e1c nh\u1eadn", "\u0110\u01a1n gia vi v\u00e0 do kho cho \u0111\u1ea1i l\u00fd b\u00e1n l\u1ebb", 6],
    ["C\u00f4ng ty Green Office", "greenoffice@example.com", "0908 888 999", "Set qu\u00e0 M\u1ed9c Ch\u00e2u doanh nghi\u1ec7p 12 h\u1ed9p", "10.680.000\u0111", "Ho\u00e0n t\u1ea5t", "Moc Chau set qua doanh nghiep c\u00f3 thi\u1ec7p ch\u00fac m\u1eebng", 7],
    ["Minh Anh Group", "minhanhgroup@example.com", "0910 101 010", "Gi\u1ecf qu\u00e0 M\u1ed9c Ch\u00e2u tr\u00e0 v\u00e0 m\u1eadt ong", "6.300.000\u0111", "\u0110\u00e3 x\u00e1c nh\u1eadn", "Set qua Moc Chau cho \u0111\u1ed1i t\u00e1c, c\u1ea7n \u0111\u00f3ng g\u00f3i l\u1ecbch s\u1ef1", 9],
    ["C\u1eeda h\u00e0ng B\u1ebfp Nh\u00e0", "bepnha@example.com", "0911 111 222", "Tr\u00e1i c\u00e2y Y\u00ean Ch\u00e2u theo m\u00f9a cho c\u1eeda h\u00e0ng", "1.920.000\u0111", "Ho\u00e0n t\u1ea5t", "Yen Chau trai cay theo mua giao h\u00e0ng tu\u1ea7n", 8],
    ["Ch\u1ecb H\u01b0\u01a1ng", "huong@example.com", "0912 222 333", "Xo\u00e0i Y\u00ean Ch\u00e2u v\u00e0 m\u1eadn h\u1eadu \u0111\u1eb7t tr\u01b0\u1edbc", "2.400.000\u0111", "\u0110ang x\u1eed l\u00fd", "Yen Chau xoai man theo mua, ch\u1edd ch\u1ed1t l\u1ecbch thu h\u00e1i", 1],
  ] as const;

  for (const row of bookingRows) {
    await createBookingIfMissing({ customerName: row[0], email: row[1], phone: row[2], tourName: row[3], totalPrice: row[4], status: row[5], notes: row[6], daysAgo: row[7] });
  }

  console.log("Marketplace admin demo data seeded.");
  console.log("Demo accounts: admin, vendor-giavi, vendor-mocchau, vendor-yenchau");
  console.log(`Demo password for vendor accounts and newly created admin: ${demoPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
