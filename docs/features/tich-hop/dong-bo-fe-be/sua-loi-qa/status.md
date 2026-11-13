# Status — Sửa lỗi tồn đọng sau QA

> Nguồn sự thật để tiếp tục công việc. Cập nhật NGAY sau mỗi task.
> Khi tiếp tục: đọc "Tóm tắt nhanh" + "File chính" là đủ, không cần đọc lại toàn bộ code.

## Tóm tắt nhanh

| Mục | Giá trị |
|---|---|
| Trạng thái | ✅ DONE |
| Yêu cầu đang làm | — (CR-002 ✅, CR-003 ✅ DONE) |
| Bước Superpowers | Không áp dụng đủ chuỗi (sửa lỗi, người dùng duyệt làm luôn); lỗi logic BE làm TDD |
| Task đang làm | — |
| **Bước tiếp theo** | CR-003 hoàn tất, chờ người dùng xem |
| Branch | FE `feature/tai-khoan-don-hang` (không commit); BE `feature/tai-khoan-don-hang` |
| Cập nhật lần cuối | 2026-11-11 16:44 |
| Ghi chú dở dang | Không |

## File chính

| File | Vai trò |
|---|---|
| BE `next.config.ts` · FE `next.config.ts` | assetPrefix / rewrite admin qua cổng FE |
| BE `lib/orders.ts` | Lọc trường nội bộ khỏi response khách |
| BE `app/api/public/cart-prices/route.ts` | Giá thật cho giỏ hàng |
| FE `app/components/CartClient.tsx` | Giỏ hàng |
| FE `proxy.ts` | Locale + cookie `NEXT_LOCALE` |
| FE `lib/i18n/defaults.ts` | Từ điển giao diện |

## Yêu cầu

### CR-002 — Admin qua cổng FE + sửa lỗi QA · ✅ DONE · 2026-11-11

