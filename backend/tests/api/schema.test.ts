import { after, test } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import prisma from "../../lib/prisma";
import { cleanupTestData, uniqueEmail } from "../helpers";

after(async () => {
  await cleanupTestData();
});

test("tạo Customer có tài khoản, Order kèm item, Inquiry", async () => {
  const customer = await prisma.customer.create({
    data: { name: "Test", email: uniqueEmail(), phone: "0912345678", passwordHash: "x" },
  });
  const order = await prisma.order.create({
    data: {
      code: "SLF-TEST-" + crypto.randomBytes(3).toString("hex"),
      customerId: customer.id,
      receiverName: "Test",
      phone: "0912345678",
      email: "",
      address: "Sơn La",
      subtotal: 0,
      packingFee: 30000,
      total: 30000,
      items: { create: [{ itemType: "package", itemId: 1, slug: "s", name: "n", unitPrice: null, quantity: 2 }] },
    },
  });
  const inquiry = await prisma.inquiry.create({
    data: { customerId: customer.id, requestType: "Tư vấn", contactName: "Test", contactPhone: "0912345678" },
  });

  const loaded = await prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: { items: true } });
  assert.equal(loaded.status, "pending");
  assert.equal(loaded.hasUnpricedItems, false);
  assert.equal(loaded.items.length, 1);
  assert.equal(inquiry.status, "new");
});
