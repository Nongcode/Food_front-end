# Plan — Sửa lỗi nhanh FE ↔ BE

## Tổng quan

- **Mục tiêu:** Sửa các xung đột nhỏ, không đổi mô hình dữ liệu: vòng lặp đăng nhập admin (T5) và các lỗi nhỏ (T14).
- **Module:** tich-hop / dong-bo-fe-be
- **Chức năng con:** Không tách

## Yêu cầu

### CR-001 — Sửa T5 + T14 · 2026-11-11

**Mô tả yêu cầu (nguyên văn từ người dùng):**
> hãy thực hiện như bạn đề xuất

**Phạm vi**
- Trong phạm vi: proxy FE không tự xác thực admin_token; xoá code admin thừa ở FE; lỗi `currentTarget` trong ReviewForm; bỏ avatar ngẫu nhiên khi tạo review; sửa default status mojibake trong schema.
- Ngoài phạm vi: duyệt review trước khi hiển thị, bắt đăng nhập khi gửi review (quyết định nghiệp vụ — hỏi người dùng); mọi thay đổi model dữ liệu khác.

**Cách làm:** FE chỉ chuyển tiếp `/admin/*` sang BE; BE (`proxy.ts` của BE) đã tự bảo vệ `/admin`, nên FE không cần biết `JWT_SECRET`. Nhờ vậy xoá được `lib/auth.ts`, `lib/adminAuth.ts`, `lib/adminApiSession.ts`, `lib/adminCloudinaryUpload.ts` khỏi FE (không còn ai import).

**Task**

#### T-001.1 — FE proxy bỏ kiểm tra admin_token (T5)
- File: FE `proxy.ts`; xoá FE `lib/auth.ts`, `lib/adminAuth.ts`, `lib/adminApiSession.ts`, `lib/adminCloudinaryUpload.ts`
- Các bước:
  1. Bỏ `verifyToken`, đọc cookie và khối `if (effectivePathname.startsWith("/admin"))` trong `proxy.ts`.
  2. Xoá 4 file lib admin.
  3. `npx tsc --noEmit`, `npm run lint`.
- Xong khi: type-check sạch; TC-01, TC-02 pass.

#### T-001.2 — ReviewForm báo lỗi sai sau khi gửi thành công (T14)
- File: FE `app/components/ReviewForm.tsx`
- Các bước:
  1. Lưu `const form = event.currentTarget` trước `await`, dùng `form.reset()`.
- Xong khi: TC-03 pass.

#### T-001.3 — BE không tạo avatar Unsplash ngẫu nhiên (T14)
- File: BE `app/api/reviews/route.ts`
- Các bước:
  1. Đặt `avatar: null` (FE `ReviewCarousel` đã có `FALLBACK_AVATAR`).
- Xong khi: review mới có `avatar = null`, carousel hiển thị ảnh mặc định.

#### T-001.4 — Default status mojibake trong schema (T14)
- File: BE `prisma/schema.prisma`
- Các bước:
  1. `Banner.status` default → `"Đang mở"`; `Post.status` default → `"Bản nháp"`.
  2. `npx prisma validate`.
- Xong khi: schema hợp lệ, default đúng tiếng Việt.

**Tiêu chí nghiệm thu**
- [x] Đăng nhập admin qua FE (`localhost:3000/admin/login`) vào được dashboard, không bị vòng lặp.
- [x] Chưa đăng nhập mở `/admin/dashboard` qua FE → về trang đăng nhập.
- [x] Gửi review thành công không hiện thông báo lỗi.
- [x] `npx tsc --noEmit` và `npm run lint` của FE không phát sinh lỗi mới.

**Kịch bản test (Playwright / e2e)**

| ID | Kịch bản | Kết quả mong đợi |
|---|---|---|
| TC-01 | Chưa có cookie, mở `http://localhost:3000/admin/dashboard` | Chuyển tới trang đăng nhập admin |
| TC-02 | Đăng nhập admin hợp lệ tại `http://localhost:3000/admin/login` | Vào dashboard, reload vẫn ở dashboard |
| TC-03 | Trang có ReviewForm: điền đủ, chọn combo, gửi | Không hiện lỗi "Không thể kết nối", trang reload, review mới xuất hiện |