| ID | Task | Trạng thái | Test | Ghi chú |
|---|---|---|---|---|
| T-002.1 | (QA-01) Admin qua cổng FE | ✅ DONE | Playwright TC-01: đăng nhập admin qua :3000 và :3001, mở Đơn hàng/Yêu cầu tư vấn/Combo/Cài đặt — console 0 lỗi, 0 HTTP ≥400; HMR ws qua :3000 OK; font 200; /_next/image 200; tsc FE+BE sạch. Ảnh screenshots/T-002.1-admin-qua-cong-3000.png | BE 3c0759c: assetPrefix /be-static; FE rewrite /be-static; admin login không gọi /api/admin/me |
| T-002.2 | (QA-02) Không lộ `adminNote` | ✅ DONE | TDD: 2 test mới FAIL trước khi sửa (11/13) → sau sửa test:api 31/31 ✅, test:unit 18/18 ✅, tsc BE sạch, eslint không thêm lỗi mới. Bỏ qua Playwright: chỉ đổi dữ liệu JSON trả về, FE không dùng adminNote (grep) | BE 2c3b028: GET/POST /api/orders, PATCH /api/orders/:code, GET/POST /api/inquiries bỏ adminNote |
| T-002.3 | (QA-04, QA-05) Form admin combo/đặc sản | ✅ DONE | Playwright TC-03 qua :3000: combo 'Bộ gia vị chẩm chéo và mắc khén' (Đang mở) → select 'Đang mở', Lưu PUT 200, so sánh DB trước/sau: không đổi trường nào; đặc sản Chè Shan tuyết → select DRINK 'Đồ uống / trà', danh sách hiện Trái cây/Đồ uống/Gia vị/Món ăn/Đồ khô; PUT gửi type DRINK, giá giữ (request bị chặn, không ghi DB). tsc sạch, lint không thêm lỗi. Ảnh T-002.3-*.png | BE 00263f8. Bản dịch tạm (ContentTranslation id 1,2 của package 3) tạo khi test đã xoá |
| T-002.4 | (QA-06, QA-07) Giá lệch giỏ hàng / chi tiết | ✅ DONE | BE: TDD cart-prices FAIL→PASS, test:api 34/34, test:unit 18/18. FE tsc sạch. Playwright :3000: giỏ sửa tay giá Pa pỉnh tộp 1.000đ → hiện 180.000đ/phần, localStorage ghi lại 180000, có thông báo giá đổi; món slug không tồn tại → 'Không còn bán', nút đặt bị khoá, xoá món → mở lại; tổng 950.000đ+30.000đ đúng. Gửi đơn với response BE bị sửa tổng +10.000đ (page.route) → hiện thông báo 'Tổng do cửa hàng tính là 220.000đ, khác … (210.000đ)'. Trang chi tiết: pa-pinh-top 180.000đ/phần, xoài 'Theo mùa', combo 590.000đ. Console 0 lỗi. Ảnh T-002.4-*.png | BE 6e99db6; FE CartClient, customerOrders, 2 trang chi tiết, defaults.ts. Đơn test SLF-20261111-0001 của khách 171 (qa+3333@sonlafood.local) — dọn ở T-002.10 |
| T-002.5 | (QA-15, QA-13) Vỡ dấu, validate, điều hướng | ✅ DONE | BE TDD: test ngày sinh FAIL (201≠400) → PASS; test:unit 18/18, test:api 35/35, tsc sạch, eslint các file đã sửa 21 vấn đề trước = 21 sau (có sẵn). FE tsc sạch, eslint các file đã sửa 0 lỗi. Playwright :3000: /dang-ky bấm Tạo tài khoản khi trống → 6 lỗi đúng trường, focus 'name'; ngày sinh 2099 → 'Ngày sinh không được ở tương lai.'; đăng ký OK → /tai-khoan; PATCH /api/auth/me ngày 2099 → 400 đúng thông báo; đã đăng nhập vào /dang-nhap → /tai-khoan, /en/dang-nhap → /en/tai-khoan; hồ sơ: ô ngày sinh max=hôm nay (trình duyệt chặn gửi); form tư vấn: notes maxlength 2000, SĐT '123' + chưa chọn nhu cầu → lỗi dưới 2 trường; Đăng xuất → '/'. Console 0 lỗi (ngoài 400 cố ý). Ảnh T-002.5-*.png | BE f280768. Test auth chạy cleanupTestData đã xoá khách 171 + đơn SLF-20261111-0001; tạo lại khách qa+3333@sonlafood.local qua UI |
| T-002.6 | (QA-03) Ưu tiên ngôn ngữ chọn thủ công | ✅ DONE | tsc sạch; eslint 3 file: 0 lỗi. Playwright context Accept-Language en-US: chưa có cookie '/' → /en (như cũ); chọn Tiếng Việt → '/' và cookie NEXT_LOCALE=vi; vào lại /combo-dac-san → giữ nguyên tiếng Việt (trước đây bị đẩy sang /en); chọn English → /en/combo-dac-san, vào '/' → /en. Bỏ qua ảnh chụp: thay đổi chỉ là điều hướng (đã kiểm URL). | FE proxy.ts, lib/i18n/config.ts, SiteHeader.tsx |
| T-002.7 | (QA-08, QA-09) Link đặc sản + sửa đơn pending | ✅ DONE | tsc sạch; Playwright: /dac-san có 10 link /dac-san/<slug>, bấm Pa pỉnh tộp → trang chi tiết (h1 đúng); /en có 10 link /en/dac-san/; bộ lọc loại 5 loại đang có; đặt đơn SLF-20261111-0001 (id 114) → sửa người nhận → /api/orders trả tên/SĐT/địa chỉ/ghi chú mới; SĐT 12 → "Số điện thoại không hợp lệ." | Gắn LocalSpecialtyExplorer vào /dac-san; form sửa người nhận đơn pending. Ảnh T-002.7-sua-nguoi-nhan-form.png, T-002.7-sua-nguoi-nhan-xong.png |
| T-002.8 | (QA-11, QA-12) i18n + SEO | ✅ DONE | tsc FE/BE sạch; eslint file đã sửa: 0 lỗi (4 cảnh báo cũ ở tin-tuc/[id]); Playwright: /en/dang-nhap, /en/dang-ky, /zh/dang-nhap, /en/gio-hang, /en/tai-khoan (cả tab đơn) chỉ còn tên thương hiệu, tiền "đ" và dữ liệu DB; title: "Sign in \| Sơn La Food", "Pa pỉnh tộp \| Sơn La Food", trang chủ không lặp; admin "Admin \| Sơn La Food", login "Đăng nhập quản trị \| Sơn La Food"; nút/toast giỏ hàng tiếng Anh | i18n /en + title không lặp. BE commit 32cfb62. Ảnh T-002.8-en-tai-khoan.png |
| T-002.9 | (QA-10, QA-14) Ảnh dự phòng + nội dung | ✅ DONE | tsc FE/BE sạch; eslint: không lỗi mới (so từng file với HEAD ở BE; FE chỉ còn 4 cảnh báo cũ); Playwright: thẻ combo 1 + bài viết 1 có lớp logo dự phòng (ảnh chụp hiện logo); trang combo vi/en không còn "demo", /en có nội dung tiếng Anh; giỏ hàng không còn "demo"; admin: sidebar "SƠN LA FOOD ADMIN", form combo nhãn/placeholder mới, mặc định "1 - 2 ngày"; tìm nhanh SLF-20261111 → /admin/orders?q=SLF-20261111 ra đúng 1 đơn, từ khoá lạ → "Không có đơn nào" | Ảnh dự phòng + bỏ demo + nhãn admin. BE commit 15cf75f. Ảnh T-002.9-anh-du-phong.png, T-002.9-admin-tim-nhanh.png, T-002.9-admin-form-combo.png |
| T-002.10 | Kiểm thử tổng thể + dọn dữ liệu | ✅ DONE | BE test:unit 18/18, test:api 35/35, tsc sạch, lint 106 vấn đề (74 lỗi) nhưng các file sửa trong CR-002 0 lỗi mới (22 trước = 22 sau), build OK. FE tsc sạch, lint 12 vấn đề (3 lỗi đều ở file không sửa: JsonLd, PackageExplorer, PostSidebar), build OK (khi BE tắt chỉ log fetch failed, dùng dữ liệu dự phòng). Playwright: 8 trang công khai 200, thêm giỏ → đặt đơn 210.000đ (180k + 30k), khách huỷ đơn, admin xác nhận đơn → khách thấy Đã xác nhận và không còn nút sửa; console 0 lỗi | Dọn dữ liệu test xong (0 khách/đơn/yêu cầu test), phí đóng gói 30000, đã tắt dev server FE/BE |

