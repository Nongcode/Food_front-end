# Status — Sửa lỗi nhanh FE ↔ BE

> Nguồn sự thật để tiếp tục công việc. Cập nhật NGAY sau mỗi task.

## Tóm tắt nhanh

| Mục | Giá trị |
|---|---|
| Trạng thái | ✅ DONE |
| Yêu cầu đang làm | CR-002 — T16, T17, bảo mật token admin |
| Bước Superpowers | Không áp dụng (change nhỏ) |
| Task đang làm | — |
| **Bước tiếp theo** | — (T18 tài nguyên admin qua cổng FE ghi ở folder cha) |
| Branch | FE `main`; BE không có git (backup `D:\Duc-TPE\_backup\sonla-food-backend-2026-11-11.tgz`) |
| Cập nhật lần cuối | 2026-11-11 11:35 |
| Ghi chú dở dang | Không |

## File chính

| File | Vai trò |
|---|---|
| FE `proxy.ts` | Middleware locale + admin |
| FE `app/components/ReviewForm.tsx` | Form review |
| BE `app/api/reviews/route.ts` | API tạo review |
| BE `prisma/schema.prisma` | Schema |

## Yêu cầu

### CR-001 — Sửa T5 + T14 · ✅ DONE · 2026-11-11

| ID | Task | Trạng thái | Test | Ghi chú |
|---|---|---|---|---|
| T-001.1 | FE proxy bỏ kiểm tra admin_token, xoá lib admin thừa | ✅ DONE | curl TC-01 ✅, TC-02 ✅; tsc sạch (trừ file sinh .next cũ); Playwright gộp ở bước tổng | Redirect giữ host FE |
| T-001.2 | ReviewForm `currentTarget` null | ✅ DONE | Playwright TC-03 ✅ (screenshots/T-001.2-review-gui-thanh-cong.png) | Dữ liệu test đã xoá (review #3, customer #11) |
| T-001.3 | BE review avatar null | ✅ DONE | TC-03: `/api/public/reviews` trả `avatar: null`, carousel dùng FALLBACK_AVATAR | |
| T-001.4 | Schema default mojibake | ✅ DONE | Bỏ qua Playwright: chỉ đổi default DDL; `npx prisma validate` ✅ | Chưa `db push` local — áp dụng ở lần `npm run db:deploy` tiếp theo |

### CR-002 — T16, T17, bảo mật token admin · ✅ DONE · 2026-11-11

| ID | Task | Trạng thái | Test | Ghi chú |
|---|---|---|---|---|
| T-002.1 | Khử trùng tên package trong form (T16) | ✅ DONE | Playwright TC-04 ✅ (0 lỗi console, 9 combo không trùng) | Dữ liệu demo id 4 và 16 vẫn trùng tên trong DB |
| T-002.2 | Bảo vệ route seed banner (T17) | ✅ DONE | TC-05 curl ✅ (401 cả qua BE và FE). Bỏ qua Playwright: API không có màn hình gọi | |
| T-002.3 | Gia cố token admin (aud + JWT_SECRET) | ✅ DONE | TC-06 curl ✅; TC-07 Playwright ✅ trên BE :3001 (screenshots/T-002.3-admin-dashboard-3001.png). Qua FE :3000 trang admin không tải được JS/CSS → T18, có từ trước | Admin phải đăng nhập lại; production BẮT BUỘC đặt `JWT_SECRET` |

## Kết quả test gần nhất

| Thời gian | Lệnh / kịch bản | Kết quả | Ghi chú |
|---|---|---|---|
| 2026-11-11 10:10 | curl TC-01, TC-02 | ✅ pass | |
| 2026-11-11 10:25 | Playwright TC-03 (/en/lien-he) | ✅ pass | console còn lỗi trùng key có sẵn từ trước |
| 2026-11-11 10:35 | `npx prisma validate` (BE) | ✅ pass | |
| 2026-11-11 11:15 | Playwright TC-04 (/en/lien-he) | ✅ pass | Không còn lỗi trùng key |
| 2026-11-11 11:20 | curl TC-05 `GET /api/admin/banners/seed` không cookie | ✅ pass | 401 |
| 2026-11-11 11:30 | curl TC-06 cookie cũ → `/api/admin/me` | ✅ pass | 401; `/admin/dashboard` 307 → login |
| 2026-11-11 11:35 | Playwright TC-07 `localhost:3001/admin/login` → dashboard → reload | ✅ pass | 0 lỗi console sau đăng nhập |

## Nhật ký phiên

- 2026-11-11 09:55 — Tạo plan CR-001.
- 2026-11-11 10:10 — T-001.1 xong. TC-01: `/admin/dashboard` chưa login → 307 `localhost:3000/admin/login`. TC-02: login `admin/admin123` (seed local) qua FE → dashboard 200.
- 2026-11-11 10:25 — T-001.2, T-001.3 xong. Phát hiện thêm (ngoài phạm vi): console lỗi trùng key "Combo trái cây Yên Châu theo mùa" ở /lien-he — danh sách package có tên trùng → ghi vào T12/T16.
- 2026-11-11 10:35 — T-001.4 xong, CR-001 ✅ DONE.
- 2026-11-11 11:15 — T-002.1 xong.
- 2026-11-11 11:20 — T-002.2 xong.
- 2026-11-11 11:35 — T-002.3 xong, CR-002 ✅ DONE. Phát hiện T18: mở `/admin/*` qua FE :3000 thì HTML được rewrite từ BE nhưng `/_next/static/*` của BE bị gọi về FE → 404 (11 lỗi), form không hiển thị. Không do thay đổi lần này.
