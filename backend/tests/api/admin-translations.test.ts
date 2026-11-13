import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import prisma from "../../lib/prisma";
import { signToken } from "../../lib/auth";
import { cleanupTestData, jsonRequest, readJson, uniqueSlug } from "../helpers";
import { POST as createPackage, PUT as updatePackage } from "../../app/api/admin/packages/route";
import { POST as createPost } from "../../app/api/admin/posts/route";

// CR-003 / T-003.1: bản dịch EN/ZH không bắt buộc khi admin lưu combo / bài viết
const adminCookie = `admin_token=${signToken({ id: 1, email: "admin", fullName: "Admin Test", role: "admin" })}`;
const pkgSlug = uniqueSlug("tr");
let pkgId = 0;
const createdPostIds: number[] = [];
const createdCategoryIds: number[] = [];
const createdPackageIds: number[] = [];

function translationRows(entityType: string, entityId: number) {
  return prisma.contentTranslation.findMany({ where: { entityType, entityId }, orderBy: { locale: "asc" } });
}

before(async () => {
  const pkg = await prisma.package.create({ data: { slug: pkgSlug, name: "Combo chưa dịch", price: 100000, status: "Đang mở bán" } });
  pkgId = pkg.id;
});

after(async () => {
  const pkgIds = [pkgId, ...createdPackageIds].filter(Boolean);
  await prisma.contentTranslation.deleteMany({ where: { entityType: "package", entityId: { in: pkgIds } } });
  await prisma.contentTranslation.deleteMany({ where: { entityType: "post", entityId: { in: createdPostIds } } });
  if (createdPostIds.length) await prisma.post.deleteMany({ where: { id: { in: createdPostIds } } });
  if (createdCategoryIds.length) await prisma.category.deleteMany({ where: { id: { in: createdCategoryIds } } });
  await cleanupTestData();
});

test("PUT combo chỉ đổi giá, bản dịch để trống → lưu được, không tạo ContentTranslation", async () => {
  const res = await updatePackage(
    jsonRequest("/api/admin/packages", {
      method: "PUT",
      cookie: adminCookie,
      body: { id: pkgId, priceValue: 150000, translations: { en: { name: "", summary: "" }, "zh-CN": {} } },
    }),
  );
  assert.equal(res.status, 200, JSON.stringify(await readJson(res.clone())));
  const saved = await prisma.package.findUniqueOrThrow({ where: { id: pkgId } });
  assert.equal(saved.price, 150000);
  assert.equal((await translationRows("package", pkgId)).length, 0);
});

test("PUT combo với bản dịch EN điền một phần → lưu đúng trường đã điền, không tạo ZH", async () => {
  const res = await updatePackage(
    jsonRequest("/api/admin/packages", {
      method: "PUT",
      cookie: adminCookie,
      body: { id: pkgId, translations: { en: { name: "Untranslated combo", summary: "" }, "zh-CN": { name: "  " } } },
    }),
  );
  assert.equal(res.status, 200, JSON.stringify(await readJson(res.clone())));
  const rows = await translationRows("package", pkgId);
  assert.deepEqual(rows.map((row) => row.locale), ["en"]);
  assert.deepEqual(rows[0].fields, { name: "Untranslated combo" });
});

test("PUT combo bản dịch để trống không ghi đè bản dịch đã có", async () => {
  const res = await updatePackage(
    jsonRequest("/api/admin/packages", {
      method: "PUT",
      cookie: adminCookie,
      body: { id: pkgId, priceValue: 160000, translations: { en: {}, "zh-CN": {} } },
    }),
  );
  assert.equal(res.status, 200);
  const rows = await translationRows("package", pkgId);
  assert.deepEqual(rows.map((row) => [row.locale, row.fields]), [["en", { name: "Untranslated combo" }]]);
});

test("POST combo mới không có bản dịch → tạo được", async () => {
  const collection = await prisma.packageCollection.findFirst({ select: { id: true } });
  assert.ok(collection, "cần ít nhất một danh mục combo trong DB");
  const res = await createPackage(
    jsonRequest("/api/admin/packages", {
      cookie: adminCookie,
      body: { name: "Combo mới chưa dịch", slug: uniqueSlug("trnew"), priceValue: 90000, collectionIds: [collection.id] },
    }),
  );
  const body = await readJson(res);
  if (body?.package?.id) createdPackageIds.push(body.package.id);
  assert.equal(res.status, 200, JSON.stringify(body));
  assert.equal((await translationRows("package", body.package.id)).length, 0);
});

test("POST bài viết không có bản dịch → tạo được", async () => {
  const before = new Set((await prisma.category.findMany({ select: { id: true } })).map((c) => c.id));
  const res = await createPost(
    jsonRequest("/api/admin/posts", { cookie: adminCookie, body: { title: `Bài test chưa dịch ${Date.now()}`, summary: "Nội dung" } }),
  );
  const body = await readJson(res);
  if (body?.post?.id) createdPostIds.push(body.post.id);
  for (const c of await prisma.category.findMany({ select: { id: true } })) if (!before.has(c.id)) createdCategoryIds.push(c.id);
  assert.equal(res.status, 200, JSON.stringify(body));
  assert.equal((await translationRows("post", body.post.id)).length, 0);
});