### CR-003 — Sửa tiếp sau CR-002 · ✅ DONE · 2026-11-11

| ID | Task | Trạng thái | Test | Ghi chú |
|---|---|---|---|---|
| T-003.1 | Bản dịch EN/ZH không bắt buộc (combo, bài viết, đặc sản, banner) | ✅ DONE | test mới 5/5 (RED 5 fail → GREEN); test:unit 18/18; test:api 40/40; tsc OK; eslint 0 lỗi; Playwright: sửa giá combo 3 qua UI → 200, DB 185000, 0 bản dịch; trả 180000 | BE commit f0e1ad7. Bỏ bắt buộc bản dịch combo/bài viết. |
| T-003.2 | Metadata /dac-san, /combo-dac-san, /tin-tuc, /lien-he theo ngôn ngữ | ✅ DONE | tsc OK; eslint 0 lỗi (2 cảnh báo cũ ở tin-tuc); Playwright 12/12 URL (vi/en/zh × 4 trang) 200, title + meta description đúng ngôn ngữ | FE không commit. Metadata 4 trang qua i18n. |
| T-003.3 | Ảnh dự phòng cho <img> danh sách admin | ✅ DONE | unit mới 2/2 (RED: thiếu module → GREEN); test:unit 20/20; tsc OK; eslint 28 = 28 trước/sau (không thêm lỗi); Playwright: /admin/packages 1 ảnh lỗi (combo 13) → logo, /admin/posts 1, /admin/system/media 1; 0 ảnh vỡ còn hiển thị ở 7 trang | BE commit 56b6d87. |
| T-003.4 | Breadcrumb chi tiết đơn admin hiện mã đơn | ✅ DONE | unit mới 3/3 (RED → GREEN); test:unit 23/23; tsc OK; eslint 0 lỗi ở file sửa; Playwright: /admin/orders/134 breadcrumb Sơn La Food › Đơn hàng › SLF-20261111-0001; /admin/orders và /admin/packages/categories giữ như cũ | BE commit 0912e37. Đơn test 134 (khách qa+3333) tạo qua luồng khách FE, sẽ dọn ở T-003.6. |
| T-003.5 | Xoá AdminPanel.tsx (BE) nếu không còn dùng | ✅ DONE | grep AdminPanel chỉ còn chính file; tsc OK sau khi xoá; build kiểm ở T-003.6 | BE commit 15437d3. |
| T-003.6 | Kiểm thử tổng thể + dọn dữ liệu | ✅ DONE | BE test:unit 23/23, test:api 40/40, tsc OK, build OK, lint 74 lỗi/32 cảnh báo toàn repo (file sửa trong CR-003 không thêm lỗi); FE tsc OK, build OK, lint 3 lỗi cũ (JsonLd, PackageExplorer, PostSidebar). Playwright: đăng ký → thêm combo → đặt đơn 201 → khách thấy đơn → admin Xác nhận 200 → khách thấy Đã xác nhận; 13 URL public 200; 0 lỗi console (ngoài HMR lúc server chưa bật). Dữ liệu: 0 khách/đơn/yêu cầu test, 0 post/package/đặc sản test-*, 0 ContentTranslation mồ côi, combo 3 = 180000, phí đóng gói 30000, dev server đã tắt | Không sửa code. |

