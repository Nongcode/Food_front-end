# Tài khoản khách, đơn hàng, yêu cầu tư vấn — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay tài khoản/đơn hàng demo trong localStorage bằng tài khoản khách, đơn hàng (`Order`) và yêu cầu tư vấn (`Inquiry`) thật ở BE, kèm trang quản lý trong admin.

**Architecture:** BE (Next 16 + Prisma 7 + Postgres, repo `D:\Duc-TPE\sonla-food-backend`) thêm model, lib nghiệp vụ thuần (`lib/orderStatus.ts`, `lib/price.ts`, `lib/orders.ts`, `lib/customerAuth.ts`) và route handler mỏng. FE (repo này) gọi API qua rewrite `/api/*` cùng domain, cookie `customer_token` httpOnly. Admin là trang client trong BE, gọi API admin.

**Tech Stack:** Next.js 16.2.6 (đọc `node_modules/next/dist/docs/` trước khi viết route/page), React 19, Prisma 7 (`@prisma/adapter-pg`), `tsx` + `node:test` (Node 22, không cài thêm thư viện), Playwright MCP.

**Spec:** `docs/features/tich-hop/dong-bo-fe-be/mo-hinh-du-lieu/design.md` (gọi tắt "spec §x").

## Global Constraints

- Phản hồi API: `{ success: true, data }` hoặc `{ success: false, error }`, thông báo tiếng Việt. Mã: 400 dữ liệu sai · 401 chưa đăng nhập · 404 không tìm thấy / không phải của mình · 409 sai trạng thái / email đã đăng ký · 410 `/api/bookings`.
- Mã trạng thái đơn lưu trong DB: `pending`, `confirmed`, `shipping`, `delivered`, `cancelled`; yêu cầu tư vấn: `new`, `contacted`, `closed`. Nhãn tiếng Việt chỉ lấy từ `lib/orderStatus.ts` (spec §3.5), nội dung giống hệt nhau ở hai repo.
- Tiền là `Int` VND. BE luôn tự tính giá, bỏ qua giá FE gửi lên.
- Cookie `customer_token`: httpOnly, `SameSite=Lax`, `path=/`, `maxAge` 30 ngày, `secure` khi `NODE_ENV === "production"`. Khoá HMAC `JWT_SECRET + ":customer"`, `aud: "customer"`; dùng chung quy tắc fail-closed của `getJwtSecret` (thiếu `JWT_SECRET` ở production → throw).
- Đơn: 1–30 dòng, `quantity` nguyên 1–99, gộp dòng trùng `itemType + slug`. SĐT 9–11 chữ số (bỏ khoảng trắng, dấu chấm). Mật khẩu ≥ 6 ký tự.
- Mã đơn `SLF-YYYYMMDD-NNNN`, ngày theo giờ Việt Nam (UTC+7).
- Phí đóng gói: `SiteSetting` key `order_packing_fee`, mặc định `30000`; áp dụng khi đơn có ≥ 1 dòng.
- Email luôn `trim().toLowerCase()` trước khi lưu và tìm; tìm khách cũ bằng `mode: "insensitive"` (dữ liệu cũ có thể viết hoa).
- Không thêm dependency. Không tạo file trong `docs/superpowers/`.
- BE chưa có git: Task 1 sao lưu và (nếu người dùng đồng ý) `git init`. Bước "Commit" của BE chỉ chạy khi BE đã có git; ngược lại bỏ qua.
- Sau mỗi task: cập nhật `status.md`, `design.md` (nhật ký sửa đổi), `index.html` của folder này.

## Review Focus

1. **Đường dẫn có tiền tố ngôn ngữ** (`/en/gio-hang`): `?next=` phải giữ nguyên tiền tố, và chỉ nhận đường dẫn bắt đầu bằng `/` nhưng không phải `//` → test ở Task 8.
2. **Giỏ hàng cũ trong localStorage** (món không có `priceValue`, slug đã bị xoá/ẩn): BE trả 400 kèm tên món lỗi; FE hiện lỗi và **giữ nguyên giỏ** → test ở Task 5 (BE) và Task 10 (Playwright).
3. **Email khác hoa/thường hoặc có khoảng trắng** (`" An@Mail.com "`) khi đăng ký, đăng nhập và kích hoạt khách cũ → test ở Task 4.
4. **Phiên hết hạn giữa chừng** (xoá cookie rồi bấm "Gửi xác nhận"): 401 → chuyển `/dang-nhap?next=…`, giỏ còn nguyên → test ở Task 10.
5. **Bấm gửi hai lần / hai đơn cùng lúc**: nút bị khoá khi đang gửi; mã đơn trùng thì BE thử lại → test ở Task 5 (hai `POST` song song ra hai mã khác nhau).

---

## Giai đoạn A — mo-hinh-du-lieu (BE)

### Task 1: Sao lưu, khung test và `lib/orderStatus.ts`

**Files:**
- Create: BE `tests/helpers.ts`, BE `tests/unit/orderStatus.test.ts`, BE `lib/orderStatus.ts`
- Modify: BE `package.json` (scripts)

