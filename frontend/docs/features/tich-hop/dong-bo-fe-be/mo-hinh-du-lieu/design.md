# Design — Tài khoản khách, đơn hàng, yêu cầu tư vấn (giai đoạn 2–4)

> Spec đã chốt qua brainstorming ngày 2026-11-11 (Phần 1 dữ liệu, Phần 2 API, Phần 3 giao diện).
> Giải quyết: T1 (tài khoản khách), T2/T3 (FE dùng API thật), T4 (bộ trạng thái đơn), T6 (Order thay Booking kiểu tour), T7 (tách yêu cầu tư vấn), T8 (giá dạng số), T9 (`totalBookings`).
> Ngoài phạm vi: T10–T13 (dọn URL/nội dung), T15 (deploy), T18 (admin qua cổng FE).

## 1. Mục tiêu và tiêu chí thành công

- Khách **đăng ký / đăng nhập thật** (lưu ở BE). Không còn dữ liệu demo trong localStorage.
- Khách đã đăng nhập **đặt đơn từ giỏ hàng**. Đơn có mã `SLF-…`, tổng tiền do BE tính, xem lại được ở `/tai-khoan`.
- Nhân viên **xác nhận và cập nhật trạng thái đơn** trong admin. Khách thấy trạng thái mới.
- **Yêu cầu tư vấn** lưu riêng, không trộn với đơn hàng.
- Token khách hàng **không thể** dùng làm token admin.

Thành công khi 3 luồng Playwright ở mục 7 chạy đạt và các script test API (mục 7) đều pass.

## 2. Quyết định đã chốt

| Câu hỏi | Quyết định |
|---|---|
| Cách đặt hàng | Khách gửi yêu cầu, nhân viên xác nhận (không thanh toán online) |
| Đăng nhập | Bắt buộc khi đặt đơn và gửi yêu cầu tư vấn |
| Trạng thái đơn | `pending` Chờ xác nhận → `confirmed` Đã xác nhận → `shipping` Đang giao → `delivered` Đã giao; `cancelled` Đã huỷ |
| Mô hình | Bảng mới `Order`, `OrderItem`, `Inquiry`. `Booking` giữ làm dữ liệu cũ |
| Giá | Giá tham khảo dạng số, BE tự tính lại tổng, bỏ qua giá FE gửi |

## 3. Dữ liệu (BE `prisma/schema.prisma`)

### 3.1 `Customer` — thêm cột

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `passwordHash` | `String? @map("password_hash")` | `null` = khách cũ chưa có tài khoản |
| `address` | `String?` | |
| `birthday` | `String?` | dạng `YYYY-MM-DD` như form hiện có |
| `lastLoginAt` | `DateTime? @map("last_login_at")` | |
| `orders` / `inquiries` | quan hệ | |

`totalBookings`, `totalSpent` giữ cột nhưng **API mới không cập nhật** (T9). Admin đếm số đơn từ `Order`.

### 3.2 `Order` (`@@map("orders")`)

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | `Int @id @default(autoincrement())` | |
| `code` | `String @unique` | `SLF-YYYYMMDD-NNNN`, NNNN = số thứ tự trong ngày (giờ VN), thử lại khi trùng |
| `customerId` | `Int` → `Customer` | |
| `status` | `String @default("pending")` | mã ở mục 3.5 |
| `receiverName`, `phone`, `email`, `address` | `String` | `email` có thể rỗng |
| `note` | `String?` | ghi chú của khách |
| `subtotal`, `packingFee`, `total` | `Int` | VND |
| `hasUnpricedItems` | `Boolean @default(false)` | có món "Giá liên hệ" |
| `cancelReason` | `String?` | |
| `cancelledBy` | `String?` | `customer` / `admin` |
| `cancelledAt` | `DateTime?` | |
| `adminNote` | `String?` | ghi chú nội bộ |
| `createdAt`, `updatedAt` | `DateTime` | |
| `items` | `OrderItem[]` | |

Index: `@@index([customerId])`, `@@index([status])`.

### 3.3 `OrderItem` (`@@map("order_items")`)

`id`, `orderId` (→ `Order`, `onDelete: Cascade`), `itemType` (`package` / `specialty`), `itemId Int`, và bản chụp tại lúc đặt: `slug`, `name`, `image String?`, `unitPrice Int?`, `unit String?`, `quantity Int`. Sửa giá sản phẩm sau đó không đổi đơn cũ.