## Quyết định

- Quyết định (T-002.2): chạy `test:api` sớm (TDD). Trước khi chạy đã kiểm DB: dữ liệu `@sonlafood.local` chỉ gồm đúng khách 125 (`qa+1111`), 126 (`qa+2222`), đơn 64/65/66 (SLF-20261111-0001..0003, cả 3 của khách 125, 3+1+1 OrderItem) và yêu cầu tư vấn 24 (khách 125). `cleanupTestData` của bộ test đã xoá đúng các bản ghi này (dọn dữ liệu QA của T-002.10 coi như đã xong phần này; sẽ kiểm lại ở T-002.10).
- Quyết định (T-002.3): giữ "Đang mở" là một lựa chọn riêng (dữ liệu thật đang dùng, `isOrderablePackage` coi như "Đang mở bán") thay vì tự đổi dữ liệu DB; ngoài ra select luôn chèn giá trị hiện tại nếu lạ.
- `/api/auth/me`, `/api/auth/login`, `/api/auth/register` đã dùng `toPublicCustomer` (chỉ id, name, email, phone, address, birthday) — không lộ trường nội bộ của Customer.
- Quyết định (T-002.7): `/dac-san` trước đây chỉ hiện combo (`PackageExplorer`); `LocalSpecialtyExplorer` có sẵn nhưng không được dùng ở đâu. Đã gắn nó bên dưới danh sách combo trên `/dac-san` (thay vì làm trang mới) để mỗi đặc sản có link tới `/dac-san/[slug]`. Trang chủ giữ nguyên (chỉ có mục combo), link vào đặc sản đi qua menu "Sản phẩm đặc sản". Sitemap đã có sẵn `/dac-san/<slug>` nên không sửa.
- Quyết định (T-002.7): kiểm tra SĐT khi sửa người nhận dựa vào BE (trả 400 "Số điện thoại không hợp lệ." hiện trong form) — không lặp lại regex ở client.
- Quyết định (T-002.8): nguyên nhân chính khiến /en vẫn hiện tiếng Việt là `app/layout.tsx` chỉ đưa bản dịch từ BE vào `I18nProvider`, không gộp bản mặc định của FE (`defaults.ts`). Đã gộp (FE mặc định, BE ghi đè) — admin vẫn sửa được bản dịch.
- Quyết định (T-002.8): không dịch dữ liệu DB (tên/mô tả sản phẩm, đơn vị "phần", nội dung footer lấy từ cài đặt siteChrome trong DB, tên/địa chỉ khách). Tiền vẫn hiển thị "đ" ở mọi ngôn ngữ.
- Quyết định (T-002.8): title — layout gốc đã có template "%s | Sơn La Food" nên `pageTitle()` (lib/seo.ts) bỏ hậu tố trùng; tiêu đề có sẵn tên site (trang chủ) dùng `absolute`. Admin BE: `title: { default: "Admin", template: "%s | Sơn La Food" }`.
- Quyết định (T-002.9): ảnh dự phòng làm bằng nhiều lớp `background-image` (ảnh chính trên, logo `/sonla-logo-readable.png` dưới) — ảnh lỗi thì lớp trên trong suốt, không cần JS `onError`. Không sửa URL ảnh trong DB.
- Quyết định (T-002.9): trường `duration` của combo được hiểu là "Thời gian giao" (khớp bộ lọc FE 1 - 2 ngày / 2 - 4 ngày / Đặt trước); mặc định form mới là "1 - 2 ngày"; khi BE trả null thì để trống (trước đây tự điền "3 ngày 2 đêm").
- Quyết định (T-002.9): ô "Tìm kiếm nhanh" admin → tìm đơn hàng (`/admin/orders?q=`, BE tìm theo mã đơn / tên người nhận / SĐT…), không ẩn.
- Quyết định (T-002.9): thêm bản tiếng Anh cho nội dung mặc định trang chi tiết combo (`lib/packageDetailContent.ts`) vì /en đang hiện nguyên tiếng Việt.
- Quyết định (T-002.10): dọn dữ liệu test bằng chính `npm run test:api` (cleanup xoá khách `@sonlafood.local` kèm đơn/yêu cầu). Trước khi chạy đã kiểm DB: chỉ có khách 199 (`qa+3333`) với đơn 114 (SLF-20261111-0001) + đơn SLF-20261111-0002 tạo trong lần Playwright cuối; khách 125/126, đơn 64–66, yêu cầu 24 đã không còn. Sau khi chạy: 0 khách test, 0 đơn, 0 yêu cầu; phí đóng gói `order_packing_fee` = 30000.
- Quyết định (T-003.1): bỏ hẳn lời gọi `validateRequiredTranslations` ở route packages/posts (POST, PUT) thay vì nới điều kiện; giữ nguyên hàm trong `lib/translation/adminContent.ts` (không còn ai gọi). Bản dịch điền một phần: lưu đúng các trường đã điền (thay toàn bộ `fields` của locale đó), trường trống hiển thị bản tiếng Việt vì `localizeContent` gộp theo từng trường. Form đặc sản, bài viết (không có ô bản dịch) và banner không có lỗi tương tự nên không sửa.
- Quyết định (T-003.1): Playwright dùng combo id 3 "Bộ gia vị chẩm chéo và mắc khén" (không phải demo-*, chưa có bản dịch) — 180000 → 185000 → trả về 180000; `priceText` không đổi; `updatedAt` thay đổi là không tránh được.
- Quyết định (T-003.2): dùng lại namespace sẵn có của từng trang (`localSpecialty`, `packages`, `news`, `contact`) với khoá `meta_title`/`meta_description`; bỏ hậu tố " | Sơn La Food" trong chuỗi vì template layout đã thêm. Admin có thể ghi đè qua bản dịch tĩnh ở BE.
- Quyết định (T-003.3): chỉ áp dụng cho ảnh trong danh sách (combo, đặc sản, bài viết, banner, avatar đánh giá, lưới media). Ảnh xem trước trong form (vừa nhập URL) và ảnh OG ở trang SEO giữ nguyên để admin thấy ngay URL mình nhập bị lỗi. Ảnh lỗi ở danh sách bài viết/banner trước đây bị ẩn, nay hiện logo cho đồng bộ.
- Quyết định (T-003.4): mã đơn chỉ có sau khi tải API, nên trang chi tiết gửi nhãn cho topbar qua sự kiện window (giống cách tìm nhanh đơn hàng đã có) thay vì gọi thêm API từ topbar. Khi chưa tải xong, breadcrumb hiện "#134" thay cho "134"; quy tắc "#id" áp dụng cho mọi đoạn số trong đường dẫn admin.
- Quyết định (T-003.6): đơn test 134 (SLF-20261111-0001) và khách 226 (qa+3333@sonlafood.local) tạo qua UI để kiểm T-003.4 và luồng chính; trước khi chạy `test:api` đã kiểm DB chỉ có đúng 2 bản ghi này, `cleanupTestData` đã xoá. Combo demo 13–17 và URL ảnh trong DB giữ nguyên.