**Interfaces:**
- Produces:
  - `lib/orderStatus.ts`: đúng nội dung spec §3.5, thêm `INQUIRY_STATUSES = ["new","contacted","closed"] as const`, `type InquiryStatus`, `isOrderStatus(v: unknown): v is OrderStatus`, `canTransition(from: OrderStatus, to: OrderStatus): boolean`.
  - `tests/helpers.ts`: `import "dotenv/config"` ở đầu; `jsonRequest(url: string, init?: { method?: string; body?: unknown; cookie?: string }): NextRequest`; `readJson(res: Response): Promise<any>`; `cookieFrom(res: NextResponse, name: string): string` (trả `"name=value"` để gắn header `cookie`); `uniqueEmail(): string` → `test+<random>@sonlafood.local`; `cleanupTestData(): Promise<void>` xoá theo thứ tự `OrderItem`/`Order`/`Inquiry` của khách có email kết thúc `@sonlafood.local`, rồi các khách đó, rồi `Package`/`LocalSpecialty` có slug bắt đầu `test-` (các bảng chưa tồn tại trước Task 2 thì bỏ qua).
  - Scripts: `"test:unit": "tsx --test tests/unit/*.test.ts"`, `"test:api": "tsx --test --test-concurrency=1 tests/api/*.test.ts"`.

- [ ] **Step 1: Sao lưu BE**

```bash
cd /d/Duc-TPE && tar --exclude=node_modules --exclude=.next -czf _backup/sonla-food-backend-$(date +%Y%m%d-%H%M).tgz sonla-food-backend
```
Nếu người dùng đã đồng ý: `cd sonla-food-backend && git init && git add -A && git commit -m "chore: snapshot trước giai đoạn tài khoản/đơn hàng"` (kiểm tra `.gitignore` có `node_modules`, `.next`, `.env*`).

- [ ] **Step 2: Viết test thất bại** `tests/unit/orderStatus.test.ts`

```ts
test("nhãn tiếng Việt", () => { assert.equal(ORDER_STATUS_LABELS.pending, "Chờ xác nhận"); assert.equal(ORDER_STATUS_LABELS.cancelled, "Đã huỷ"); });
test("chuyển trạng thái hợp lệ", () => {
  assert.ok(canTransition("pending", "confirmed")); assert.ok(canTransition("shipping", "cancelled"));
  assert.ok(!canTransition("pending", "shipping")); assert.ok(!canTransition("delivered", "cancelled")); assert.ok(!canTransition("cancelled", "pending"));
});
test("isOrderStatus", () => { assert.ok(isOrderStatus("shipping")); assert.ok(!isOrderStatus("Đang giao")); });
```

- [ ] **Step 3:** `npm run test:unit` → FAIL (module không tồn tại).
- [ ] **Step 4:** Viết `lib/orderStatus.ts` và `tests/helpers.ts`.
- [ ] **Step 5:** `npm run test:unit` → PASS. `npx tsc --noEmit` → không lỗi ở file nguồn.
- [ ] **Step 6: Commit (BE)** `feat: thêm bộ trạng thái đơn và khung test`

### Task 2: Schema Prisma và áp dụng DB

**Files:**
- Modify: BE `prisma/schema.prisma` (`Customer` L320-L333, `Package` L106-L133, `LocalSpecialty` L349-L375; thêm `Order`, `OrderItem`, `Inquiry`)
- Test: BE `tests/api/schema.test.ts`

**Interfaces:**
- Produces: Prisma models đúng spec §3.1–3.4, §3.6, cộng thêm:
  - `Inquiry.contactName String`, `contactPhone String`, `contactEmail String?` (spec §3.4).
  - `Order.customer` / `Inquiry.customer` relation; `OrderItem.order` `onDelete: Cascade`.
  - `Package.price Int?`, `Package.priceUnit String? @map("price_unit")`; tương tự `LocalSpecialty`.
  - Tên bảng/cột snake_case bằng `@map` như các model hiện có.

- [ ] **Step 1: Viết test thất bại** `tests/api/schema.test.ts`: tạo `Customer` (email `uniqueEmail()`, `passwordHash: "x"`), `Order` (`code: "SLF-TEST-" + random`, các trường bắt buộc, `items: { create: [{ itemType: "package", itemId: 1, slug: "s", name: "n", unitPrice: null, quantity: 2 }] }`), `Inquiry`; đọc lại với `include: { items: true }`; assert `order.status === "pending"`, `order.hasUnpricedItems === false`, `inquiry.status === "new"`, `items.length === 1`. `after(cleanupTestData)`.
- [ ] **Step 2:** `npx tsx --test tests/api/schema.test.ts` → FAIL (type/model không tồn tại).
- [ ] **Step 3:** Sửa schema.
- [ ] **Step 4:** `npx prisma validate` → "The schema ... is valid". Rồi `npm run db:deploy` (= `prisma db push`). **Dừng lại nếu Prisma cảnh báo mất dữ liệu** — mọi thay đổi phải là thêm. Rồi `npm run db:generate`. Khởi động lại dev server BE (client Prisma được cache trong `global`).
- [ ] **Step 5:** `npx tsx --test tests/api/schema.test.ts` → PASS.
- [ ] **Step 6: Commit (BE)** `feat(db): thêm Order, OrderItem, Inquiry, giá dạng số`

### Task 3: Giá dạng số — parser, backfill, payload public

**Files:**
- Create: BE `lib/price.ts`, BE `scripts/backfill-prices.ts`, BE `tests/unit/price.test.ts`
- Modify: BE `lib/packages.ts` (`fromDbPackage`, quanh L131-L144), BE `app/api/public/_data.ts` (`getSpecialtiesPayload` L113-L130, `getSpecialtyDetailPayload` L132+)
- Modify: BE `package.json` → `"db:backfill-prices": "tsx scripts/backfill-prices.ts"`

