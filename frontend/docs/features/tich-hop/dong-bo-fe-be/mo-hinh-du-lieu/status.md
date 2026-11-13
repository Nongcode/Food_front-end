# Status — Tài khoản khách, đơn hàng, yêu cầu tư vấn

> Nguồn sự thật để tiếp tục công việc. Cập nhật NGAY sau mỗi task.

## Tóm tắt nhanh

| Mục | Giá trị |
|---|---|
| Trạng thái | 🟡 IN_PROGRESS |
| Yêu cầu đang làm | CR-001 — Tài khoản, đơn hàng, yêu cầu tư vấn |
| Bước Superpowers | finishing-a-development-branch (review cuối xong) |
| Task đang làm | — (14/14 xong) |
| **Bước tiếp theo** | finishing-a-development-branch — chờ người dùng chọn cách tích hợp / commit FE |
| Branch | FE `feature/tai-khoan-don-hang` (chưa commit); BE `feature/tai-khoan-don-hang` (git init ở Task 1) |
| Cập nhật lần cuối | 2026-11-11 12:30 |
| Ghi chú dở dang | Spec bao trùm cả 3 con: mo-hinh-du-lieu, api-backend, fe-dung-api |

## File chính

| File | Vai trò |
|---|---|
| BE `prisma/schema.prisma` | Customer, Order, OrderItem, Inquiry, giá |
| BE `lib/auth.ts` | Hash mật khẩu, token admin |
| BE `app/api/public/_data.ts` | Payload public (thêm `price`) |
| FE `app/components/CartClient.tsx` | Giỏ hàng, gửi đơn |
| FE `lib/customerSession.ts`, `lib/customerOrders.ts` | Phiên khách + gọi API đơn/tư vấn |

## Yêu cầu

### CR-001 — Tài khoản, đơn hàng, yêu cầu tư vấn · 🟡 IN_PROGRESS · 2026-11-11

