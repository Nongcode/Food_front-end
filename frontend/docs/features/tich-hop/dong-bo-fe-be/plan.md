# Plan — Đồng bộ FE ↔ BE

## Tổng quan

- **Mục tiêu:** Xoá các xung đột giữa `sonla-food-frontend` (FE, Next 16, cổng 3000) và `sonla-food-backend` (BE, Next 16 + Prisma, cổng 3001) để đơn hàng, tài khoản, trạng thái và nội dung khớp nhau giữa web khách và trang admin.
- **Module:** tich-hop
- **Chức năng con:** tách theo nhóm có thể làm/test/bàn giao riêng:

| Thứ tự | Folder con | Xung đột | Loại |
|---|---|---|---|
| 1 | `sua-loi-nhanh/` | T5, T14 | change nhỏ |
| 2 | `mo-hinh-du-lieu/` | T1, T4, T6, T8, T9 — chốt model Customer auth, Order/OrderItem, bộ trạng thái, giá số | new (brainstorming) |
| 3 | `api-backend/` | API auth khách + đơn hàng + yêu cầu tư vấn | new |
| 4 | `fe-dung-api/` | T2, T3, T7 — FE bỏ localStorage, gọi API | new |
| 5 | `don-dep-url-noi-dung/` | T10–T13 | change |
| — | `trien-khai/` | T15 — workflow deploy FE trùng BE | chờ người dùng quyết định |

Folder con được tạo khi bắt đầu làm.

## Danh sách xung đột (khảo sát 2026-11-11)

| ID | Mô tả | Vị trí |
|---|---|---|
| T1 | ✅ (mo-hinh-du-lieu) Đăng nhập/đăng ký khách chỉ ở localStorage, mật khẩu plain text; BE không có auth khách | FE `app/components/authStorage.ts`; BE `prisma/schema.prisma` model `Customer` |
| T2 | ✅ (mo-hinh-du-lieu) Đặt hàng báo thành công trước khi API trả về, lỗi bị nuốt; mã đơn sinh ở client | FE `app/components/CartClient.tsx` `handleOrderSubmit` |
| T3 | ✅ (mo-hinh-du-lieu) Huỷ/sửa/khôi phục đơn chỉ đổi localStorage | FE `CartClient.tsx` |
| T4 | ✅ (mo-hinh-du-lieu) Bộ trạng thái đơn FE ≠ BE | FE `ORDER_STATUS_*`; BE `app/admin/bookings/**` |
| T5 | FE thiếu `JWT_SECRET` → `proxy.ts` FE xác thực `admin_token` bằng secret mặc định → vòng lặp về `/admin/login` | FE `proxy.ts`, `lib/auth.ts` |
| T6 | ✅ (mo-hinh-du-lieu) `Booking` là model tour; giỏ hàng bị nhét vào `tourName`/`notes` | BE `schema.prisma`, `app/api/bookings/route.ts` |
| T7 | ✅ (mo-hinh-du-lieu) LeadForm và giỏ hàng dùng chung `/api/bookings` | FE `LeadForm.tsx`, `CartClient.tsx` |
| T8 | ✅ (mo-hinh-du-lieu) Giá chỉ là chuỗi `priceText`; FE parse bằng regex | FE `cartStorage.ts` `parseCartPrice` |
| T9 | ✅ (mo-hinh-du-lieu) `Customer.totalBookings` tăng theo email cho mọi yêu cầu | BE `app/api/bookings/route.ts` |
| T10 | BE còn URL `/goi-du-lich` | BE `lib/siteChromeShared.ts`, `app/sitemap.ts`, admin banners |
| T11 | Nhãn mặc định lệch ("Sản phẩm đặc sản" vs "Đặc sản Sơn La") | `lib/siteChromeShared.ts`, `lib/i18n/defaults.ts` |
| T12 | 12 slug fallback ở FE không có ở BE | FE `app/data/food.ts` |
| T13 | BE hard-code dịch review mẫu theo tên khách | BE `app/api/public/_data.ts` `getReviewsPayload` |
| T14 | Lỗi nhỏ: ReviewForm `currentTarget` null; avatar Unsplash ngẫu nhiên; default status mojibake; code admin thừa ở FE | nhiều file |
| T15 | Workflow deploy FE: `cd D:\Travel`, pm2 `travel`, cổng 3000, chạy prisma — trùng BE; trigger nhánh `master` trong khi repo dùng `main` | FE `.github/workflows/deploy.yml`, `ecosystem.config.js` |
| T16 | Package trùng tên ("Combo trái cây Yên Châu theo mùa") → lỗi trùng key React ở `/lien-he` | FE `ReviewForm`/`CustomSelect` options từ danh sách package |
| T17 | Route `GET /api/admin/banners/seed` ghi DB nhưng không kiểm tra đăng nhập | BE `app/api/admin/banners/seed/route.ts` |
| T18 | Mở `/admin/*` qua domain FE: HTML rewrite từ BE nhưng `/_next/static/*` của BE gọi về FE → 404, trang admin trống | FE `next.config.ts` rewrites; BE `next.config` (chưa có `assetPrefix`) |

## Rủi ro / câu hỏi mở

- BE **không phải git repo** → đã sao lưu `D:\Duc-TPE\_backup\sonla-food-backend-2026-11-11.tgz` trước khi sửa. Nên `git init` cho BE.
- Đổi schema Prisma sẽ được `prisma db push` khi deploy BE → cần duyệt thiết kế dữ liệu trước (giai đoạn 2).
- T15 ảnh hưởng server thật → không sửa khi chưa có xác nhận.