**Interfaces:**
- Produces:
  - `parsePriceText(text: string | null | undefined): { price: number; unit: string | null } | null`
  - Payload public combo và đặc sản có thêm `priceValue: number | null`, `priceUnit: string | null`. **Không đổi** trường `price` (chuỗi) và `priceText` hiện có.

- [ ] **Step 1: Viết test thất bại** `tests/unit/price.test.ts`

```ts
const cases: [string | null, ReturnType<typeof parsePriceText>][] = [
  ["Từ 650.000đ/kg", { price: 650000, unit: "kg" }],
  ["45.000đ - 60.000đ/chục", { price: 45000, unit: "chục" }],
  ["Từ 1.250.000đ", { price: 1250000, unit: null }],
  ["350,000 VND / hộp", { price: 350000, unit: "hộp" }],
  ["Liên hệ", null], ["", null], [null, null], ["50k", null], ["Giá 500đ", null],
];
for (const [input, expected] of cases) test(`parse ${input}`, () => assert.deepEqual(parsePriceText(input), expected));
```

- [ ] **Step 2:** `npm run test:unit` → FAIL.
- [ ] **Step 3:** Viết `parsePriceText`: số đầu tiên khớp `/(\d{1,3}(?:[.,]\d{3})+|\d{4,})/`, bỏ dấu phân cách; `< 1000` → `null`; `unit` = phần sau dấu `/` cuối cùng, `trim()`, rỗng → `null`.
- [ ] **Step 4:** `npm run test:unit` → PASS.
- [ ] **Step 5:** Viết `scripts/backfill-prices.ts` (khởi tạo Prisma như `scripts/seed-marketplace-demo.ts` L1-L10): với mỗi `Package` và `LocalSpecialty` có `price = null`, đọc `priceText` → cập nhật `price`, `priceUnit`; in bảng "đã điền" và "không đọc được" (id, slug, priceText). Không ghi đè dòng đã có `price`.
- [ ] **Step 6:** `npm run db:backfill-prices` → in danh sách; chạy lần hai → "đã điền: 0".
- [ ] **Step 7:** Thêm `priceValue`, `priceUnit` vào payload. Kiểm tra: `curl -s localhost:3001/api/public/packages | grep -o '"priceValue":[0-9a-z]*' | head -3` → có số.
- [ ] **Step 8: Commit (BE)** `feat: giá dạng số và backfill từ priceText`

## Giai đoạn B — api-backend (BE)

### Task 4: Xác thực khách hàng

**Files:**
- Create: BE `lib/customerAuth.ts`, BE `app/api/auth/register/route.ts`, `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`, `app/api/auth/me/route.ts`
- Modify: BE `lib/auth.ts` → `export` hàm `getJwtSecret` (hiện là hàm nội bộ L10)
- Test: BE `tests/api/auth.test.ts`

**Interfaces:**
- Consumes: `hashPassword`, `verifyPassword`, `getJwtSecret` từ `lib/auth.ts`.
- Produces (`lib/customerAuth.ts`):
  - `CUSTOMER_COOKIE = "customer_token"`
  - `signCustomerToken(customerId: number): string`
  - `verifyCustomerToken(token: string): { sub: number } | null`
  - `getCustomerSession(request: NextRequest): Promise<Customer | null>` (đọc cookie → token → `prisma.customer.findUnique`; `passwordHash` null → `null`)
  - `setCustomerCookie(res: NextResponse, token: string): void`, `clearCustomerCookie(res: NextResponse): void`
  - `toPublicCustomer(c: Customer): { id; name; email; phone; address; birthday }` (không bao giờ có `passwordHash`)
  - `normalizeEmail(v: unknown): string`, `normalizePhone(v: unknown): string | null` (9–11 chữ số sau khi bỏ khoảng trắng/dấu chấm/gạch, ngược lại `null`)

- [ ] **Step 1: Viết test thất bại** `tests/api/auth.test.ts` (gọi trực tiếp `POST`/`GET`/`PATCH` export từ route, qua `jsonRequest`):
  - `register` hợp lệ → 201, có cookie `customer_token`, `data.email` đã chuẩn hoá từ `" An+X@SonLaFood.Local "`.
  - `register` lại cùng email (khác hoa/thường) → 409.
  - Khách cũ tạo thẳng bằng Prisma (`email: "Old+<rand>@sonlafood.local"`, `passwordHash: null`) → `register` với email viết thường → 201, cùng `id` (kích hoạt), tên/SĐT được cập nhật.
  - `register` mật khẩu 5 ký tự → 400; SĐT `"12345"` → 400.
  - `login` sai mật khẩu và email không tồn tại → cùng 401, cùng `error`.
  - `login` đúng → 200, `lastLoginAt` khác null.
  - `GET /me` không cookie → 401; có cookie → 200, không có khoá `passwordHash`.
  - `PATCH /me` `{ name: "Mới", email: "khac@x.com" }` → 200, tên đổi, email **không** đổi.
  - **Tách token:** gắn giá trị `customer_token` vào cookie `admin_token` rồi gọi `GET` của `app/api/admin/me/route.ts` → 401.
  - `logout` → cookie `customer_token` bị xoá (`maxAge` 0).