### 3.4 `Inquiry` (`@@map("inquiries")`)

`id`, `customerId` (→ `Customer`), `requestType`, `products String?`, `quantity String?`, `budget String?`, `occasion String?`, `deliveryArea String?`, `notes String?`, `status String @default("new")` (`new` Mới → `contacted` Đã liên hệ → `closed` Đóng), `adminNote String?`, `createdAt`, `updatedAt`.

Liên hệ (tên, SĐT, email) lấy từ tài khoản; form vẫn cho sửa và lưu kèm vào `contactName`, `contactPhone`, `contactEmail` để nhân viên gọi đúng người.

### 3.5 Trạng thái — `lib/orderStatus.ts`

Cùng một nội dung, đặt ở **cả hai repo** (BE `lib/orderStatus.ts`, FE `lib/orderStatus.ts`; hai repo không chia sẻ code):

```ts
export const ORDER_STATUSES = ["pending", "confirmed", "shipping", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Chờ xác nhận", confirmed: "Đã xác nhận", shipping: "Đang giao", delivered: "Đã giao", cancelled: "Đã huỷ",
};
// Bước kế tiếp hợp lệ khi admin đổi trạng thái
export const NEXT_ORDER_STATUS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"], confirmed: ["shipping", "cancelled"],
  shipping: ["delivered", "cancelled"], delivered: [], cancelled: [],
};
export const INQUIRY_STATUS_LABELS = { new: "Mới", contacted: "Đã liên hệ", closed: "Đóng" } as const;
```

### 3.6 Giá

- `Package` và `LocalSpecialty` thêm `price Int?` và `priceUnit String? @map("price_unit")`. `priceText` giữ để hiển thị.
- Script một lần `scripts/backfill-prices.ts` (chạy bằng `tsx`): đọc `priceText`, lấy số đầu tiên (`"Từ 650.000đ/kg"` → `650000`, `kg`). Không đọc được thì để `null` và in danh sách để admin nhập tay. Chạy lại không ghi đè dòng đã có `price`.
- Phí đóng gói: `SiteSetting` key `order_packing_fee`, mặc định `30000` khi chưa có. Đơn chỉ có món giá liên hệ vẫn tính phí đóng gói.

### 3.7 Booking và dữ liệu demo

- `Booking` không đổi schema. Không chuyển dữ liệu sang `Order`.
- Dữ liệu demo localStorage (`sonla-demo-users`, phiên demo, lịch sử đơn demo) bỏ, không chuyển lên BE. FE xoá các key này một lần khi tải trang.

### 3.8 Áp dụng schema

BE đang dùng `prisma db push` (`npm run db:deploy`). Tất cả thay đổi là **thêm** bảng/cột nullable, không xoá → an toàn với dữ liệu hiện có. Thứ tự: `db push` → `prisma generate` → `backfill-prices`.

## 4. Xác thực khách hàng (BE `lib/customerAuth.ts`)

- Cookie `customer_token`: httpOnly, `SameSite=Lax`, `path=/`, 30 ngày, `Secure` khi production.
- Token HS256 tự ký giống định dạng `lib/auth.ts`, nhưng khoá HMAC = `JWT_SECRET + ":customer"` và `aud: "customer"`. Admin token có `aud: "admin"` và khoá khác → không thể dùng thay nhau (đã gia cố ở CR-002).
- Payload: `{ sub: customerId, aud: "customer", exp }`. Mỗi request đọc lại `Customer` từ DB.
- Mật khẩu: `hashPassword` / `verifyPassword` có sẵn trong `lib/auth.ts` (PBKDF2).
- Hàm dùng chung: `signCustomerToken(id)`, `getCustomerSession(request) → Customer | null`, `setCustomerCookie(res, token)`, `clearCustomerCookie(res)`.
- FE gọi qua rewrite `/api/*` cùng domain → không cần CORS, cookie tự gửi kèm.

## 5. API

Mọi phản hồi dạng `{ success: true, data }` hoặc `{ success: false, error }` (tiếng Việt), đúng kiểu hiện có.
Mã lỗi: 400 dữ liệu sai · 401 chưa đăng nhập · 404 không tìm thấy hoặc không phải của mình · 409 sai trạng thái / email đã đăng ký.

