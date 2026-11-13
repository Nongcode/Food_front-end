# Design — Sửa lỗi tồn đọng sau QA

## Kiến trúc

```
Trình duyệt ──► FE :3000 (Next 16)
                 ├─ proxy.ts: locale (/en, /zh), cookie NEXT_LOCALE
                 └─ rewrites (next.config.ts, khi có BACKEND_INTERNAL_URL)
                      /api/*        ─► BE :3001/api/*
                      /admin/*      ─► BE :3001/admin/*
                      /be-static/*  ─► BE :3001/be-static/*   (file tĩnh của BE)
                      /uploads/*    ─► BE :3001/uploads/*
BE :3001 (Next 16 + Prisma) — assetPrefix "/be-static"
```

## Vị trí code

(cập nhật theo từng task ở mục Nhật ký sửa đổi)

## Admin qua cổng FE (T-002.1)

**Cách chọn:** multi-zones theo docs Next 16 (`node_modules/next/dist/docs/01-app/02-guides/multi-zones.md`). BE là một "zone" phục vụ `/admin` nên đặt `assetPrefix: "/be-static"`; mọi file `/_next/static/*` của BE thành `/be-static/_next/static/*`. Từ Next 15 trở đi BE tự phục vụ đường dẫn có tiền tố (không cần rewrite ở BE). FE (zone mặc định) thêm rewrite `/be-static/:path+` → BE.
- Không dùng `basePath` vì BE còn phục vụ `/api/*` và trang public ở gốc — basePath sẽ đổi toàn bộ URL BE.
- Không dùng proxy.ts để chuyển tiếp vì docs khuyên rewrites (ít độ trễ hơn) khi không cần quyết định động.
- HMR (dev): websocket `ws://localhost:3000/be-static/_next/webpack-hmr` đi qua rewrite của FE, đã kiểm thấy kết nối, không lỗi.
- Font `next/font`: CSS tham chiếu tương đối `../media/*` → `/be-static/_next/static/media/*` (200).
- `next/image` của admin: `assetPrefix` không áp cho `/_next/image`, nên ảnh admin đi qua bộ tối ưu ảnh của FE. FE đã cho phép `res.cloudinary.com`, `images.unsplash.com`; ảnh local (`/sonla-logo-readable.png`) FE có file trùng tên trong `public/` (đã kiểm 200).
- Cookie `admin_token` (path `/`) do BE đặt, đi qua rewrite nên nằm trên domain FE; proxy của FE không kiểm tra admin (BE tự kiểm).
- Trang `/admin/login` không gọi `/api/admin/me` nữa (trước đây luôn 401 trên console).

**Triển khai:**
| Nơi | Biến / cấu hình | Giá trị |
|---|---|---|
| FE | `BACKEND_INTERNAL_URL` | URL BE mà server FE gọi được (vd `http://127.0.0.1:3001`). Không có biến này thì FE không rewrite `/api`, `/admin`, `/be-static`. |
| BE | `assetPrefix` | Cố định `/be-static` trong `next.config.ts` (không cần biến môi trường). Khi mở BE trực tiếp (domain BE) vẫn chạy. |
| Reverse proxy (nếu có, vd nginx đứng trước FE) | — | Chuyển cả `/be-static/` và websocket (`Upgrade`) về FE như các đường dẫn khác; không cần rule riêng. |
| Cache | — | `/be-static/_next/static/*` có hash trong tên, cache lâu được như `/_next/static`. |

Lưu ý: BE phải build lại sau khi đổi `assetPrefix` (`npm run build`), FE build lại để có rewrite mới.

## API

| Method | Path | Quyền | Request | Response |
|---|---|---|---|---|

## Nhật ký sửa đổi

### CR-002 — Admin qua cổng FE + sửa lỗi QA