- [ ] **Step 2:** `npx tsx --test tests/api/auth.test.ts` → FAIL.
- [ ] **Step 3:** Viết `lib/customerAuth.ts` (định dạng token như `signToken`/`verifyToken` trong `lib/auth.ts`, khoá `getJwtSecret() + ":customer"`, `aud: "customer"`, hết hạn 30 ngày) và 4 route. Tìm khách theo email bằng `findFirst({ where: { email: { equals, mode: "insensitive" } } })`.
- [ ] **Step 4:** Test → PASS. `npx tsc --noEmit` sạch.
- [ ] **Step 5: Commit (BE)** `feat(api): đăng ký, đăng nhập khách hàng`

### Task 5: Đơn hàng phía khách

**Files:**
- Create: BE `lib/orders.ts`, BE `app/api/orders/route.ts` (GET, POST), BE `app/api/orders/[code]/route.ts` (PATCH), BE `app/api/public/order-settings/route.ts` (GET)
- Test: BE `tests/unit/orders.test.ts`, BE `tests/api/orders.test.ts`

**Interfaces:**
- Consumes: `getCustomerSession`, `normalizePhone` (Task 4); `canTransition` (Task 1); `VISIBLE_STATUSES` (`app/api/public/_data.ts`); `normalizeStatus` (`lib/status.ts`).
- Produces (`lib/orders.ts`):
  - `type OrderInputItem = { itemType: "package" | "specialty"; slug: string; quantity: number }`
  - `mergeOrderItems(raw: unknown): OrderInputItem[]` — throw `OrderInputError(message)` khi sai (không phải mảng, 0 hoặc > 30 dòng, `quantity` không nguyên/ngoài 1–99 sau khi gộp, `itemType` lạ).
  - `computeTotals(lines: { unitPrice: number | null; quantity: number }[], packingFee: number): { subtotal: number; packingFee: number; total: number; hasUnpricedItems: boolean }`
  - `formatOrderCode(date: Date, seq: number): string` — ngày theo UTC+7, `seq` đệm 4 chữ số.
  - `isOrderablePackage(status: string): boolean` — `normalizeStatus(status)` chứa `"dang mo"` hoặc `"sap kin"` hoặc `"sap het"`; đặc sản: `VISIBLE_STATUSES.includes(status)`.
  - `getPackingFee(): Promise<number>` — đọc `order_packing_fee`, không có/không phải số → `30000`.
  - `createOrder(customerId: number, body: unknown): Promise<OrderWithItems>` — validate người nhận, tra sản phẩm theo slug, sản phẩm thiếu/không bán → `OrderInputError("Sản phẩm không còn bán: <tên hoặc slug>")`; tạo trong `prisma.$transaction`; mã = số đơn trong ngày + 1, gặp lỗi unique `P2002` thì thử lại tối đa 3 lần.
  - `class OrderInputError extends Error` (route đổi thành 400).

- [ ] **Step 1: Viết test đơn vị thất bại** `tests/unit/orders.test.ts`:
  - `mergeOrderItems([{package,a,2},{package,a,3},{specialty,a,1}])` → 2 dòng, `a` package có `quantity` 5.
  - `mergeOrderItems` với 31 dòng / `quantity` 0 / 100 / 1.5 / gộp thành 100 → throw `OrderInputError`.
  - `computeTotals([{100000,2},{null,1}], 30000)` → `{ subtotal: 200000, packingFee: 30000, total: 230000, hasUnpricedItems: true }`; `computeTotals([], 30000).packingFee === 0`.
  - `formatOrderCode(new Date("2026-11-11T18:30:00Z"), 42)` → `"SLF-20261112-0042"` (đã sang ngày mới giờ VN).
  - `isOrderablePackage("Đang mở bán")` true, `"Sắp kín chỗ"` true, `"Đã hết chỗ"` false, `"Tạm ngưng"` false.
- [ ] **Step 2:** `npm run test:unit` → FAIL.
- [ ] **Step 3:** Viết các hàm thuần trong `lib/orders.ts`. `npm run test:unit` → PASS.
- [ ] **Step 4: Viết test API thất bại** `tests/api/orders.test.ts` (`before`: tạo khách đăng nhập qua `register`, package `test-pkg-<rand>` `price: 100000`, `status: "Đang mở bán"`; đặc sản `test-sp-<rand>` `price: null`, `status: "Hiển thị"`; package ẩn `test-closed-<rand>` `status: "Đã đóng"`):
  - `POST /api/orders` không cookie → 401.
  - `POST` 2× package + 1× đặc sản, gửi kèm `unitPrice: 1` → 201; `subtotal 200000`, `total = 200000 + packingFee`, `hasUnpricedItems true`, `code` khớp `/^SLF-\d{8}-\d{4}$/`, item chụp `name`, `unitPrice`.
  - `POST` có slug ẩn hoặc không tồn tại → 400, `error` chứa slug/tên.
  - Hai `POST` song song (`Promise.all`) → hai `code` khác nhau.
  - `GET /api/orders` → chỉ đơn của khách này, mới nhất trước.
  - Khách B `PATCH /api/orders/<code của A>` → 404.
  - `PATCH` `{ address: "Mới" }` khi `pending` → 200; `{ action: "cancel" }` thiếu `reason` → 400; có `reason` → 200, `status "cancelled"`, `cancelledBy "customer"`; `PATCH` lần nữa → 409.
  - `GET /api/public/order-settings` → `{ packingFee: 30000 }` khi chưa có setting.
