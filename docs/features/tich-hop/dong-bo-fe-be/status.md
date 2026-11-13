# Status — Đồng bộ FE ↔ BE

> Nguồn sự thật để tiếp tục công việc. Cập nhật NGAY sau mỗi task.

## Tóm tắt nhanh

| Mục | Giá trị |
|---|---|
| Trạng thái | 🟡 IN_PROGRESS |
| Yêu cầu đang làm | Con `mo-hinh-du-lieu` CR-001 — đã xong 14/14 task, chờ review cuối |
| Bước Superpowers | executing-plans → review cuối → finishing-a-development-branch |
| Task đang làm | xem `mo-hinh-du-lieu/status.md` |
| **Bước tiếp theo** | Review cuối CR-001, rồi người dùng quyết định commit FE / merge nhánh |
| Branch | FE `feature/tai-khoan-don-hang` (chưa commit); BE `feature/tai-khoan-don-hang` (4e1f187) |
| Cập nhật lần cuối | 2026-11-11 11:51 |
| Ghi chú dở dang | T15 (deploy) chờ người dùng xác nhận cấu hình server; T18 làm trong `sua-loi-qa` (T-002.1) |

## File chính

| File | Vai trò |
|---|---|
| FE `next.config.ts` | Rewrite /api, /admin sang BE |
| FE `proxy.ts` | Locale + (cũ) kiểm tra admin_token |
| FE `lib/publicApi.ts` | Gọi API public BE |
| BE `prisma/schema.prisma` | Model dữ liệu |
| BE `app/api/public/_data.ts` | Payload API public |
| BE `app/api/bookings/route.ts` | Đã đóng (410); đơn → `/api/orders`, tư vấn → `/api/inquiries` |

## Chức năng con

| Chức năng con | Trạng thái | Bước tiếp theo |
|---|---|---|
| [sua-loi-nhanh](sua-loi-nhanh/status.md) | ✅ DONE | — |
| [mo-hinh-du-lieu](mo-hinh-du-lieu/status.md) | 🟡 IN_PROGRESS | 14/14 task ✅ — review cuối + finishing (spec bao trùm cả api-backend, fe-dung-api) |
| api-backend | ✅ DONE | làm trong `mo-hinh-du-lieu` (Task 4–7) |
| fe-dung-api | ✅ DONE | làm trong `mo-hinh-du-lieu` (Task 8–14) |
| [sua-loi-qa](sua-loi-qa/status.md) | 🟡 IN_PROGRESS | CR-002: admin qua cổng FE (T18) + QA-01→QA-15 |
| don-dep-url-noi-dung | ⬜ TODO | T10–T13 |
| trien-khai | 🔴 BLOCKED | chờ người dùng mô tả cấu hình server deploy |

## Nhật ký phiên

- 2026-11-11 14:42 — Tạo `sua-loi-qa` CR-002 (admin qua cổng FE + sửa lỗi QA-01→15).
- 2026-11-11 11:51 — `mo-hinh-du-lieu` CR-001: xong 14/14 task (T1, T2, T3, T4, T6, T7, T8, T9). BE commit đến 4e1f187; FE chưa commit. `/api/bookings` trả 410.
- 2026-11-11 09:50 — Khảo sát 2 repo, lập danh sách T1–T15, init `docs/features`, backup BE.
- 2026-11-11 11:35 — `sua-loi-nhanh` CR-002 ✅ DONE (T16, T17, token admin). Phát hiện T18.
- 2026-11-11 10:35 — `sua-loi-nhanh` (CR-001) ✅ DONE. Phát hiện thêm T16: danh sách package có tên trùng ("Combo trái cây Yên Châu theo mùa") gây lỗi React key ở /lien-he.