### 5.1 Khách hàng

| Method | Path | Đầu vào | Kết quả |
|---|---|---|---|
| POST | `/api/auth/register` | `name, email, phone, password (≥ 6), address?, birthday?` | Tạo khách + set cookie. Email có trong bảng nhưng `passwordHash = null` → kích hoạt dòng đó (cập nhật tên/SĐT). Email đã có mật khẩu → 409 |
| POST | `/api/auth/login` | `email, password` | Set cookie, cập nhật `lastLoginAt`. Sai email hoặc mật khẩu → cùng thông báo 401 |
| POST | `/api/auth/logout` | — | Xoá cookie |
| GET | `/api/auth/me` | — | `{ id, name, email, phone, address, birthday }`; chưa đăng nhập → 401 |
| PATCH | `/api/auth/me` | `name?, phone?, address?, birthday?` | Không cho đổi email |
| GET | `/api/public/order-settings` | — | `{ packingFee }` (không cần đăng nhập) |
| POST | `/api/orders` | `items: [{ itemType, slug, quantity }]`, `receiverName, phone, email?, address, note?` | BE tra giá từ DB, tính `subtotal`, `packingFee`, `total`, `hasUnpricedItems`, sinh `code`, tạo đơn + item trong một transaction. Trả đơn đầy đủ |
| GET | `/api/orders` | — | Đơn của khách đang đăng nhập, mới nhất trước, kèm item |
| PATCH | `/api/orders/:code` | `{ receiverName?, phone?, email?, address?, note? }` hoặc `{ action: "cancel", reason }` | Chỉ khi đơn của mình và `pending`; ngược lại 404 / 409. Huỷ: `cancelledBy = "customer"` |
| POST | `/api/inquiries` | `requestType, products?, quantity?, budget?, occasion?, deliveryArea?, notes?, contactName, contactPhone, contactEmail?` | Tạo yêu cầu `new` |
| GET | `/api/inquiries` | — | Yêu cầu của khách |
| ANY | `/api/bookings` | — | **410 Gone** + thông báo "Vui lòng tải lại trang" (sau khi FE đã chuyển) |

Kiểm tra dữ liệu đơn: 1–30 dòng; `quantity` nguyên 1–99; gộp các dòng trùng `itemType + slug`; sản phẩm phải tồn tại và đang mở bán (dùng `OPEN_STATUSES` / trạng thái hiển thị như `app/api/public/_data.ts`); SĐT 9–11 chữ số; tên, địa chỉ bắt buộc.

### 5.2 Admin (dùng `verifyAdminSession` có sẵn)

| Method | Path | Ghi chú |
|---|---|---|
| GET | `/api/admin/orders?status=&q=&page=` | Lọc trạng thái; `q` tìm theo mã, tên người nhận, SĐT; 20 dòng/trang |
| GET | `/api/admin/orders/:id` | Chi tiết + item + khách |
| PATCH | `/api/admin/orders/:id` | `{ status?, cancelReason?, adminNote? }`. `status` phải nằm trong `NEXT_ORDER_STATUS[hiện tại]`; sang `cancelled` bắt buộc `cancelReason`, `cancelledBy = "admin"` |
| GET | `/api/admin/inquiries?status=&q=` | |
| PATCH | `/api/admin/inquiries/:id` | `{ status?, adminNote? }` |
| — | `/api/admin/customers` (sửa) | Trả thêm `hasAccount` (`passwordHash != null`) và `orderCount` (`_count.orders`); không trả `passwordHash` |
| — | `/api/admin/packages`, `/api/admin/local-specialties` (sửa) | Nhận/trả `price`, `priceUnit` |
| — | `/api/admin/settings` (sửa) | Nhận key `order_packing_fee` |

## 6. Giao diện

### 6.1 FE (`sonla-food-frontend`)