- [ ] **Step 5:** `npx tsx --test tests/api/orders.test.ts` → FAIL.
- [ ] **Step 6:** Viết `createOrder`, `getPackingFee` và 3 route.
- [ ] **Step 7:** Test → PASS; `npm run test:unit` vẫn PASS.
- [ ] **Step 8: Commit (BE)** `feat(api): đặt đơn, lịch sử, huỷ đơn của khách`

### Task 6: Yêu cầu tư vấn phía khách

**Files:**
- Create: BE `app/api/inquiries/route.ts` (GET, POST)
- Test: BE `tests/api/inquiries.test.ts`

**Interfaces:**
- Consumes: `getCustomerSession`, `normalizePhone`, `normalizeEmail` (Task 4).
- Produces: `POST /api/inquiries` nhận đúng các trường spec §5.1; `requestType`, `contactName`, `contactPhone` bắt buộc; chuỗi dài hơn 2000 ký tự → 400.

- [ ] **Step 1: Viết test thất bại**: không cookie → 401; thiếu `requestType` → 400; hợp lệ → 201, `status "new"`, `customerId` đúng; `GET` chỉ trả yêu cầu của khách đó.
- [ ] **Step 2:** Chạy → FAIL. **Step 3:** Viết route. **Step 4:** Chạy → PASS.
- [ ] **Step 5: Commit (BE)** `feat(api): yêu cầu tư vấn`

### Task 7: API admin

**Files:**
- Create: BE `app/api/admin/orders/route.ts` (GET), `app/api/admin/orders/[id]/route.ts` (GET, PATCH), `app/api/admin/inquiries/route.ts` (GET), `app/api/admin/inquiries/[id]/route.ts` (PATCH)
- Modify: BE `app/api/admin/customers/route.ts` L20-L33 (thêm `hasAccount`, `orderCount` qua `_count: { select: { orders: true } }`; giữ `totalBookings`/`totalSpent` trong JSON để admin cũ không vỡ cho tới Task 13)
- Modify: BE `app/api/admin/packages/route.ts` L50, L156, L231 và `app/api/admin/local-specialties/route.ts` L49, L99, L157: nhận/trả `priceValue` (số nguyên ≥ 0 hoặc `null`) → cột `price`, `priceUnit` → `priceUnit`
- Modify: BE `app/api/admin/settings/route.ts`: chấp nhận key `order_packing_fee` (chuỗi số nguyên ≥ 0, ngược lại 400)
- Test: BE `tests/api/admin-orders.test.ts`

**Interfaces:**
- Consumes: `verifyAdminSession` (`lib/adminAuth.ts`), `signToken` (`lib/auth.ts`, để tạo cookie admin trong test), `canTransition`, `isOrderStatus`, `INQUIRY_STATUSES`.
- Produces:
  - `GET /api/admin/orders?status=&q=&page=` → `{ items: OrderWithItems[], total, page, pageSize: 20 }`; `q` tìm `contains`, `insensitive` trên `code`, `receiverName`, `phone`.
  - `PATCH /api/admin/orders/:id` `{ status?, cancelReason?, adminNote? }`.
  - `GET /api/admin/inquiries?status=&q=` (`q` trên `contactName`, `contactPhone`, `requestType`), `PATCH /api/admin/inquiries/:id` `{ status?, adminNote? }`.

- [ ] **Step 1: Viết test thất bại**:
  - Không cookie admin → 401 cho cả 4 route; cookie `customer_token` đặt vào `admin_token` → 401.
  - `pending → shipping` → 409; `pending → confirmed → shipping → delivered` → 200 mỗi bước; `delivered → cancelled` → 409.
  - `→ cancelled` thiếu `cancelReason` → 400; có → `cancelledBy "admin"`, `cancelledAt` khác null.
  - `adminNote` cập nhật được mà không đổi trạng thái.
  - Lọc `status=pending` và `q=<4 số cuối SĐT>` trả đúng đơn.
  - Inquiry `new → contacted` → 200; `status: "abc"` → 400.
  - `GET /api/admin/customers` có `hasAccount`, `orderCount`, không có `passwordHash`.
- [ ] **Step 2:** Chạy → FAIL. **Step 3:** Viết/sửa route. **Step 4:** `npm run test:api` (toàn bộ) → PASS.
- [ ] **Step 5:** Kiểm tra tay sửa giá qua admin API: `curl` `PUT` package với `priceValue: 123000` bằng cookie admin → `GET /api/public/packages` thấy `priceValue: 123000`.
- [ ] **Step 6: Commit (BE)** `feat(api): quản lý đơn hàng và yêu cầu tư vấn cho admin`

## Giai đoạn C — fe-dung-api

> Kiểm tra mỗi task FE: `npx tsc --noEmit` (bỏ qua lỗi trong `.next/dev/types`), `npm run lint`, Playwright MCP theo kịch bản ghi trong task, console không lỗi mới. Ảnh lưu `screenshots/<Task>-<mo-ta>.png` trong folder này. Cả hai dev server đang chạy (FE :3000, BE :3001).

### Task 8: Phiên khách hàng ở FE (thay `authStorage`)