## Việc cần người dùng

- (T-002.9) Ảnh hỏng (Unsplash trả 404, cùng ảnh `photo-1607344645866-009c7d88bc49`): **combo id 1** `combo-dac-san-son-la` (imageUrl), **combo id 13** `demo-combo-bua-com-gia-dinh` (imageUrl), **bài viết id 1** "Gợi ý chọn quà biếu đặc sản Sơn La" (imageUrl + contentImageUrl). FE đã hiện logo dự phòng; cần thay ảnh thật trong admin. Đã kiểm 20 URL (combo, bài viết, đặc sản) — còn lại đều 200.
- (T-002.9) Combo demo trong DB (CHƯA xoá, đều "Đang mở bán"): id 13 `demo-combo-bua-com-gia-dinh` (590.000đ), 14 `demo-gia-vi-mac-khen-cham-cheo` (180.000đ), 15 `demo-set-qua-moc-chau-doanh-nghiep` (890.000đ), 16 `demo-trai-cay-yen-chau-theo-mua` (320.000đ), 17 `demo-thit-gac-bep-cao-cap` (450.000đ). Người dùng quyết định giữ / đổi slug / xoá.
- (T-002.9) Danh sách admin (`/admin/packages`) vẫn hiện ảnh vỡ cho combo 13 (thẻ `<img>` admin chưa có dự phòng). `app/components/AdminPanel.tsx` (BE) không được dùng ở đâu, vẫn còn "3 ngày 2 đêm" — có thể xoá.
- (T-002.8) Metadata (title/description) của /dac-san, /combo-dac-san, /tin-tuc, /lien-he vẫn chỉ có tiếng Việt trên /en và /zh (ngoài phạm vi 4 trang đã nhận). Footer (mô tả, địa chỉ) lấy từ cài đặt DB nên chưa dịch — cần nhập bản dịch nếu muốn.
- (T-002.3, phát hiện thêm) Form sửa combo bắt buộc nhập đủ bản dịch EN/ZH ở tab ẩn: nếu combo chưa có bản dịch, bấm Lưu không có phản hồi (trình duyệt chặn ở trường bắt buộc nằm trong tab ẩn). Hiện cả 9 combo chưa có bản dịch. Cần quyết định: bỏ bắt buộc bản dịch, hoặc tự chuyển sang tab có trường thiếu và báo lỗi. Chưa sửa (ngoài phạm vi QA-04).