| Vị trí | Thay đổi |
|---|---|
| `app/components/authStorage.ts` | **Xoá.** Thay bằng `lib/customerSession.ts`: `fetchCurrentCustomer()`, `login()`, `register()`, `logout()`, `updateProfile()`, phát `AUTH_UPDATED_EVENT` (giữ tên event) |
| `app/components/SiteHeader.tsx` | Đổi nguồn user sang `customerSession` |
| `app/components/AuthClient.tsx` (`/dang-ky`, `/dang-nhap`) | Gọi API; hiện lỗi BE dưới form; xong thì về `?next=` (chỉ nhận đường dẫn nội bộ bắt đầu bằng `/`) hoặc `/tai-khoan` |
| `app/components/ProfileClient.tsx` (`/tai-khoan`) | 2 tab: **Hồ sơ** (PATCH `/api/auth/me`) và **Đơn hàng của tôi** (mã, ngày, tổng, nhãn trạng thái màu, danh sách món; nút huỷ khi `pending`, hỏi lý do bằng modal trong trang). Kèm danh sách yêu cầu tư vấn |
| `app/components/cartStorage.ts` | `price` (số, đã có) lấy từ `priceValue` của payload, `0` = giá liên hệ; bỏ `parseCartPrice` |
| `PackageCard`, `LocalSpecialtyExplorer`, trang chi tiết combo/đặc sản | `price: item.priceValue ?? 0`. Payload public trả thêm `priceValue`, `priceUnit` (tên `price` của combo đã là chuỗi hiển thị nên không dùng lại) |
| `app/components/CartClient.tsx` | Phí đóng gói từ `/api/public/order-settings`; "Gửi xác nhận" → `POST /api/orders`; chưa đăng nhập → `/dang-nhap?next=/gio-hang`; thành công → xoá giỏ, hiện mã đơn + link `/tai-khoan`; món không giá hiện "Giá liên hệ"; bỏ modal sửa/huỷ đơn giả lập |
| `app/components/LeadForm.tsx` | `POST /api/inquiries` với trường riêng (bỏ `buildInquiryNotes`); vẫn bắt buộc đăng nhập, tự điền từ tài khoản |
| `lib/orderStatus.ts` | Mới (mục 3.5) |

Lỗi mạng giữ thông báo hiện có "Không thể kết nối đến máy chủ…". Phiên hết hạn (401) khi đặt đơn → chuyển sang đăng nhập, giỏ vẫn giữ.

### 6.2 Admin (BE)

| Vị trí | Thay đổi |
|---|---|
| `app/components/admin/AdminSidebar.tsx` L215-L230 | "Quản lý Đơn đặt hàng" → mục con **Đơn hàng** (`/admin/orders`), **Yêu cầu tư vấn** (`/admin/inquiries`), **Yêu cầu cũ (lưu trữ)** (`/admin/bookings`) |
| `app/admin/orders/page.tsx` (mới) | Bảng: mã, ngày, người nhận, SĐT, tổng, trạng thái; lọc trạng thái, ô tìm kiếm, phân trang |
| `app/admin/orders/[id]/page.tsx` (mới) | Món, người nhận, tổng tiền; nút chỉ hiện bước hợp lệ theo `NEXT_ORDER_STATUS`; huỷ bắt buộc lý do; ô ghi chú nội bộ |
| `app/admin/inquiries/page.tsx` (mới) | Danh sách + đổi trạng thái + ghi chú |
| `app/admin/bookings/page.tsx` | Chỉ đọc (bỏ nút sửa/đổi trạng thái), tiêu đề "Yêu cầu cũ (lưu trữ)" |
| `app/admin/bookings/status/` | Xoá |
| `app/admin/interactions/customers` | Thêm cột "Có tài khoản", "Số đơn"; bỏ hiển thị `totalBookings`, `totalSpent` |
| Form combo, form đặc sản | Thêm "Giá (VND)" và "Đơn vị" |
| `app/admin/settings/page.tsx` | Thêm "Phí đóng gói (VND)" |

## 7. Kiểm thử

- **Script API BE** (`scripts/test-api/*.ts`, chạy `npx tsx`, gọi `http://localhost:3001` với DB local, tự dọn dữ liệu test có email `test+...@sonlafood.local`):
  - auth: đăng ký, trùng email 409, kích hoạt khách cũ, đăng nhập sai 401, `/me`, token khách đặt vào `admin_token` → 401.
  - orders: giá do BE tính (bỏ giá gửi lên), món không giá → `hasUnpricedItems`, quá 99 → 400, sản phẩm ẩn → 400, khách khác sửa đơn → 404, huỷ khi không `pending` → 409.
  - admin: chuyển trạng thái sai luồng → 409, huỷ thiếu lý do → 400.
