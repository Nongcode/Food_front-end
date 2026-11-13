import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { normalizeStatus } from "@/lib/status";
import { cleanText, normalizePhone } from "@/lib/customerAuth";
import { VISIBLE_STATUSES } from "@/app/api/public/_data";

export type OrderItemType = "package" | "specialty";
export type OrderInputItem = { itemType: OrderItemType; slug: string; quantity: number };

const MAX_ORDER_LINES = 30;
const MAX_QUANTITY = 99;

// Lỗi do dữ liệu khách gửi lên; route trả 400
export class OrderInputError extends Error {}

// Gộp các dòng cùng loại + slug; số lượng sau khi gộp phải nằm trong 1–99
export function mergeOrderItems(raw: unknown): OrderInputItem[] {
  if (!Array.isArray(raw) || raw.length === 0) throw new OrderInputError("Giỏ hàng đang trống.");
  if (raw.length > MAX_ORDER_LINES) throw new OrderInputError(`Mỗi đơn tối đa ${MAX_ORDER_LINES} sản phẩm.`);

  const merged = new Map<string, OrderInputItem>();
  for (const entry of raw) {
    const item = (entry ?? {}) as Record<string, unknown>;
    const itemType = item.itemType;
    const slug = typeof item.slug === "string" ? item.slug.trim() : "";
    const quantity = item.quantity;
    if (itemType !== "package" && itemType !== "specialty") throw new OrderInputError("Loại sản phẩm không hợp lệ.");
    if (!slug) throw new OrderInputError("Thiếu mã sản phẩm.");
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      throw new OrderInputError(`Số lượng phải từ 1 đến ${MAX_QUANTITY}.`);
    }

    const key = `${itemType}:${slug}`;
    const existing = merged.get(key);
    if (existing) existing.quantity += quantity;
    else merged.set(key, { itemType, slug, quantity });
  }

  const items = [...merged.values()];
  if (items.some((item) => item.quantity > MAX_QUANTITY)) throw new OrderInputError(`Số lượng phải từ 1 đến ${MAX_QUANTITY}.`);
  return items;
}

// Món không có giá không tính vào tạm tính, đơn được đánh dấu hasUnpricedItems
export function computeTotals(lines: { unitPrice: number | null; quantity: number }[], packingFee: number) {
  const subtotal = lines.reduce((sum, line) => sum + (line.unitPrice ?? 0) * line.quantity, 0);
  const fee = lines.length > 0 ? packingFee : 0;
  return {
    subtotal,
    packingFee: fee,
    total: subtotal + fee,
    hasUnpricedItems: lines.some((line) => line.unitPrice === null),
  };
}

// SLF-YYYYMMDD-NNNN, ngày theo giờ Việt Nam (UTC+7)
export function formatOrderCode(date: Date, seq: number): string {
  const vn = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const ymd = vn.toISOString().slice(0, 10).replace(/-/g, "");
  return `SLF-${ymd}-${String(seq).padStart(4, "0")}`;
}

export function isOrderablePackage(status: string): boolean {
  const normalized = normalizeStatus(status);
  return normalized.includes("dang mo") || normalized.includes("sap kin") || normalized.includes("sap het");
}

export const DEFAULT_PACKING_FEE = 30000;
const PACKING_FEE_KEY = "order_packing_fee";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_RETRIES = 3;

export type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

export async function getPackingFee(): Promise<number> {
  const setting = await prisma.siteSetting.findUnique({ where: { settingKey: PACKING_FEE_KEY } });
  const value = Number(setting?.settingValue);
  return setting?.settingValue && Number.isFinite(value) && value >= 0 ? value : DEFAULT_PACKING_FEE;
}

// Thông tin người nhận dùng chung cho tạo đơn và sửa đơn; partial = chỉ kiểm tra trường có gửi
export function readReceiver(body: Record<string, unknown>, partial = false) {
  const data: { receiverName?: string; phone?: string; email?: string; address?: string; note?: string | null } = {};
  if (!partial || body.receiverName !== undefined) {
    const receiverName = cleanText(body.receiverName, 120);
    if (!receiverName) throw new OrderInputError("Vui lòng nhập tên người nhận.");
    data.receiverName = receiverName;
  }
  if (!partial || body.phone !== undefined) {
    const phone = normalizePhone(body.phone);
    if (!phone) throw new OrderInputError("Số điện thoại không hợp lệ.");
    data.phone = phone;
  }
  if (!partial || body.address !== undefined) {
    const address = cleanText(body.address, 500);
    if (!address) throw new OrderInputError("Vui lòng nhập địa chỉ nhận hàng.");
    data.address = address;
  }
  if (body.email !== undefined && body.email !== null && body.email !== "") {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!EMAIL_PATTERN.test(email)) throw new OrderInputError("Email không hợp lệ.");
    data.email = email;
  } else if (!partial || body.email !== undefined) {
    data.email = "";
  }
  if (!partial || body.note !== undefined) data.note = cleanText(body.note, 1000);
  return data;
}