## Kết quả test gần nhất

| Thời gian | Lệnh / kịch bản | Kết quả | Ghi chú |
|---|---|---|---|
| 2026-11-11 16:44 | T-003.6 | ✅ | BE test:unit 23/23, test:api 40/40, tsc OK, build OK, lint 74 lỗi/32 cảnh báo toàn repo (file sửa trong CR-003 không thêm lỗi); FE tsc OK, build OK, lint 3 lỗi cũ (JsonLd, PackageExplorer, PostSidebar). Playwright: đăng ký → thêm combo → đặt đơn 201 → khách thấy đơn → admin Xác nhận 200 → khách thấy Đã xác nhận; 13 URL public 200; 0 lỗi console (ngoài HMR lúc server chưa bật). Dữ liệu: 0 khách/đơn/yêu cầu test, 0 post/package/đặc sản test-*, 0 ContentTranslation mồ côi, combo 3 = 180000, phí đóng gói 30000, dev server đã tắt |
| 2026-11-11 16:39 | T-003.5 | ✅ | grep AdminPanel chỉ còn chính file; tsc OK sau khi xoá; build kiểm ở T-003.6 |
| 2026-11-11 16:38 | T-003.4 | ✅ | unit mới 3/3 (RED → GREEN); test:unit 23/23; tsc OK; eslint 0 lỗi ở file sửa; Playwright: /admin/orders/134 breadcrumb Sơn La Food › Đơn hàng › SLF-20261111-0001; /admin/orders và /admin/packages/categories giữ như cũ |
| 2026-11-11 16:35 | T-003.3 | ✅ | unit mới 2/2 (RED: thiếu module → GREEN); test:unit 20/20; tsc OK; eslint 28 = 28 trước/sau (không thêm lỗi); Playwright: /admin/packages 1 ảnh lỗi (combo 13) → logo, /admin/posts 1, /admin/system/media 1; 0 ảnh vỡ còn hiển thị ở 7 trang |
| 2026-11-11 16:33 | T-003.2 | ✅ | tsc OK; eslint 0 lỗi (2 cảnh báo cũ ở tin-tuc); Playwright 12/12 URL (vi/en/zh × 4 trang) 200, title + meta description đúng ngôn ngữ |
| 2026-11-11 16:31 | T-003.1 | ✅ | test mới 5/5 (RED 5 fail → GREEN); test:unit 18/18; test:api 40/40; tsc OK; eslint 0 lỗi; Playwright: sửa giá combo 3 qua UI → 200, DB 185000, 0 bản dịch; trả 180000 |
| 2026-11-11 16:08 | T-002.10 | ✅ | BE test:unit 18/18, test:api 35/35, tsc sạch, lint 106 vấn đề (74 lỗi) nhưng các file sửa trong CR-002 0 lỗi mới (22 trước = 22 sau), build OK. FE tsc sạch, lint 12 vấn đề (3 lỗi đều ở file không sửa: JsonLd, PackageExplorer, PostSidebar), build OK (khi BE tắt chỉ log fetch failed, dùng dữ liệu dự phòng). Playwright: 8 trang công khai 200, thêm giỏ → đặt đơn 210.000đ (180k + 30k), khách huỷ đơn, admin xác nhận đơn → khách thấy Đã xác nhận và không còn nút sửa; console 0 lỗi |
| 2026-11-11 15:52 | T-002.9 | ✅ | tsc FE/BE sạch; eslint: không lỗi mới (so từng file với HEAD ở BE; FE chỉ còn 4 cảnh báo cũ); Playwright: thẻ combo 1 + bài viết 1 có lớp logo dự phòng (ảnh chụp hiện logo); trang combo vi/en không còn "demo", /en có nội dung tiếng Anh; giỏ hàng không còn "demo"; admin: sidebar "SƠN LA FOOD ADMIN", form combo nhãn/placeholder mới, mặc định "1 - 2 ngày"; tìm nhanh SLF-20261111 → /admin/orders?q=SLF-20261111 ra đúng 1 đơn, từ khoá lạ → "Không có đơn nào" |
| 2026-11-11 15:41 | T-002.8 | ✅ | tsc FE/BE sạch; eslint file đã sửa: 0 lỗi (4 cảnh báo cũ ở tin-tuc/[id]); Playwright: /en/dang-nhap, /en/dang-ky, /zh/dang-nhap, /en/gio-hang, /en/tai-khoan (cả tab đơn) chỉ còn tên thương hiệu, tiền "đ" và dữ liệu DB; title: "Sign in \| Sơn La Food", "Pa pỉnh tộp \| Sơn La Food", trang chủ không lặp; admin "Admin \| Sơn La Food", login "Đăng nhập quản trị \| Sơn La Food"; nút/toast giỏ hàng tiếng Anh |
| 2026-11-11 15:35 | T-002.7 | ✅ | tsc sạch; Playwright: /dac-san có 10 link /dac-san/<slug>, bấm Pa pỉnh tộp → trang chi tiết (h1 đúng); /en có 10 link /en/dac-san/; bộ lọc loại 5 loại đang có; đặt đơn SLF-20261111-0001 (id 114) → sửa người nhận → /api/orders trả tên/SĐT/địa chỉ/ghi chú mới; SĐT 12 → "Số điện thoại không hợp lệ." |
| 2026-11-11 15:26 | T-002.6 | ✅ | tsc sạch; eslint 3 file: 0 lỗi. Playwright context Accept-Language en-US: chưa có cookie '/' → /en (như cũ); chọn Tiếng Việt → '/' và cookie NEXT_LOCALE=vi; vào lại /combo-dac-san → giữ nguyên tiếng Việt (trước đây bị đẩy sang /en); chọn English → /en/combo-dac-san, vào '/' → /en. Bỏ qua ảnh chụp: thay đổi chỉ là điều hướng (đã kiểm URL). |
| 2026-11-11 15:25 | T-002.5 | ✅ | BE TDD: test ngày sinh FAIL (201≠400) → PASS; test:unit 18/18, test:api 35/35, tsc sạch, eslint các file đã sửa 21 vấn đề trước = 21 sau (có sẵn). FE tsc sạch, eslint các file đã sửa 0 lỗi. Playwright :3000: /dang-ky bấm Tạo tài khoản khi trống → 6 lỗi đúng trường, focus 'name'; ngày sinh 2099 → 'Ngày sinh không được ở tương lai.'; đăng ký OK → /tai-khoan; PATCH /api/auth/me ngày 2099 → 400 đúng thông báo; đã đăng nhập vào /dang-nhap → /tai-khoan, /en/dang-nhap → /en/tai-khoan; hồ sơ: ô ngày sinh max=hôm nay (trình duyệt chặn gửi); form tư vấn: notes maxlength 2000, SĐT '123' + chưa chọn nhu cầu → lỗi dưới 2 trường; Đăng xuất → '/'. Console 0 lỗi (ngoài 400 cố ý). Ảnh T-002.5-*.png |
| 2026-11-11 15:14 | T-002.4 | ✅ | BE: TDD cart-prices FAIL→PASS, test:api 34/34, test:unit 18/18. FE tsc sạch. Playwright :3000: giỏ sửa tay giá Pa pỉnh tộp 1.000đ → hiện 180.000đ/phần, localStorage ghi lại 180000, có thông báo giá đổi; món slug không tồn tại → 'Không còn bán', nút đặt bị khoá, xoá món → mở lại; tổng 950.000đ+30.000đ đúng. Gửi đơn với response BE bị sửa tổng +10.000đ (page.route) → hiện thông báo 'Tổng do cửa hàng tính là 220.000đ, khác … (210.000đ)'. Trang chi tiết: pa-pinh-top 180.000đ/phần, xoài 'Theo mùa', combo 590.000đ. Console 0 lỗi. Ảnh T-002.4-*.png |
| 2026-11-11 15:03 | T-002.3 | ✅ | Playwright TC-03 qua :3000: combo 'Bộ gia vị chẩm chéo và mắc khén' (Đang mở) → select 'Đang mở', Lưu PUT 200, so sánh DB trước/sau: không đổi trường nào; đặc sản Chè Shan tuyết → select DRINK 'Đồ uống / trà', danh sách hiện Trái cây/Đồ uống/Gia vị/Món ăn/Đồ khô; PUT gửi type DRINK, giá giữ (request bị chặn, không ghi DB). tsc sạch, lint không thêm lỗi. Ảnh T-002.3-*.png |
| 2026-11-11 14:57 | T-002.2 | ✅ | TDD: 2 test mới FAIL trước khi sửa (11/13) → sau sửa test:api 31/31 ✅, test:unit 18/18 ✅, tsc BE sạch, eslint không thêm lỗi mới. Bỏ qua Playwright: chỉ đổi dữ liệu JSON trả về, FE không dùng adminNote (grep) |
| 2026-11-11 14:52 | T-002.1 | ✅ | Playwright TC-01: đăng nhập admin qua :3000 và :3001, mở Đơn hàng/Yêu cầu tư vấn/Combo/Cài đặt — console 0 lỗi, 0 HTTP ≥400; HMR ws qua :3000 OK; font 200; /_next/image 200; tsc FE+BE sạch. Ảnh screenshots/T-002.1-admin-qua-cong-3000.png |