- **Playwright MCP** (3 luồng):
  1. Đăng ký → thêm 2 món vào giỏ → gửi đơn → thấy mã `SLF-…` → `/tai-khoan` thấy đơn "Chờ xác nhận".
  2. Admin (`localhost:3001/admin`) xác nhận → đang giao → khách tải lại thấy "Đang giao"; thử huỷ ở phía khách không còn nút.
  3. Gửi yêu cầu tư vấn → xuất hiện ở `/admin/inquiries`.
- FE: `npm run build`, `npm run lint`, `npx tsc --noEmit`. BE: `npx prisma validate`, `npx tsc --noEmit`.

## 8. Thứ tự triển khai (khớp folder con của `dong-bo-fe-be`)

1. **mo-hinh-du-lieu**: schema, `lib/orderStatus.ts`, `db push`, backfill giá.
2. **api-backend**: `customerAuth`, API khách, API admin, script test API.
3. **fe-dung-api**: FE (6.1) + admin (6.2), sau đó `/api/bookings` → 410.

Mỗi bước dùng được độc lập: sau bước 1–2 FE cũ vẫn chạy (vẫn gọi `/api/bookings`); 410 chỉ bật ở cuối bước 3.

## 9. Rủi ro

- **Kích hoạt khách cũ bằng email:** người biết email của khách cũ có thể "kích hoạt" trước. Thiệt hại thấp (khách cũ chưa có đơn trong `Order`, chỉ lộ tên/SĐT đã có). Chấp nhận ở giai đoạn này; xác minh email để sau.
- **Backfill giá đọc sai:** script chỉ điền khi đọc được chắc chắn, in danh sách còn lại để admin kiểm tra.
- BE chưa có git → sao lưu trước khi sửa (đã có bản 2026-11-11; tạo bản mới trước bước 1).

## Vị trí code đã sửa