**Files:**
- Create: FE `lib/orderStatus.ts` (copy nguyên BE `lib/orderStatus.ts`), FE `lib/customerSession.ts`
- Modify: FE `app/components/SiteHeader.tsx` L10, L165, L190; FE `app/components/AuthClient.tsx` (L6, `handleSubmit` L30-L84); FE `app/components/LeadForm.tsx` L6, L42-L56 (chỉ phần lấy user); FE `app/components/CartClient.tsx` L6, L119-L135 (chỉ phần lấy user)
- Modify: FE `app/dang-nhap/page.tsx`, `app/dang-ky/page.tsx` (bỏ chữ "demo" trong metadata/mô tả)
- Delete: FE `app/components/authStorage.ts`

**Interfaces:**
- Produces (`lib/customerSession.ts`, chạy phía client):
  - `type Customer = { id: number; name: string; email: string; phone: string; address: string | null; birthday: string | null }`
  - `AUTH_UPDATED_EVENT = "sonla-auth-updated"` (giữ tên cũ)
  - `fetchCurrentCustomer(): Promise<Customer | null>` (cache trong module, `refresh` khi event phát)
  - `useCurrentCustomer(): { customer: Customer | null; loading: boolean }` — hook dùng ở header/form
  - `loginCustomer(input: { email; password }): Promise<Customer>`, `registerCustomer(input): Promise<Customer>`, `logoutCustomer(): Promise<void>`, `updateCustomerProfile(input): Promise<Customer>` — lỗi API → `throw new Error(data.error)`; mỗi hàm thành công phát `AUTH_UPDATED_EVENT`
  - `safeNextPath(raw: string | null, fallback: string): string` — chỉ nhận chuỗi bắt đầu `/` và không bắt đầu `//`
  - `clearLegacyDemoStorage(): void` — xoá `sonla-food-users-v1`, `sonla-food-session-v1`, `sonla-food-order-history-v1`; gọi một lần trong `SiteHeader`

- [ ] **Step 1:** Viết `lib/customerSession.ts`, `lib/orderStatus.ts`; đổi các import; `AuthClient` đọc `?next=` qua `useSearchParams`, sau khi thành công `router.push(safeNextPath(next, href("/tai-khoan")))`, hiện `error.message` dưới form; xoá `authStorage.ts`.
- [ ] **Step 2:** `npx tsc --noEmit`, `npm run lint` → sạch; `grep -rn "authStorage" app lib` → không còn kết quả.
- [ ] **Step 3: Playwright TC-08**:
  - `/dang-ky` tạo tài khoản `test+pw<rand>@sonlafood.local` → về `/tai-khoan`, header hiện chữ cái đầu tên.
  - Đăng xuất, `/en/dang-nhap?next=/en/gio-hang` đăng nhập → URL là `/en/gio-hang`.
  - `/dang-nhap?next=//evil.com` đăng nhập → về `/tai-khoan`, không rời domain.
  - Sai mật khẩu → hiện "Email hoặc mật khẩu không đúng" (đúng chuỗi BE trả).
  - Tải lại trang → vẫn đăng nhập (cookie). localStorage không còn 3 key demo.
- [ ] **Step 4: Commit (FE)** `feat: đăng nhập khách hàng qua API, bỏ tài khoản demo`

### Task 9: Trang tài khoản và danh sách đơn

**Files:**
- Create: FE `app/components/OrderHistoryList.tsx`, FE `lib/customerOrders.ts`
- Modify: FE `app/components/ProfileClient.tsx` (viết lại theo 2 tab), FE `app/globals.css` (style tab, badge trạng thái — dùng lại biến màu/khối `.order-modal-*` sẵn có nếu hợp)

**Interfaces:**
- Consumes: `useCurrentCustomer`, `updateCustomerProfile`, `logoutCustomer` (Task 8), `ORDER_STATUS_LABELS`, `INQUIRY_STATUS_LABELS`.
- Produces:
  - `lib/customerOrders.ts`: `type CustomerOrder` (khớp JSON BE Task 5), `fetchMyOrders(): Promise<CustomerOrder[]>`, `cancelMyOrder(code: string, reason: string): Promise<CustomerOrder>`, `fetchMyInquiries(): Promise<CustomerInquiry[]>`, `fetchPackingFee(): Promise<number>`, `submitOrder(input): Promise<CustomerOrder>` (dùng ở Task 10), `submitInquiry(input): Promise<CustomerInquiry>` (Task 11). Lỗi → `throw` `ApiError` có `status: number` và `message`.
  - `<OrderHistoryList orders onCancelled />`: mỗi đơn hiện mã, ngày (`vi-VN`), tổng, nhãn trạng thái (class `order-status-<code>`), danh sách món; nút "Huỷ đơn" chỉ khi `pending`, mở form lý do ngay trong thẻ đơn (không dùng `window.confirm`).

- [ ] **Step 1:** Viết `lib/customerOrders.ts`, `OrderHistoryList`, `ProfileClient` (tab "Hồ sơ", "Đơn hàng của tôi", và khối "Yêu cầu tư vấn" dưới tab đơn). Chưa đăng nhập → chuyển `/dang-nhap?next=/tai-khoan`.
- [ ] **Step 2:** tsc + lint sạch.
- [ ] **Step 3: Playwright TC-09**: tạo sẵn 1 đơn bằng `curl` với cookie của tài khoản test; `/tai-khoan` → tab đơn hiện mã + "Chờ xác nhận"; huỷ với lý do → nhãn "Đã huỷ", nút huỷ biến mất; sửa SĐT ở tab hồ sơ → tải lại vẫn giữ. Chụp ảnh.
- [ ] **Step 4: Commit (FE)** `feat: trang tài khoản với đơn hàng thật`