type ProductLine = { itemType: OrderItemType; itemId: number; slug: string; name: string; image: string | null; unitPrice: number | null; unit: string | null; quantity: number };

type ProductRecord = { id: number; slug: string; name: string; status: string; imageUrl: string | null; price: number | null; priceUnit: string | null };

// Tra sản phẩm theo slug (giá luôn lấy từ DB); orderable = còn bán
async function findProducts<T extends { itemType: OrderItemType; slug: string }>(items: T[]) {
  const packageSlugs = items.filter((item) => item.itemType === "package").map((item) => item.slug);
  const specialtySlugs = items.filter((item) => item.itemType === "specialty").map((item) => item.slug);
  const [packages, specialties] = await Promise.all([
    packageSlugs.length ? prisma.package.findMany({ where: { slug: { in: packageSlugs } } }) : [],
    specialtySlugs.length ? prisma.localSpecialty.findMany({ where: { slug: { in: specialtySlugs } } }) : [],
  ]);
  return items.map((item) => {
    const product: ProductRecord | undefined =
      item.itemType === "package"
        ? packages.find((pkg) => pkg.slug === item.slug)
        : specialties.find((specialty) => specialty.slug === item.slug);
    const orderable = Boolean(product && (item.itemType === "package" ? isOrderablePackage(product.status) : VISIBLE_STATUSES.includes(product.status)));
    return { item, product, orderable };
  });
}

export type CartQuote = { itemType: OrderItemType; slug: string; name: string | null; unitPrice: number | null; unit: string | null; available: boolean };

// Giá hiện tại cho các món trong giỏ (giỏ FE lưu ở localStorage có thể cũ hoặc bị sửa)
export async function quoteCartItems(raw: unknown): Promise<CartQuote[]> {
  if (!Array.isArray(raw) || raw.length === 0) throw new OrderInputError("Giỏ hàng đang trống.");
  if (raw.length > MAX_ORDER_LINES) throw new OrderInputError(`Mỗi đơn tối đa ${MAX_ORDER_LINES} sản phẩm.`);
  const items = raw.map((entry) => {
    const item = (entry ?? {}) as Record<string, unknown>;
    const slug = typeof item.slug === "string" ? item.slug.trim() : "";
    if (item.itemType !== "package" && item.itemType !== "specialty") throw new OrderInputError("Loại sản phẩm không hợp lệ.");
    if (!slug) throw new OrderInputError("Thiếu mã sản phẩm.");
    return { itemType: item.itemType as OrderItemType, slug };
  });
  const found = await findProducts(items);
  return found.map(({ item, product, orderable }) => ({
    itemType: item.itemType,
    slug: item.slug,
    name: orderable && product ? product.name : null,
    unitPrice: orderable && product ? product.price ?? null : null,
    unit: orderable && product ? product.priceUnit ?? null : null,
    available: orderable,
  }));
}

async function resolveLines(items: OrderInputItem[]): Promise<ProductLine[]> {
  const found = await findProducts(items);
  return found.map(({ item, product, orderable }) => {
    if (!product || !orderable) throw new OrderInputError(`Sản phẩm không còn bán: ${product?.name || item.slug}`);
    return {
      itemType: item.itemType,
      itemId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.imageUrl ?? null,
      unitPrice: product.price ?? null,
      unit: product.priceUnit ?? null,
      quantity: item.quantity,
    };
  });
}

async function nextOrderCode(tx: Prisma.TransactionClient, now: Date): Promise<string> {
  const prefix = formatOrderCode(now, 0).slice(0, -4);
  const last = await tx.order.findFirst({ where: { code: { startsWith: prefix } }, orderBy: { code: "desc" }, select: { code: true } });
  const lastSeq = last ? Number(last.code.slice(prefix.length)) || 0 : 0;
  return formatOrderCode(now, lastSeq + 1);
}

export async function createOrder(customerId: number, body: unknown): Promise<OrderWithItems> {
  const input = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const receiver = readReceiver(input);
  const lines = await resolveLines(mergeOrderItems(input.items));
  const totals = computeTotals(lines, await getPackingFee());

  for (let attempt = 1; ; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const code = await nextOrderCode(tx, new Date());
        return tx.order.create({
          data: {
            ...receiver,
            receiverName: receiver.receiverName!,
            phone: receiver.phone!,
            address: receiver.address!,
            code,
            customerId,
            ...totals,
            items: { create: lines },
          },
          include: { items: true },
        });
      });
    } catch (error) {
      const duplicateCode = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!duplicateCode || attempt >= CODE_RETRIES) throw error;
    }
  }
}

// Bỏ trường nội bộ (ghi chú admin) trước khi trả cho khách
function omitAdminNote<T extends { adminNote?: string | null }>(record: T): Omit<T, "adminNote"> {
  const copy: Partial<T> = { ...record };
  delete copy.adminNote;
  return copy as Omit<T, "adminNote">;
}

export const toCustomerOrder = omitAdminNote;
export const toCustomerInquiry = omitAdminNote;
