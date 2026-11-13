# Design — Sửa lỗi nhanh FE ↔ BE

## Kiến trúc

`/admin/*` trên FE → rewrite (`next.config.ts`) → BE. BE `proxy.ts` kiểm tra `admin_token` bằng `JWT_SECRET` của BE.

## Vị trí code

| File | Symbol | Dòng | Vai trò |
|---|---|---|---|
| FE `proxy.ts` | `proxy` | L23-L110 | Locale, redirect `/goi-du-lich`, (cũ) bảo vệ /admin |
| FE `app/components/ReviewForm.tsx` | `handleSubmit` | L18-L66 | Gửi review |
| BE `app/api/reviews/route.ts` | `POST` | L35-L44 | Tạo review |
| BE `prisma/schema.prisma` | `Banner.status`, `Post.status` | L39, L196 | Default trạng thái |

## API

Không đổi API.

## Dữ liệu

Chỉ đổi giá trị default cột `banners.status`, `posts.status` (không ảnh hưởng dữ liệu cũ).

## Giao diện

Không đổi giao diện.

## Nhật ký sửa đổi

### CR-001 — Sửa T5 + T14

| Task | File:dòng | Thay đổi | Lý do |
|---|---|---|---|
| T-001.1 | FE `proxy.ts` (bỏ import `verifyToken`, đọc cookie `admin_token`, khối bảo vệ `/admin`) | FE chỉ rewrite/next, không xác thực admin | BE proxy đã bảo vệ /admin; bỏ lệ thuộc `JWT_SECRET` ở FE |
| T-001.1 | Xoá FE `lib/auth.ts`, `lib/adminAuth.ts`, `lib/adminApiSession.ts`, `lib/adminCloudinaryUpload.ts` | Xoá file | Không còn nơi import |
| T-001.2 | FE `app/components/ReviewForm.tsx` `handleSubmit` (L20, L27, L57) | Lưu `const form = event.currentTarget` trước `await`, dùng `form.reset()` | `currentTarget` thành null sau await → throw → báo lỗi sai |
| T-001.3 | BE `app/api/reviews/route.ts` L42 | `avatar: null` | URL Unsplash ngẫu nhiên → ảnh hỏng; FE đã có ảnh mặc định |
| T-001.4 | BE `prisma/schema.prisma` L39 (`Banner.status`), L204 (`Post.status`) | Default → "Đang mở", "Bản nháp" | Default bị mojibake (L39 chứa ký tự ẩn U+0090) |

### CR-002 — T16, T17, bảo mật token admin

| Task | File:dòng | Thay đổi | Lý do |
|---|---|---|---|
| T-002.1 | FE `app/components/LeadForm.tsx` (`uniquePackages`, datalist) · `app/components/ReviewForm.tsx` (options của `CustomSelect`) | `Array.from(new Set(...))` trước khi render | Package demo trùng tên → trùng React key |
| T-002.3 | BE `lib/auth.ts` L3-L17 (`ADMIN_TOKEN_AUDIENCE`, `getJwtSecret`), L53 (`signToken` tự gắn `aud`), L95-L98 (`verifyToken` kiểm `aud`) | Production thiếu `JWT_SECRET` → throw (fail-closed); token không có `aud: "admin"` bị từ chối. Route login không đổi | Tránh key mặc định ở production; tách token admin khỏi token khách hàng sắp thêm |
| T-002.2 | BE `app/api/admin/banners/seed/route.ts` L1-L3, L11-L12 | `GET(request)` + kiểm tra `verifyAdminSession`, 401 nếu chưa đăng nhập | Route ghi DB nhưng ai cũng gọi được |
