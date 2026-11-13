# Plan — Sửa lỗi tồn đọng sau QA (FE + BE)

## Tổng quan

- **Mục tiêu:** (1) Trang quản trị của BE chạy được qua cùng cổng với FE (`http://localhost:3000/admin`); (2) sửa toàn bộ lỗi QA-01 → QA-15 còn tồn đọng sau đợt QA của CR-001.
- **Module:** `tich-hop/dong-bo-fe-be/sua-loi-qa`
- **Chức năng con:** Không tách. Bao gồm T18 của folder cha (admin qua cổng FE).
- **Repo:** FE `D:\Duc-TPE\sonla-food-frontend` (không commit), BE `D:\Duc-TPE\sonla-food-backend` (commit theo từng task), cả hai ở branch `feature/tai-khoan-don-hang`.

## Yêu cầu

### CR-002 — Admin qua cổng FE + sửa lỗi QA · 2026-11-11

**Mô tả yêu cầu (nguyên văn từ người dùng, tóm lược):**
> Cho trang quản trị của BE chạy được qua cùng cổng với FE (http://localhost:3000/admin) và sửa toàn bộ lỗi còn tồn đọng từ đợt QA. Đã duyệt làm luôn.

**Phạm vi**
- Trong phạm vi: QA-01 → QA-15 (xem bảng task), dọn dữ liệu test của đợt QA.
- Ngoài phạm vi: dịch nội dung lấy từ DB (tên/mô tả sản phẩm); sửa dữ liệu DB ngoài phạm vi (ảnh hỏng, combo `demo-*` — chỉ liệt kê); workflow deploy (T15); T10–T13.

**Cách làm:** Multi-zones theo docs Next 16 (`01-app/02-guides/multi-zones.md`): BE đặt `assetPrefix: "/be-static"`, FE rewrite `/be-static/:path+` sang BE. Lỗi logic BE làm TDD (`tests/unit`, `tests/api`). FE sửa trực tiếp, kiểm bằng tsc/lint/Playwright MCP.

**Task**

#### T-002.1 — (QA-01) Admin qua cổng FE
- File: BE `next.config.ts`; FE `next.config.ts`, `proxy.ts` (matcher).
- Các bước:
  1. Đọc docs Next 16 về multi-zones / assetPrefix.
  2. BE: `assetPrefix: "/be-static"` (Next ≥15 tự phục vụ `/be-static/_next/*`, không cần rewrite ở BE).
  3. FE: thêm rewrite `/be-static/:path+` → `${backendUrl}/be-static/:path+`; loại `/be-static` khỏi matcher của `proxy.ts`.
  4. Kiểm tra: HMR (dev), font, `/_next/image` của admin, link nội bộ admin, cookie `admin_token` trên :3000; admin trên :3001 vẫn chạy.
  5. Ghi cách deploy (biến môi trường) vào design.md.
- Xong khi: Playwright đăng nhập admin qua :3000, mở Đơn hàng / Yêu cầu tư vấn / Combo / Cài đặt, console 0 lỗi.

#### T-002.2 — (QA-02, bảo mật) Không lộ `adminNote` ở API khách
- File: BE `lib/orders.ts` (hàm `toCustomerOrder`), `lib/inquiries` hoặc trong route, `app/api/orders/route.ts`, `app/api/orders/[code]/route.ts`, `app/api/inquiries/route.ts`, `tests/api/orders.test.ts`, `tests/api/inquiries.test.ts`.
- Các bước: TDD — thêm test khẳng định response GET/POST/PATCH không có `adminNote` (đơn có adminNote do admin ghi) → FAIL → thêm hàm lọc trường → PASS. Rà `/api/auth/me` (đã dùng `toPublicCustomer`).
- Xong khi: test:api pass, mọi response phía khách không có `adminNote`.

#### T-002.3 — (QA-04, QA-05) Form admin làm hỏng dữ liệu
- File: BE `app/admin/packages/page.tsx`, `app/admin/local-specialties/page.tsx`, (mới) `lib/specialtyTypes.ts`.
- Các bước:
  1. Combo: thêm "Đang mở" vào danh sách trạng thái; nếu giá trị hiện tại không có trong danh sách thì vẫn thêm vào `<select>` để không bị đổi khi Lưu.
  2. Đặc sản: danh sách loại đủ FOOD / DRY_FOOD / DRINK / SPICE / FRUIT / HANDICRAFT; nhãn danh sách theo bảng loại; giá trị lạ vẫn giữ.
- Xong khi: Playwright mở form sửa combo "Đang mở" và đặc sản DRINK → hiện đúng; Lưu không đổi giá trị (kiểm DB).

#### T-002.4 — (QA-06, QA-07) Giá lệch
- File: BE (mới) `app/api/public/cart-prices/route.ts` + `tests/api/cart-prices.test.ts`; FE `app/components/CartClient.tsx`, `lib/customerOrders.ts`, `app/dac-san/[slug]/page.tsx`, `app/combo-dac-san/[slug]/page.tsx`.
- Các bước:
  1. BE TDD: `POST /api/public/cart-prices` nhận `items[{itemType, slug}]` trả `{ itemType, slug, name, unitPrice, unit, available }` — dùng cùng logic giá với `createOrder`.
  2. FE: khi mở giỏ gọi API, cập nhật giá trong localStorage, đánh dấu món không còn bán; báo khi giá đã thay đổi.
  3. Sau khi gửi đơn: nếu `order.total` khác tổng đang hiện → báo khách tổng do cửa hàng tính.
  4. Trang chi tiết đặc sản/combo: hiện giá theo `priceValue`/`priceUnit` khi có.
- Xong khi: test:api pass; Playwright: sửa giá trong localStorage → giỏ hiện giá thật + thông báo.

#### T-002.5 — (QA-15, QA-13) Chuỗi vỡ dấu + validate + điều hướng
- File: BE `app/api/admin/users/route.ts`, `app/api/admin/register/route.ts` và các file có chuỗi vỡ dấu; BE `app/api/auth/me/route.ts`, `app/api/auth/register/route.ts`, `lib/customerAuth.ts` (`readBirthday`), `tests/api/auth.test.ts`; FE `LeadForm.tsx`, `AuthClient.tsx`, `app/dang-nhap`, `SiteHeader.tsx`/`ProfileClient.tsx` (đăng xuất).
- Các bước: sửa chuỗi UTF-8; TDD ngày sinh tương lai/không hợp lệ → 400; LeadForm maxLength 2000 + lỗi theo trường; AuthClient báo đúng trường bắt buộc; /dang-nhap khi đã đăng nhập → /tai-khoan; đăng xuất → trang chủ.
- Xong khi: test pass; Playwright các luồng trên.

#### T-002.6 — (QA-03) Ưu tiên ngôn ngữ chọn thủ công
- File: FE `proxy.ts`, `app/components/SiteHeader.tsx` (bộ chọn ngôn ngữ), `lib/i18n/config.ts` (tên cookie).
- Các bước: khi chọn ngôn ngữ ghi cookie `NEXT_LOCALE`; proxy chỉ tự chuyển theo Accept-Language khi chưa có cookie; vào URL có tiền tố ngôn ngữ cũng ghi cookie.
- Xong khi: Playwright với Accept-Language `en` chọn Tiếng Việt → ở lại bản Việt khi tải lại `/`.

#### T-002.7 — (QA-08, QA-09) Link chi tiết đặc sản + sửa đơn pending
- File: FE `LocalSpecialtyExplorer.tsx`, trang chủ (nơi hiện đặc sản), `app/sitemap.ts`, `OrderHistoryList.tsx`, `lib/customerOrders.ts`.
- Các bước: link tới `/dac-san/[slug]`; sitemap thêm đặc sản; form sửa người nhận cho đơn pending dùng PATCH `/api/orders/:code`.
- Xong khi: Playwright bấm đặc sản → trang chi tiết; sửa đơn pending → tải lại vẫn giữ.

#### T-002.8 — (QA-11, QA-12) i18n + SEO
- File: FE `lib/i18n/defaults.ts`, `CartClient.tsx`, `AuthClient.tsx`, `ProfileClient.tsx`, `OrderHistoryList.tsx`, `SiteHeader.tsx`, các `page.tsx` metadata, `app/combo-dac-san/[slug]/page.tsx`.
- Các bước: chuyển chuỗi cứng sang `t()` + thêm khoá vào `defaults.ts`; sửa title lặp; h1 combo = tên combo.
- Xong khi: /en/gio-hang, /en/dang-nhap, /en/dang-ky, /en/tai-khoan không còn chuỗi giao diện tiếng Việt (trừ nội dung DB); title không lặp.

#### T-002.9 — (QA-10, QA-14) Ảnh dự phòng + nội dung
- File: FE component ảnh (thẻ sản phẩm, bài viết, giỏ hàng), `app/gio-hang/page.tsx`, `app/combo-dac-san/[slug]/page.tsx`, `lib/packageDetailContent.ts`; BE `AdminSidebar.tsx`, `AdminTopbar.tsx`, `app/admin/packages/page.tsx`, `app/admin/local-specialties/page.tsx`, `app/admin/banners/*`.
- Các bước: ảnh dự phòng khi lỗi; bỏ chữ "demo"; đổi nhãn/placeholder admin; ô tìm kiếm nhanh → chuyển tới `/admin/orders?q=`. Liệt kê bản ghi ảnh hỏng + combo demo-* vào status.
- Xong khi: Playwright thấy ảnh dự phòng, admin hiển thị nhãn mới.

#### T-002.10 — Kiểm thử tổng thể + dọn dữ liệu
- Các bước: test:unit + test:api; tsc/lint/build 2 repo (tắt dev trước khi build); Playwright các kịch bản chính; xoá khách 125/126, đơn 64/65/66, yêu cầu 24 + dữ liệu test tự tạo (kiểm tra trước khi xoá); trả cài đặt (phí đóng gói 30000).
- Xong khi: mọi lệnh pass (trừ lỗi lint có sẵn), dữ liệu test đã dọn.

**Tiêu chí nghiệm thu**
- [ ] Admin chạy qua :3000 và :3001, console 0 lỗi
- [ ] API khách không trả `adminNote`
- [ ] Form admin không đổi dữ liệu khi Lưu không sửa
- [ ] Giỏ hàng hiện giá thật từ BE, báo khi khác
- [ ] Không còn chuỗi vỡ dấu ở BE
- [ ] Ngôn ngữ chọn thủ công được giữ
- [ ] Sửa được người nhận của đơn pending
- [ ] /en không còn chuỗi giao diện tiếng Việt ở các trang tài khoản/giỏ
- [ ] Dữ liệu test QA đã dọn

**Kịch bản test (Playwright / e2e)**

| ID | Kịch bản | Kết quả mong đợi |
|---|---|---|
| TC-01 | Mở :3000/admin → đăng nhập → Đơn hàng, Yêu cầu tư vấn, Combo, Cài đặt | Trang hiển thị đủ, console 0 lỗi |
| TC-02 | Gọi GET/POST/PATCH API khách với đơn có ghi chú admin | Không có `adminNote` |
| TC-03 | Mở form sửa combo "Đang mở", đặc sản loại DRINK → Lưu | Giá trị giữ nguyên |
| TC-04 | Sửa giá trong localStorage → mở giỏ | Giỏ hiện giá thật + thông báo |
| TC-05 | Accept-Language en, chọn Tiếng Việt → tải lại `/` | Ở lại bản Việt |
| TC-06 | Tài khoản → đơn pending → Sửa người nhận → tải lại | Thông tin mới |
| TC-07 | /en/gio-hang, /en/dang-nhap, /en/dang-ky, /en/tai-khoan | Chuỗi giao diện tiếng Anh |

**Rủi ro / câu hỏi mở**
- `test:api` xoá mọi khách `@sonlafood.local` → chạy trước Playwright hoặc tạo lại tài khoản test.
- Máy thiếu RAM → chạy dev server nền, tắt khi xong; không build khi dev cùng repo đang chạy.
- HMR qua rewrite có thể không proxy websocket → kiểm tra thực tế.

---

### CR-003 — Sửa tiếp sau CR-002 (bản dịch không bắt buộc, SEO /en /zh, ảnh dự phòng admin) · 2026-11-11

**Bối cảnh:** người dùng duyệt "làm luôn" các việc còn lại ở mục "Việc cần người dùng" của CR-002. KHÔNG xoá/đổi combo `demo-*`, KHÔNG sửa URL ảnh trong DB. Máy thiếu RAM: chỉ bật dev server khi chạy Playwright, không build khi dev server cùng repo đang chạy, tắt khi xong.

#### T-003.1 — (ưu tiên) Bản dịch EN/ZH không bắt buộc khi lưu combo / bài viết / đặc sản / banner
- Nguyên nhân (đã đọc code): BE `lib/translation/adminContent.ts` `validateRequiredTranslations` bắt đủ trường EN+ZH; `app/api/admin/packages/route.ts` (POST/PUT) và `app/api/admin/posts/route.ts` (POST/PUT) trả 400 khi thiếu. Form combo `app/admin/packages/page.tsx` `PackageTranslationFields` có `required` trên input ở tab ẩn → trình duyệt chặn submit không báo gì. Trang bài viết admin không gửi `translations` → POST bài viết mới có thể bị 400.
- Các bước (TDD): viết test API FAIL trước — (a) PUT combo chỉ đổi giá, `translations` rỗng → 200, giá mới, không tạo ContentTranslation; (b) PUT combo với bản dịch EN điền một phần → 200, chỉ lưu trường đã điền, ZH không tạo; (c) POST bài viết không có `translations` → 200/201. Sau đó bỏ kiểm tra bắt buộc ở BE, bỏ `required` ở form; kiểm form đặc sản, bài viết, banner.
- `saveContentTranslations` giữ nguyên: locale để trống → không tạo/ghi đè.
- Xong khi: test PASS + Playwright sửa giá combo chưa có bản dịch → Lưu → DB có giá mới → trả giá cũ.

#### T-003.2 — Metadata /dac-san, /combo-dac-san, /tin-tuc, /lien-he theo ngôn ngữ
- File: FE 4 `page.tsx` đó + `lib/i18n/defaults.ts`; dùng `getPageTranslator()` + `generateMetadata` như T-002.8.
- Xong khi: Playwright đọc `<title>`/description trên /en, /zh là bản dịch, bản vi giữ nguyên.

#### T-003.3 — Ảnh dự phòng cho `<img>` trong danh sách admin
- File: BE các trang admin có `<img>` (combo, đặc sản, bài viết, banner…) — dùng một component/handler `onError` chung đổi sang logo.
- Xong khi: Playwright thấy combo 13 (ảnh 404) hiện logo trong /admin/packages.

#### T-003.4 — Breadcrumb chi tiết đơn admin hiện mã đơn
- File: BE `AdminTopbar.tsx` (`getPageTitle`/breadcrumb) hoặc trang `app/admin/orders/[id]/page.tsx`.
- Xong khi: /admin/orders/<id> hiện "SLF-…" thay vì id.

#### T-003.5 — Xoá `app/components/AdminPanel.tsx` (BE) nếu không còn import
- grep xác nhận trước khi xoá; tsc sạch.

#### T-003.6 — Kiểm thử tổng thể + dọn dữ liệu
- test:unit, test:api; tsc/lint/build 2 repo (dev server tắt); Playwright luồng chính; dọn dữ liệu test; phí đóng gói 30000; tắt dev server.