**Rủi ro / câu hỏi mở**
- Redirect của BE dùng `request.url`; khi đi qua rewrite có thể trả về host của BE (`localhost:3001`) thay vì FE → kiểm tra trong TC-01.

### CR-002 — Sửa lỗi phát hiện thêm (T16, T17, bảo mật token admin) · 2026-11-11

**Mô tả yêu cầu (nguyên văn từ người dùng):**
> hãy thực hiện xử lý các lỗi phát hiện từ phần 1 trước khi sang phần 2 nhé

**Phạm vi**
- Trong phạm vi: T16 (tên package trùng → trùng React key), T17 (`GET /api/admin/banners/seed` không xác thực nhưng ghi DB), gia cố token admin (chỉ chấp nhận token có `aud: "admin"`; production thiếu `JWT_SECRET` thì từ chối thay vì dùng secret mặc định).
- Ngoài phạm vi: T15 (deploy — chờ người dùng); xoá dữ liệu demo trùng tên trong DB.

**Cách làm:** Khử trùng lặp tên ở component nhận danh sách (`LeadForm`, `ReviewForm`) để mọi trang gọi đều an toàn. Thêm kiểm tra `verifyAdminSession` cho route seed. Trong BE `lib/auth.ts`: `signToken` của admin login gắn `aud: "admin"`, `verifyToken` từ chối token không có `aud: "admin"` (mọi nơi gọi `verifyToken` hiện đều là admin); đọc `JWT_SECRET` lúc gọi hàm, production thiếu thì ném lỗi.

**Task**

#### T-002.1 — Khử trùng tên package trong form (T16)
- File: FE `app/components/LeadForm.tsx`, `app/components/ReviewForm.tsx`
- Các bước:
  1. `const uniquePackages = Array.from(new Set(packages))` trong LeadForm; tương tự `destinations` trong ReviewForm.
  2. Dùng danh sách đã khử trùng để render option.
- Xong khi: TC-04 pass (không còn lỗi trùng key ở /lien-he).

#### T-002.2 — Bảo vệ route seed banner (T17)
- File: BE `app/api/admin/banners/seed/route.ts`
- Các bước:
  1. Đổi `GET()` → `GET(request: NextRequest)`, trả 401 nếu `!verifyAdminSession(request)`.
- Xong khi: TC-05 pass.

#### T-002.3 — Gia cố token admin
- File: BE `lib/auth.ts`, `app/api/admin/login/route.ts`
- Các bước:
  1. `getJwtSecret()`: lấy `process.env.JWT_SECRET`; production thiếu → throw; dev thiếu → dùng secret dev cũ.
  2. Login gắn `aud: "admin"` vào payload ký token.
  3. `verifyToken` trả `null` nếu `aud !== "admin"`.
- Xong khi: TC-06, TC-07 pass; admin đăng nhập lại 1 lần (token cũ không có `aud` bị từ chối).

**Tiêu chí nghiệm thu**
- [ ] /lien-he không còn lỗi console trùng key.
- [ ] Gọi `GET /api/admin/banners/seed` khi chưa đăng nhập trả 401.
- [ ] Token admin cũ (không `aud`) bị từ chối; đăng nhập mới dùng bình thường.

**Kịch bản test (Playwright / e2e)**

| ID | Kịch bản | Kết quả mong đợi |
|---|---|---|
| TC-04 | Playwright mở `/lien-he`, mở form review, xem console + danh sách combo | Không có lỗi "same key"; mỗi tên xuất hiện 1 lần |
| TC-05 | `curl GET /api/admin/banners/seed` không cookie | 401, DB không đổi |
| TC-06 | Dùng cookie admin cũ (ký trước khi sửa) gọi `/api/admin/me` | 401 |
| TC-07 | Playwright đăng nhập admin qua FE → dashboard → reload | Ở lại dashboard |

**Rủi ro / câu hỏi mở**
- Production phải có `JWT_SECRET` trong `.env` của BE trước khi deploy, nếu không admin sẽ không đăng nhập được (cố ý: tránh dùng secret mặc định công khai trong code).