## Nhật ký phiên

- 2026-11-11 16:44 — T-003.6 ✅ DONE. Không sửa code.
- 2026-11-11 16:39 — T-003.5 ✅ DONE. BE commit 15437d3.
- 2026-11-11 16:38 — T-003.4 ✅ DONE. BE commit 0912e37. Đơn test 134 (khách qa+3333) tạo qua luồng khách FE, sẽ dọn ở T-003.6.
- 2026-11-11 16:35 — T-003.3 ✅ DONE. BE commit 56b6d87.
- 2026-11-11 16:33 — T-003.2 ✅ DONE. FE không commit. Metadata 4 trang qua i18n.
- 2026-11-11 16:31 — T-003.1 ✅ DONE. BE commit f0e1ad7. Bỏ bắt buộc bản dịch combo/bài viết.
- 2026-11-11 16:08 — T-002.10 ✅ DONE. Dọn dữ liệu test xong (0 khách/đơn/yêu cầu test), phí đóng gói 30000, đã tắt dev server FE/BE
- 2026-11-11 15:52 — T-002.9 ✅ DONE. Ảnh dự phòng + bỏ demo + nhãn admin. BE commit 15cf75f. Ảnh T-002.9-anh-du-phong.png, T-002.9-admin-tim-nhanh.png, T-002.9-admin-form-combo.png
- 2026-11-11 15:41 — T-002.8 ✅ DONE. i18n /en + title không lặp. BE commit 32cfb62. Ảnh T-002.8-en-tai-khoan.png
- 2026-11-11 15:35 — T-002.7 ✅ DONE. Gắn LocalSpecialtyExplorer vào /dac-san; form sửa người nhận đơn pending. Ảnh T-002.7-sua-nguoi-nhan-form.png, T-002.7-sua-nguoi-nhan-xong.png
- 2026-11-11 15:26 — T-002.6 ✅ DONE. FE proxy.ts, lib/i18n/config.ts, SiteHeader.tsx
- 2026-11-11 15:25 — T-002.5 ✅ DONE. BE f280768. Test auth chạy cleanupTestData đã xoá khách 171 + đơn SLF-20261111-0001; tạo lại khách qa+3333@sonlafood.local qua UI
- 2026-11-11 15:14 — T-002.4 ✅ DONE. BE 6e99db6; FE CartClient, customerOrders, 2 trang chi tiết, defaults.ts. Đơn test SLF-20261111-0001 của khách 171 (qa+3333@sonlafood.local) — dọn ở T-002.10
- 2026-11-11 15:03 — T-002.3 ✅ DONE. BE 00263f8. Bản dịch tạm (ContentTranslation id 1,2 của package 3) tạo khi test đã xoá
- 2026-11-11 14:57 — T-002.2 ✅ DONE. BE 2c3b028: GET/POST /api/orders, PATCH /api/orders/:code, GET/POST /api/inquiries bỏ adminNote
- 2026-11-11 14:52 — T-002.1 ✅ DONE. BE 3c0759c: assetPrefix /be-static; FE rewrite /be-static; admin login không gọi /api/admin/me
- 2026-11-11 14:42 — Tạo folder, lập kế hoạch CR-002 (10 task). Người dùng đã duyệt làm luôn.