### Task 10: Giỏ hàng gửi đơn thật

**Files:**
- Modify: FE `app/components/cartStorage.ts` (bỏ `parseCartPrice` L22-L26; `normalizeItem` giữ `price` = số, 0 nghĩa là giá liên hệ)
- Modify: FE `app/components/PackageCard.tsx` L85-L95, `app/components/LocalSpecialtyExplorer.tsx` L160-L170, `app/combo-dac-san/[slug]/page.tsx` L112-L113, `app/dac-san/[slug]/page.tsx` L95-L96: `price: item.priceValue ?? 0`
- Modify: FE `lib/publicContent.ts` (type payload thêm `priceValue: number | null`, `priceUnit: string | null`) và type tương ứng trong `app/data/food.ts` nếu các component dùng type đó (fallback tĩnh để `priceValue: null`)
- Modify: FE `app/components/CartClient.tsx`: xoá `StoredOrderRequest`, `ORDER_HISTORY_STORAGE_KEY`, `readOrderHistory`/`writeOrderHistory`, `createOrderCode`, `buildOrderNotes`, state và modal sửa/huỷ đơn (`editingOrderId`, `cancelingOrderId`, …); `totals` dùng `packingFee` từ `fetchPackingFee()`; tab "Lịch sử yêu cầu" render `<OrderHistoryList>` từ `fetchMyOrders()` (chưa đăng nhập → link đăng nhập); `handleOrderSubmit` gọi `submitOrder`

**Interfaces:**
- Consumes: `submitOrder`, `fetchMyOrders`, `fetchPackingFee`, `ApiError` (Task 9); `useCurrentCustomer` (Task 8).

Hành vi `handleOrderSubmit` (spec §6.1):
- Chưa đăng nhập hoặc `ApiError.status === 401` → `router.push(href("/dang-nhap") + "?next=" + encodeURIComponent(currentPath))`, **không** xoá giỏ.
- 400 → hiện `error.message` (có tên món lỗi), giữ giỏ.
- Thành công → `updateCart([])`, chuyển tab lịch sử, hiện "Đã gửi đơn <code>" + link `/tai-khoan`.
- Lỗi mạng → thông báo hiện có "Không thể kết nối đến máy chủ…".
- Nút gửi `disabled` khi `isSubmittingOrder`.
- Món `price === 0` hiển thị "Giá liên hệ"; có món như vậy thì dòng tổng ghi thêm "(chưa gồm món giá liên hệ)".

- [ ] **Step 1:** Sửa code như trên. `grep -rn "parseCartPrice\|/api/bookings" app lib` → chỉ còn `LeadForm` (Task 11 xử lý).
- [ ] **Step 2:** tsc + lint sạch.
- [ ] **Step 3: Playwright TC-10 (luồng 1 của spec)**: đăng nhập → thêm 1 combo có giá + 1 đặc sản không giá → giỏ hiện phí đóng gói 30.000đ, "Giá liên hệ" → gửi → thấy `SLF-…`, giỏ trống → `/tai-khoan` thấy đơn "Chờ xác nhận" với tổng khớp BE.
- [ ] **Step 4: Playwright TC-11 (Review Focus 2, 4)**: (a) đặt vào localStorage một món giả `{ type: "package", slug: "khong-ton-tai", price: 1 }` → gửi → lỗi có slug, giỏ còn; (b) xoá cookie `customer_token` qua `browser_run_code_unsafe` (`context.clearCookies({ name: "customer_token" })`) → gửi → về `/dang-nhap?next=/gio-hang`, giỏ còn.
- [ ] **Step 5: Commit (FE)** `feat: giỏ hàng gửi đơn qua API`

### Task 11: Form tư vấn gửi `/api/inquiries`

**Files:**
- Modify: FE `app/components/LeadForm.tsx` (xoá `buildInquiryNotes` L21-L35; `handleSubmit` L58-L112 gọi `submitInquiry` với các trường riêng)

**Interfaces:**
- Consumes: `submitInquiry` (Task 9). Trường gửi: `requestType, products, quantity, budget, occasion, deliveryArea, notes, contactName (= name), contactPhone (= phone), contactEmail (= email)`.

- [ ] **Step 1:** Sửa; 401 → chuyển đăng nhập như Task 10.
- [ ] **Step 2:** tsc + lint sạch; `grep -rn "/api/bookings" app lib` → không còn.
- [ ] **Step 3: Playwright TC-12**: `/lien-he` gửi yêu cầu → thông báo thành công; `/tai-khoan` thấy yêu cầu trạng thái "Mới".
- [ ] **Step 4: Commit (FE)** `feat: form tư vấn lưu yêu cầu riêng`

### Task 12: Admin — Đơn hàng và Yêu cầu tư vấn

**Files:**
- Create: BE `app/admin/orders/page.tsx`, `app/admin/orders/[id]/page.tsx`, `app/admin/inquiries/page.tsx`
- Modify: BE `app/components/admin/AdminSidebar.tsx` L215-L230 (3 mục con: "Đơn hàng" `/admin/orders`, "Yêu cầu tư vấn" `/admin/inquiries`, "Yêu cầu cũ (lưu trữ)" `/admin/bookings`; `activePattern` phủ cả 3)