| Task | Vị trí | Mô tả |
|---|---|---|
| T-001.1 | BE `lib/orderStatus.ts` (mới), `tests/helpers.ts` (mới), `package.json` scripts `test:unit`, `test:api`; `.gitignore` thêm *.log | Bộ trạng thái spec §3.5 + `isOrderStatus`, `canTransition`; helper gọi route handler trực tiếp |
| T-001.2 | BE `prisma/schema.prisma`: Customer +passwordHash/address/birthday/lastLoginAt/orders/inquiries; Package & LocalSpecialty +price/priceUnit; model Order, OrderItem, Inquiry (cuối file); `tests/api/schema.test.ts` | Spec §3.1–3.4, §3.6; script test dùng `tsx --env-file=.env` |
| T-001.3 | BE `lib/price.ts` (`parsePriceText`), `scripts/backfill-prices.ts` (+ script `db:backfill-prices`), `lib/packages.ts` (`PublicPackage.priceValue/priceUnit`, `fromDbPackage` không còn lấy `item.price` làm chuỗi), `app/api/public/_data.ts` (`getSpecialtiesPayload`, `getSpecialtyDetailPayload`) | Spec §3.6 |
| T-001.4 | | Task 4 | BE lib/customerAuth.ts; app/api/auth/register|login|logout|me/route.ts; lib/auth.ts export getJwtSecret | Token khách aud=customer, cookie customer_token 30 ngày | |
| T-001.5 | | Task 5 | BE lib/orders.ts (mergeOrderItems, computeTotals, formatOrderCode, isOrderablePackage, readReceiver, getPackingFee, createOrder); app/api/orders/route.ts GET/POST; app/api/orders/[code]/route.ts PATCH; app/api/public/order-settings/route.ts | Giá lấy từ DB; mã đơn = số lớn nhất trong ngày + 1, thử lại khi P2002; PATCH dùng updateMany where status=pending chống sửa đồng thời | |
| T-001.6 | | Task 6 | BE app/api/inquiries/route.ts GET/POST | Trường riêng theo spec §5.1; chuỗi > 2000 ký tự → 400; SĐT/email chuẩn hoá | |
| T-001.7 | | Task 7 | BE app/api/admin/orders/route.ts (GET, 20/trang), app/api/admin/orders/[id]/route.ts (GET, PATCH), app/api/admin/inquiries/route.ts (GET), app/api/admin/inquiries/[id]/route.ts (PATCH), lib/adminOrders.ts (requireAdmin, parseId); lib/price.ts parsePriceValue; admin/customers +hasAccount/orderCount; admin/settings nhận order_packing_fee; admin/packages + local-specialties nhận/trả priceValue, priceUnit | Chuyển trạng thái theo NEXT_ORDER_STATUS, updateMany where status hiện tại chống ghi đè | |
| T-001.8 | | Task 8 | FE lib/customerSession.ts (useCurrentCustomer, login/register/logout/updateCustomerProfile, safeNextPath, clearLegacyDemoStorage), lib/orderStatus.ts (bản sao BE); app/components/AuthClient.tsx handleSubmit gọi API + ?next=; SiteHeader dùng useCurrentCustomer; LeadForm/CartClient/ProfileClient đổi nguồn user; xoá app/components/authStorage.ts; BE app/api/auth/me GET trả data null | Phiên = cookie httpOnly do BE đặt; FE không lưu thông tin đăng nhập | |
| T-001.9 | `lib/customerOrders.ts` (callApi, fetchMyOrders, submitOrder, cancelMyOrder, fetchMyInquiries, submitInquiry, fetchPackingFee, formatVnd); `app/components/OrderHistoryList.tsx` (OrderCard + form huỷ inline); `app/components/ProfileClient.tsx` (tab Hồ sơ/Đơn hàng, redirect ?next=); `app/globals.css` (cuối file: .profile-main, .order-status-*, .order-cancel-inline, .profile-inquiry-*) | Trang tài khoản dùng API đơn hàng/tư vấn thật |
| T-001.10 | `app/components/CartClient.tsx` (useSyncExternalStore giỏ, fetchPackingFee, handleOrderSubmit→submitOrder, 401→redirectToLogin, tab Đơn hàng của tôi dùng OrderHistoryList); `app/components/cartStorage.ts` (bỏ parseCartPrice; thêm parseCartItems, readCartSnapshot, subscribeCart); `lib/packages.ts`/`lib/publicContent.ts` (priceValue, priceUnit); PackageCard, LocalSpecialtyExplorer, trang chi tiết combo/đặc sản: price = priceValue ?? 0 | Giỏ hàng gửi đơn thật |
| T-001.11 | `app/components/LeadForm.tsx` (bỏ buildInquiryNotes; loginHref(); handleSubmit → submitInquiry; 401 → markCustomerSignedOut + router.push) | Form tư vấn lưu Inquiry riêng |
| T-001.12 | BE `app/admin/orders/page.tsx`, `app/admin/orders/[id]/page.tsx`, `app/admin/inquiries/page.tsx`, `app/components/admin/adminOrderUi.ts` (adminApi, class trạng thái, kiểu), `AdminSidebar.tsx` (activePattern mảng) | Trang admin đơn hàng + yêu cầu tư vấn |
| T-001.13 | BE `app/admin/bookings/page.tsx` (chỉ đọc), xoá `app/admin/bookings/status/`, `AdminTopbar.tsx` (tiêu đề/breadcrumb orders, inquiries), `app/api/admin/customers/route.ts` + `[id]/route.ts` (hasAccount/orderCount, bỏ totalBookings/totalSpent), `AdminContext.tsx` (`AdminCustomer`), `app/admin/interactions/customers/page.tsx`, `app/admin/dashboard/page.tsx`, `app/admin/packages/page.tsx` + `app/admin/local-specialties/page.tsx` (priceValue/priceUnit), `app/admin/settings/page.tsx` (`order_packing_fee`) | Admin: lưu trữ booking, khách hàng, giá số, phí đóng gói |
| T-001.14 | BE `app/api/bookings/route.ts` (410 cho GET/POST/PUT/PATCH/DELETE), `tests/api/bookings-gone.test.ts` | Đóng API bookings cũ |

## Nhật ký sửa đổi

| Ngày | Nội dung |
|---|---|
| 2026-11-11 | Tạo spec từ brainstorming Phần 1–3 |
| 2026-11-11 | Khi lập plan: payload dùng `priceValue`/`priceUnit`; giỏ dùng `price = 0` cho giá liên hệ |