| ID | Task | Giai đoạn | Trạng thái | Test | Ghi chú |
|---|---|---|---|---|---|
| T-001.1 | Sao lưu, khung test, `lib/orderStatus.ts` | A | ✅ DONE | test:unit 3/3 ✅. Bỏ qua Playwright: chỉ thêm lib + khung test | BE git init (main f01417c, branch feature/tai-khoan-don-hang); backup .tgz 10:45 |
| T-001.2 | Schema Prisma + db push | A | ✅ DONE | schema.test 1/1 ✅, prisma validate ✅, db push không mất dữ liệu. Bỏ qua Playwright: chỉ đổi DB | Đã db push + generate DB local; restart BE dev |
| T-001.3 | Giá dạng số, backfill, payload | A | ✅ DONE | test:unit 12/12 ✅; curl payload có priceValue ✅. Bỏ qua Playwright: FE chưa dùng trường mới, chuỗi giá cũ không đổi | Backfill DB local: 9 combo + 4 đặc sản; `xoai-tron-yen-chau` ("Theo mùa") cần admin nhập tay |
| T-001.4 | Xác thực khách hàng | B | ✅ DONE | API test auth 8/8, unit 12/12, tsc sạch. Bỏ qua Playwright: chỉ API, FE chưa gọi | lib/customerAuth.ts, app/api/auth/{register,login,logout,me}/route.ts |
| T-001.5 | Đơn hàng phía khách | B | ✅ DONE | unit 17/17, API 16/16 (orders 7/7), tsc sạch, curl order-settings 200/POST orders 401. Bỏ qua Playwright: chỉ API, FE chưa gọi | lib/orders.ts, app/api/orders/route.ts, app/api/orders/[code]/route.ts, app/api/public/order-settings/route.ts |
| T-001.6 | Yêu cầu tư vấn phía khách | B | ✅ DONE | API 20/20 (inquiries 4/4), tsc sạch. Bỏ qua Playwright: chỉ API, FE chưa gọi | app/api/inquiries/route.ts |
| T-001.7 | API admin | B | ✅ DONE | unit 18/18, API 27/27 (admin-orders 7/7), tsc sạch; curl PUT package priceValue 123000 → public payload 123000, 'abc' → 400. Bỏ qua Playwright: chỉ API, UI admin làm ở Task 12-13 | app/api/admin/orders, app/api/admin/inquiries, lib/adminOrders.ts, lib/price.ts parsePriceValue, admin customers/settings/packages/local-specialties |
| T-001.8 | Phiên khách ở FE | C | ✅ DONE | tsc sạch; lint: file đã sửa chỉ còn lỗi CartClient:120 có từ trước; Playwright TC-08 đạt (đăng ký→/en/tai-khoan, header 'P', next=/en/gio-hang giữ tiền tố, next=//evil.com→/en/tai-khoan, sai mật khẩu hiện chuỗi BE, email hoa/khoảng trắng OK, reload giữ phiên, 3 key demo bị xoá). Ảnh screenshots/T-001.8-dang-ky-thanh-cong.png | lib/customerSession.ts, lib/orderStatus.ts; AuthClient, SiteHeader, LeadForm, CartClient, ProfileClient dùng customerSession; xoá authStorage.ts; BE GET /api/auth/me trả data null khi chưa đăng nhập (9092249) |
| T-001.9 | Trang tài khoản + đơn | C | ✅ DONE | tsc+eslint sạch; Playwright TC-09 đạt (đơn SLF-20261111-0001 hiện 'Chờ xác nhận' → huỷ có lý do → 'Đã huỷ', nút huỷ ẩn; sửa SĐT tải lại vẫn giữ; console 0 lỗi) — screenshots/T-001.9-don-da-huy.png | Trang tài khoản có tab Hồ sơ / Đơn hàng của tôi, danh sách đơn + huỷ đơn có lý do, danh sách yêu cầu tư vấn |
| T-001.10 | Giỏ hàng gửi đơn thật | C | ✅ DONE | tsc+eslint sạch; grep parseCartPrice//api/bookings chỉ còn LeadForm; Playwright TC-10 đạt (combo 590.000đ + xoài 'Giá liên hệ', phí 30.000đ, tổng 620.000đ '(chưa gồm món giá liên hệ)' → SLF-20261111-0002 'Chờ xác nhận', giỏ trống, tổng khớp BE); TC-11 đạt (slug giả → 'Sản phẩm không còn bán: khong-ton-tai', giỏ còn; xoá cookie → /en/dang-nhap?next=/en/gio-hang, giỏ còn). Console chỉ có log 400/401 của chính nhánh lỗi — screenshots/T-001.10-gui-don-thanh-cong.png | Giỏ hàng gửi POST /api/orders, phí đóng gói từ API, giá từ priceValue; bỏ lịch sử/huỷ/sửa đơn giả trong localStorage |
| T-001.11 | Form tư vấn → /api/inquiries | C | ✅ DONE | tsc+eslint sạch; grep /api/bookings trong app lib → không còn; Playwright TC-12 đạt (/en/lien-he gửi 'Tư vấn combo theo ngân sách' → 'Đã ghi nhận thông tin'; /tai-khoan tab đơn thấy yêu cầu 'Chè Shan tuyết · 20 hộp · 300k/phần' trạng thái 'Mới'; console 0 lỗi) — screenshots/T-001.11-yeu-cau-tu-van.png | LeadForm gửi POST /api/inquiries với từng trường riêng; 401 → đăng nhập ?next=; link đăng nhập/đăng ký có tiền tố ngôn ngữ |
| T-001.12 | Admin đơn hàng + tư vấn | C | ✅ DONE | tsc+eslint sạch (file mới); Playwright TC-13 đạt | BE c1ffd82: /admin/orders (lọc, tìm, phân trang), /admin/orders/[id] (chuyển trạng thái, huỷ cần lý do, ghi chú), /admin/inquiries (đổi trạng thái, ghi chú); sidebar thêm 2 mục |
| T-001.13 | Admin booking lưu trữ, khách, giá, phí | C | ✅ DONE | tsc sạch; test:api 27/27, test:unit 18/18; lint: không thêm lỗi mới; Playwright TC-14 đạt | BE 874de66: /admin/bookings chỉ đọc 'Yêu cầu cũ (lưu trữ)', xoá /admin/bookings/status; khách hàng cột Có tài khoản/Số đơn (API bỏ totalBookings/totalSpent); combo + đặc sản thêm Giá (VND)/Đơn vị; cài đặt thêm Phí đóng gói (VND) |
| T-001.14 | /api/bookings 410 + nghiệm thu | C | ✅ DONE | test:unit 18/18, test:api 29/29; tsc FE+BE sạch; build FE+BE OK; Playwright TC-10/12/13 đạt (console 0 lỗi) | BE 4e1f187: /api/bookings mọi method → 410 'Chức năng này đã thay đổi. Vui lòng tải lại trang.'; dọn dữ liệu test |

Task N trong `plan.md` ↔ T-001.N.

## Kết quả test gần nhất

| Thời gian | Lệnh / kịch bản | Kết quả | Ghi chú |
|---|---|---|---|
| 2026-11-11 11:51 | BE `npm run test:unit` | ✅ 18/18 | |
| 2026-11-11 11:51 | BE `npm run test:api` | ✅ 29/29 | gồm `bookings-gone.test.ts` (410) |
| 2026-11-11 11:51 | BE `npx tsc --noEmit` · FE `npx tsc --noEmit` | ✅ sạch | |
| 2026-11-11 11:51 | FE `npm run build` · BE `npm run build` | ✅ thành công | |
| 2026-11-11 11:51 | FE `npm run lint` | ⚠️ 4 lỗi có sẵn | 1 ở script tạm `.superpowers/sdd/plan/mark.js`, 3 ở file không đụng tới (JsonLd, PackageExplorer, PostSidebar) |
| 2026-11-11 11:51 | Playwright TC-10 (giỏ → gửi đơn) | ✅ | SLF-20261111-0001, 590.000đ + giá liên hệ + phí 30.000đ = 620.000đ, giỏ trống |
| 2026-11-11 11:51 | Playwright TC-12 (yêu cầu tư vấn) | ✅ | "Đặt mua số lượng lớn" trạng thái new, thấy ở /tai-khoan |
| 2026-11-11 11:51 | Playwright TC-13 (admin chuyển trạng thái) | ✅ | Khách thấy "Đang giao", không còn nút huỷ; console 0 lỗi |
| 2026-11-11 11:51 | Playwright TC-14 (phí, giá, lưu trữ, khách hàng) | ✅ | Phí 25000 → giỏ 25.000đ; giá Xoài 120000 → giỏ 120.000đ; đã hoàn tác |

## Nhật ký phiên

- 2026-11-11 12:30 — Review cuối toàn nhánh (tự review, không có subagent): đã xem lib/orders, customerAuth, auth/*, orders/[code], inquiries, admin/orders/[id], AuthClient (?next chỉ nhận đường dẫn nội bộ). Không có Critical/Important. Để sau (minor): mã đơn bị dùng lại sau khi xoá đơn cuối ngày; test:api xoá cả domain @sonlafood.local; trang public trùng trên BE còn gọi /api/bookings (T10–T13); đăng ký bằng email khách cũ tự nhận dòng khách đó không xác minh; lỗi lint có sẵn.
- 2026-11-11 11:51 — T-001.14 ✅ DONE. BE 4e1f187: /api/bookings mọi method → 410 'Chức năng này đã thay đổi. Vui lòng tải lại trang.'; dọn dữ liệu test
- 2026-11-11 11:43 — T-001.13 ✅ DONE. BE 874de66: /admin/bookings chỉ đọc 'Yêu cầu cũ (lưu trữ)', xoá /admin/bookings/status; khách hàng cột Có tài khoản/Số đơn (API bỏ totalBookings/totalSpent); combo + đặc sản thêm Giá (VND)/Đơn vị; cài đặt thêm Phí đóng gói (VND)
- 2026-11-11 11:32 — T-001.12 ✅ DONE. BE c1ffd82: /admin/orders (lọc, tìm, phân trang), /admin/orders/[id] (chuyển trạng thái, huỷ cần lý do, ghi chú), /admin/inquiries (đổi trạng thái, ghi chú); sidebar thêm 2 mục
- 2026-11-11 11:26 — T-001.11 ✅ DONE. LeadForm gửi POST /api/inquiries với từng trường riêng; 401 → đăng nhập ?next=; link đăng nhập/đăng ký có tiền tố ngôn ngữ
- 2026-11-11 11:23 — T-001.10 ✅ DONE. Giỏ hàng gửi POST /api/orders, phí đóng gói từ API, giá từ priceValue; bỏ lịch sử/huỷ/sửa đơn giả trong localStorage
- 2026-11-11 11:16 — T-001.9 ✅ DONE. Trang tài khoản có tab Hồ sơ / Đơn hàng của tôi, danh sách đơn + huỷ đơn có lý do, danh sách yêu cầu tư vấn
- 2026-11-11 11:12 — T-001.8 ✅ DONE. lib/customerSession.ts, lib/orderStatus.ts; AuthClient, SiteHeader, LeadForm, CartClient, ProfileClient dùng customerSession; xoá authStorage.ts; BE GET /api/auth/me trả data null khi chưa đăng nhập (9092249)
- 2026-11-11 11:05 — T-001.7 ✅ DONE. app/api/admin/orders, app/api/admin/inquiries, lib/adminOrders.ts, lib/price.ts parsePriceValue, admin customers/settings/packages/local-specialties
- 2026-11-11 11:00 — T-001.6 ✅ DONE. app/api/inquiries/route.ts
- 2026-11-11 10:58 — T-001.5 ✅ DONE. lib/orders.ts, app/api/orders/route.ts, app/api/orders/[code]/route.ts, app/api/public/order-settings/route.ts
- 2026-11-11 10:55 — T-001.4 ✅ DONE. lib/customerAuth.ts, app/api/auth/{register,login,logout,me}/route.ts
- 2026-11-11 10:51 — T-001.3 ✅ DONE. Backfill DB local: 9 combo + 4 đặc sản; `xoai-tron-yen-chau` ("Theo mùa") cần admin nhập tay
- 2026-11-11 10:49 — T-001.2 ✅ DONE. Đã db push + generate DB local; restart BE dev
- 2026-11-11 10:46 — T-001.1 ✅ DONE. BE git init (main f01417c, branch feature/tai-khoan-don-hang); backup .tgz 10:45
- 2026-11-11 12:20 — Viết `plan.md` (14 task, 3 giai đoạn). Chờ duyệt.
- 2026-11-11 11:55 — Brainstorming xong Phần 1–3 (người dùng duyệt từng phần). Ghi spec vào `design.md`.
