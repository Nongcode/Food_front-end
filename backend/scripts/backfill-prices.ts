import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { parsePriceText } from "../lib/price";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type Row = { id: number; slug: string; priceText: string | null };

async function backfill(label: string, rows: Row[], update: (id: number, price: number, unit: string | null) => Promise<unknown>) {
  const filled: string[] = [];
  const unreadable: string[] = [];
  for (const row of rows) {
    const parsed = parsePriceText(row.priceText);
    if (!parsed) {
      unreadable.push(`  #${row.id} ${row.slug}: ${JSON.stringify(row.priceText)}`);
      continue;
    }
    await update(row.id, parsed.price, parsed.unit);
    filled.push(`  #${row.id} ${row.slug}: ${parsed.price}${parsed.unit ? "/" + parsed.unit : ""}`);
  }
  console.log(`${label} — đã điền: ${filled.length}`);
  filled.forEach((line) => console.log(line));
  console.log(`${label} — không đọc được: ${unreadable.length}`);
  unreadable.forEach((line) => console.log(line));
}

async function main() {
  // Chỉ xử lý dòng chưa có price, không ghi đè giá admin đã nhập
  const packages = await prisma.package.findMany({ where: { price: null }, select: { id: true, slug: true, priceText: true } });
  await backfill("Combo", packages, (id, price, priceUnit) => prisma.package.update({ where: { id }, data: { price, priceUnit } }));

  const specialties = await prisma.localSpecialty.findMany({ where: { price: null }, select: { id: true, slug: true, priceText: true } });
  await backfill("Đặc sản", specialties, (id, price, priceUnit) => prisma.localSpecialty.update({ where: { id }, data: { price, priceUnit } }));
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