**Interfaces:**
- Consumes: API admin Task 7; `ORDER_STATUS_LABELS`, `NEXT_ORDER_STATUS`, `INQUIRY_STATUS_LABELS`.
- Trang là client component, tự `fetch` (không thêm vào `AdminContext`), style Tailwind giống `app/admin/bookings/page.tsx`. Nút trạng thái trong trang chi tiết lấy từ `NEXT_ORDER_STATUS[order.status]`; chọn "Đã huỷ" bắt buộc nhập lý do trước khi gửi.

- [ ] **Step 1:** Viết 3 trang + sửa sidebar. BE `npx tsc --noEmit` sạch.
- [ ] **Step 2: Playwright TC-13 (luồng 2 của spec)** trên `localhost:3001/admin`: thấy đơn từ TC-10 → mở chi tiết → "Xác nhận" → "Đang giao"; FE `/tai-khoan` tải lại thấy "Đang giao", không có nút huỷ. Lọc "Đang giao" chỉ còn đơn đó. `/admin/inquiries` thấy yêu cầu TC-12 → "Đã liên hệ". Chụp ảnh.
- [ ] **Step 3: Commit (BE)** `feat(admin): trang đơn hàng và yêu cầu tư vấn`

### Task 13: Admin — booking lưu trữ, khách hàng, giá, phí đóng gói

**Files:**
- Modify: BE `app/admin/bookings/page.tsx` (bỏ form thêm, nút sửa/đổi trạng thái; tiêu đề "Yêu cầu cũ (lưu trữ)")
- Delete: BE `app/admin/bookings/status/`
- Modify: BE `app/admin/interactions/customers/page.tsx` (cột "Có tài khoản", "Số đơn"; bỏ hiển thị số booking / tổng chi tiêu), BE `app/components/admin/AdminContext.tsx` (type `AdminCustomer` thêm `hasAccount`, `orderCount`)
- Modify: BE `app/admin/packages/page.tsx`, BE `app/admin/local-specialties/page.tsx` L18, L50, L150, L393 (thêm "Giá (VND)" kiểu số và "Đơn vị" cạnh "Giá tham khảo")
- Modify: BE `app/admin/settings/page.tsx` (ô "Phí đóng gói (VND)" lưu key `order_packing_fee`)
- Modify: BE `app/api/admin/customers/route.ts` (bỏ `totalBookings`, `totalSpent` khỏi JSON)

- [ ] **Step 1:** Sửa; `grep -rn "bookings/status" app` → không còn link. BE tsc sạch.
- [ ] **Step 2: Playwright TC-14**: đặt phí đóng gói 25000 → FE giỏ hàng hiện 25.000đ (đặt lại 30000 sau test); sửa giá một đặc sản → FE thêm vào giỏ thấy giá mới; `/admin/bookings` không còn nút sửa; trang khách hàng thấy tài khoản test "Có tài khoản", "Số đơn" ≥ 1.
- [ ] **Step 3: Commit (BE)** `feat(admin): giá dạng số, phí đóng gói, lưu trữ booking cũ`

### Task 14: Đóng `/api/bookings` và nghiệm thu

**Files:**
- Modify: BE `app/api/bookings/route.ts` (mọi method → 410 `{ success: false, error: "Chức năng này đã thay đổi. Vui lòng tải lại trang." }`)
- Test: BE `tests/api/bookings-gone.test.ts`

- [ ] **Step 1:** Test thất bại: `POST` → 410. **Step 2:** Sửa. **Step 3:** `npm run test:unit && npm run test:api` → tất cả PASS.
- [ ] **Step 4:** FE `npm run build` và BE `npm run build` → thành công.
- [ ] **Step 5:** Chạy lại TC-10, TC-12, TC-13 trên bản build (`npm start` hoặc dev) → đạt; console không lỗi.
- [ ] **Step 6:** Dọn dữ liệu test: `npx tsx -e "import('./tests/helpers').then(m => m.cleanupTestData())"` (BE).
- [ ] **Step 7:** Cập nhật `status.md` (cả folder này và folder cha), `docs/features/README.md`, đánh dấu T1, T2, T3, T4, T6, T7, T8, T9 xong trong `../plan.md`.
- [ ] **Step 8: Commit** (FE + BE) `chore: đóng API bookings cũ`

## Kịch bản test (tổng hợp)

| ID | Task | Kịch bản | Kỳ vọng |
|---|---|---|---|
| TC-01..07 | — | Thuộc `sua-loi-nhanh` | — |
| TC-08 | 8 | Đăng ký, đăng nhập, `?next=` có locale, `next=//evil.com`, sai mật khẩu, tải lại | Như Task 8 Step 3 |
| TC-09 | 9 | Tài khoản: xem/huỷ đơn, sửa hồ sơ | Như Task 9 Step 3 |
| TC-10 | 10 | Giỏ → gửi đơn → tài khoản | Mã `SLF-…`, tổng khớp BE |
| TC-11 | 10 | Món không tồn tại; mất cookie | Lỗi rõ, giỏ còn |
| TC-12 | 11 | Gửi yêu cầu tư vấn | Thấy ở tài khoản, trạng thái "Mới" |
| TC-13 | 12 | Admin chuyển trạng thái | Khách thấy "Đang giao" |
| TC-14 | 13 | Phí đóng gói, giá, booking lưu trữ, khách hàng | Như Task 13 Step 2 |
| API | 1–7, 14 | `npm run test:unit`, `npm run test:api` (BE) | Tất cả PASS |