| Task | File:dòng | Thay đổi | Lý do |
|---|---|---|---|
| T-002.1 | BE `next.config.ts:1-25` | `assetPrefix: "/be-static"` | File tĩnh BE không đụng FE |
| T-002.1 | FE `next.config.ts:24-25` | rewrite `/be-static/:path+` → BE | Phục vụ file tĩnh BE qua :3000 |
| T-002.1 | FE `proxy.ts:72` | matcher loại `be-static` | Không chạy proxy locale cho file tĩnh BE |
| T-002.1 | BE `app/components/admin/AdminContext.tsx:475-484` | bỏ gọi `/api/admin/me` ở trang đăng nhập | Console 0 lỗi |
| T-002.2 | BE `lib/orders.ts:179-187` | `omitAdminNote` → `toCustomerOrder`, `toCustomerInquiry` | Không lộ ghi chú nội bộ |
| T-002.2 | BE `app/api/orders/route.ts:14,22` · `app/api/orders/[code]/route.ts:32` · `app/api/inquiries/route.ts:17,42` | Response đi qua hàm lọc | QA-02 |
| T-002.2 | BE `tests/api/orders.test.ts` (cuối file) · `tests/api/inquiries.test.ts` (cuối file) | Test GET/POST/PATCH không có `adminNote` | TDD |
| T-002.3 | BE `app/admin/packages/page.tsx:47-54` | `statusOptions` thêm "Đang mở"; `optionsWithCurrent()` | QA-04: form hiện đúng trạng thái thật, Lưu không ghi đè |
| T-002.3 | BE `app/admin/packages/page.tsx:84,96,486` | màu cho "Đang mở"; select dùng `optionsWithCurrent` | |
| T-002.3 | BE `app/admin/local-specialties/page.tsx:43-65` | `typeOptions` đủ 6 loại, `typeLabel()`, `typeOptionsWithCurrent()`, `statusOptionsWithCurrent()` | QA-05 |
| T-002.3 | BE `app/admin/local-specialties/page.tsx:298,413,432` | nhãn loại ở danh sách + select | |
| T-002.4 | BE `lib/orders.ts:112-171` | `findProducts()` dùng chung; `quoteCartItems()` trả giá hiện tại, `available` | Giỏ lưu localStorage có thể giữ giá cũ |
| T-002.4 | BE `app/api/public/cart-prices/route.ts` · `tests/api/cart-prices.test.ts` | `POST /api/public/cart-prices` `{items:[{itemType,slug}]}` → `[{itemType,slug,name,unitPrice,unit,available}]` | QA-06 |
| T-002.4 | FE `lib/customerOrders.ts` (cuối file) | `fetchCartPrices`, `cartQuoteKey`, `formatProductPrice()` | |
| T-002.4 | FE `app/components/CartClient.tsx:60-100` | Mở giỏ → hỏi giá BE, ghi lại localStorage nếu lệch, báo `cart.price_updated`; món không còn bán → "Không còn bán", không tính tiền, khoá nút đặt | QA-06 |
| T-002.4 | FE `app/components/CartClient.tsx:226-262` | Sau khi gửi: `order.total !== tổng đang hiện` → báo `cart.total_changed` | QA-06 |
| T-002.4 | FE `app/dac-san/[slug]/page.tsx:79-117` · `app/combo-dac-san/[slug]/page.tsx:90-134` | Giá hiển thị + JSON-LD lấy từ `priceValue/priceUnit`; `priceText` chỉ khi chưa có giá số | QA-07 |
| T-002.4 | FE `lib/i18n/defaults.ts` (cuối) | Khoá `cart.*`, `orders.*`, `orderStatus.*` (vi/en/zh) | Chuỗi mới dùng i18n |
| T-002.5 | BE `app/api/admin/{users,register,login,logout,me,posts/categories,banners}/route.ts` · `app/admin/{settings,multilingual/*,banners/subpages}/page.tsx` | Gõ lại chuỗi mất dấu "?" | QA-15 |
| T-002.5 | BE `app/components/admin/AdminContext.tsx` | Giải mã mojibake cp1252→UTF-8 (170 đoạn: comment, alert, console, cờ ngôn ngữ, mặc định "Đang mở") | QA-15 |
| T-002.5 | BE `lib/customerAuth.ts` (cuối) · `app/api/auth/register/route.ts:20-29` · `app/api/auth/me/route.ts:30-34` · `tests/api/auth.test.ts` (cuối) | `parseBirthday()`: YYYY-MM-DD hợp lệ, ≥1900, không sau hôm nay (giờ VN) → 400 | QA-13, TDD |
| T-002.5 | FE `app/components/AuthClient.tsx` | Lỗi theo từng trường (`aria-invalid`, `.auth-field-error`), focus trường đầu lỗi; ngày sinh `max=hôm nay`; đã đăng nhập → `router.replace(next \|\| /tai-khoan)`; i18n `auth.*` | QA-13 |
| T-002.5 | FE `app/components/ProfileClient.tsx` | Đăng xuất → `router.replace(href("/"))` (cờ `loggingOutRef` để không bị đẩy sang /dang-nhap); chặn ngày sinh tương lai; i18n `account.*` | QA-13 |
| T-002.5 | FE `app/components/LeadForm.tsx` | `maxLength` 2000 (tên 120), kiểm tra từng trường + thông báo dưới trường; nhãn nhu cầu dịch nhưng giá trị gửi giữ tiếng Việt; i18n `leadForm.*` | QA-13 |
| T-002.5 | FE `app/globals.css` (cuối) | `.auth-field-error`, `.form-field-error`, `[aria-invalid]` | |
| T-002.6 | FE `lib/i18n/config.ts` (cuối) | `LOCALE_COOKIE = "NEXT_LOCALE"`, `readLocaleCookie()` | QA-03 |
| T-002.6 | FE `proxy.ts:37-39` | Có cookie hợp lệ → dùng cookie; chưa có → Accept-Language như cũ | QA-03 |
| T-002.6 | FE `app/components/SiteHeader.tsx:8-14,~143` | Bấm ngôn ngữ → ghi cookie 1 năm (`path=/; samesite=lax`) rồi điều hướng | QA-03 |
| T-002.7 | FE `app/dac-san/page.tsx:6,12,33-37,52-53` | Lấy thêm `getPublicSpecialties(locale)`, render `<LocalSpecialtyExplorer>` dưới danh sách combo | QA-08 |
| T-002.7 | FE `app/components/LocalSpecialtyExplorer.tsx` | Ảnh + tên thẻ là `Link` tới `href('/dac-san/'+slug)`; bộ lọc loại đủ 6 loại (chỉ hiện loại đang có); giá `formatProductPrice`; aria-label i18n | QA-08 |
| T-002.7 | FE `app/components/OrderHistoryList.tsx` | Đơn `pending`: nút "Sửa thông tin nhận" → form inline (tên, SĐT, email, địa chỉ, ghi chú) → `updateMyOrderReceiver` (PATCH `/api/orders/[code]`); lỗi BE hiện trong form | QA-09 |
| T-002.7 | FE `lib/customerOrders.ts` | `ReceiverInput`, `updateMyOrderReceiver()` | QA-09 |
| T-002.8 | FE `app/layout.tsx:8,~96` | Gộp `getDefaultTranslationMap(locale)` (FE) + bản dịch BE vào `I18nProvider` — nguyên nhân chuỗi `t()` vẫn ra tiếng Việt trên /en | QA-11 |
| T-002.8 | FE `lib/i18n/server.ts` | export `getDefaultTranslationMap` | QA-11 |
| T-002.8 | FE `lib/i18n/pageCopy.ts` (mới) | `getPageTranslator(namespace)` cho metadata + hero của trang server | QA-11 |
| T-002.8 | FE `app/{gio-hang,dang-nhap,dang-ky,tai-khoan}/page.tsx` | `generateMetadata` + hero dùng khoá `pageCart/pageLogin/pageRegister/pageAccount.*`; bỏ câu "Đơn demo…" ở giỏ hàng | QA-11, QA-14 |
| T-002.8 | FE `app/components/SiteHeader.tsx` | aria-label/title i18n `nav.*` (giỏ, tài khoản, ngôn ngữ, menu, số món) | QA-11 |
| T-002.8 | FE `CartToast.tsx`, `PackageCard.tsx`, `DetailAddToCartButton.tsx` | Thông báo + nhãn "Thêm vào giỏ" i18n | QA-11 |
| T-002.8 | FE `AuthClient/CartClient/LeadForm/ProfileClient.tsx` | placeholder tên → `form.name_placeholder` | QA-11 |
| T-002.8 | FE `lib/seo.ts` `pageTitle()`; `app/{dac-san,combo-dac-san}/[slug]`, `app/tin-tuc/[id]` | Bỏ hậu tố "| Sơn La Food" trùng với template | QA-12 |
| T-002.8 | FE `lib/i18n/defaults.ts` | +33 khoá (pageCart/Login/Register/Account, nav.*, cart.toast_*, form.name_placeholder) | QA-11 |
| T-002.8 | BE `app/admin/layout.tsx:7`, `app/admin/login/layout.tsx:5` | Title admin không còn lặp ("Admin \| Sơn La Food", "Đăng nhập quản trị \| Sơn La Food") — commit 32cfb62 | QA-12 |
| T-002.9 | FE `lib/imageFallback.ts` (mới) | `backgroundWithFallback(url)` → `url(ảnh), url(logo)`; dùng ở `PackageCard`, `PostCard`, `CartClient`, `OrderHistoryList`, `LocalSpecialtyExplorer`, `PackageDetailGallery`, `app/page.tsx`, `app/tin-tuc/page.tsx`, `app/tin-tuc/[id]` (CTA), `app/combo-dac-san/[slug]` (moments) | QA-10 |
| T-002.9 | FE `lib/packageDetailContent.ts` | Bỏ câu "Mẫu demo…", "Phù hợp demo…" (vi + zh); thêm `enPackageDetailContent` | QA-14 |
| T-002.9 | FE `app/combo-dac-san/[slug]/page.tsx:~90` | `peopleRange` dùng "người"/"people"/"人" thay cho "khách" | QA-14 |
| T-002.9 | FE `app/gio-hang/page.tsx` | Bỏ "Đơn demo…" (làm cùng T-002.8, khoá `pageCart.copy`) | QA-14 |
| T-002.9 | BE `AdminSidebar.tsx:314` | "SƠN LA FOOD ADMIN" | QA-14 |
| T-002.9 | BE `AdminTopbar.tsx` | Ô tìm nhanh thành `<form role="search">` → `/admin/orders?q=`; đang ở trang đơn thì phát `ADMIN_ORDER_SEARCH_EVENT` | QA-14 |
| T-002.9 | BE `app/admin/orders/page.tsx`, `adminOrderUi.ts` | Đọc `?q=` lúc vào trang + nghe sự kiện tìm nhanh | QA-14 |
| T-002.9 | BE `app/admin/packages/page.tsx`, `packages/services/page.tsx` | "Thời gian giao" (mặc định "1 - 2 ngày"), placeholder slug/giá/số người theo đặc sản, "Ảnh đại diện (URL)" | QA-14 |
| T-002.9 | BE `app/admin/local-specialties/page.tsx`, `app/admin/posts/page.tsx` | Nhãn/placeholder ảnh có dấu | QA-14 |
| T-002.9 | BE `app/admin/banners/details/page.tsx` | Ví dụ Sơn La thay cho Hạ Long / `/goi-du-lich/...` | QA-14 |
| T-002.9 | BE `AdminContext.tsx:714` | `duration ?? ""` | QA-14 |
| T-002.10 | — | Không sửa code. Kiểm thử tổng thể + dọn dữ liệu test (xem status.md) | |
| T-003.1 | BE `app/api/admin/packages/route.ts`, `app/api/admin/posts/route.ts` | Bỏ kiểm tra bản dịch EN/ZH bắt buộc ở POST/PUT; locale trống không tạo/ghi đè ContentTranslation | CR-003 |
| T-003.1 | BE `app/admin/packages/page.tsx` | `PackageTranslationFields` bỏ `required`, ghi chú "Không bắt buộc…" | CR-003 |
| T-003.1 | BE `tests/api/admin-translations.test.ts` | 5 test API mới (TDD) | CR-003 |
| T-003.2 | FE `app/{dac-san,combo-dac-san,tin-tuc,lien-he}/page.tsx` | `export const metadata` → `generateMetadata()` dùng `getPageTranslator(ns)` (ns: localSpecialty / packages / news / contact), khoá `meta_title`, `meta_description` | CR-003 |
| T-003.2 | FE `lib/i18n/defaults.ts` | Thêm 8 khoá vi/en/zh-CN cho tiêu đề/mô tả 4 trang | CR-003 |
| T-003.3 | BE `app/components/admin/adminImageFallback.ts` (mới) | `handleAdminImageError`: ảnh lỗi → logo `/sonla-logo-readable.png`, `object-fit: contain`, chỉ đổi 1 lần | CR-003 |
| T-003.3 | BE `app/admin/{packages,local-specialties,posts}/page.tsx`, `banners/BannerManagerPage.tsx`, `interactions/reviews/page.tsx`, `system/media/page.tsx` | `<img>` trong danh sách dùng `onError={handleAdminImageError}` (posts/banner trước đây ẩn ảnh lỗi) | CR-003 |
| T-003.3 | BE `tests/unit/adminImageFallback.test.ts` | 2 unit test | CR-003 |
| T-003.4 | BE `app/components/admin/adminBreadcrumb.ts` (mới) | `buildAdminBreadcrumb(path, override)` + sự kiện `admin-breadcrumb-label`; đoạn số chưa có nhãn hiện `#id` | CR-003 |
| T-003.4 | BE `AdminTopbar.tsx`, `app/admin/orders/[id]/page.tsx` | Topbar nghe sự kiện; trang chi tiết đơn gửi mã đơn khi tải xong, xoá khi rời trang | CR-003 |
| T-003.4 | BE `tests/unit/adminBreadcrumb.test.ts` | 3 unit test | CR-003 |
| T-003.5 | BE `app/components/AdminPanel.tsx` | Xoá (271 dòng, grep không còn import) | CR-003 |
| T-003.6 | — | Không sửa code. Kiểm thử tổng thể + dọn dữ liệu test (xem status.md) | CR-003 |
