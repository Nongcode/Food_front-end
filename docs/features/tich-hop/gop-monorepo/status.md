# Status — Gộp FE và BE về một repo (monorepo)

> Nguồn sự thật để tiếp tục công việc. Cập nhật NGAY sau mỗi task.
> Khi tiếp tục: đọc "Tóm tắt nhanh" + "File chính" là đủ, không cần đọc lại toàn bộ code.

## Tóm tắt nhanh

| Mục | Giá trị |
|---|---|
| Trạng thái | 🟡 IN_PROGRESS |
| Yêu cầu đang làm | CR-001 — Gộp FE + BE thành monorepo (cách A) |
| Bước Superpowers | Không áp dụng đủ chuỗi (thay đổi cấu trúc repo, không thêm màn hình/API/model) |
| Task đang làm | T-001.1 |
| **Bước tiếp theo** | T-001.1 — commit FE trên `feature/tai-khoan-don-hang`, merge ff vào `main` ở FE và BE |
| Branch | FE/BE `feature/tai-khoan-don-hang` → `main`; repo mới `D:\Duc-TPE\sonla-food` nhánh `main` |
| Cập nhật lần cuối | 2026-11-13 14:20 |
| Ghi chú dở dang | Plan đã duyệt 2026-11-13. Sau T-001.4, folder này nằm ở `D:\Duc-TPE\sonla-food\docs\features\tich-hop\gop-monorepo\` |

## File chính

| File | Vai trò |
|---|---|
| `D:\Duc-TPE\sonla-food\package.json` | Lệnh chung |
| `D:\Duc-TPE\sonla-food\scripts\dev.mjs` | Chạy FE + BE song song |
| `D:\Duc-TPE\sonla-food\CLAUDE.md` | Quy trình + lệnh kiểm tra cho repo gộp |

## Yêu cầu

### CR-001 — Gộp FE + BE thành monorepo (cách A) · 🟡 IN_PROGRESS · 2026-11-13

| ID | Task | Trạng thái | Test | Ghi chú |
|---|---|---|---|---|
| T-001.1 | Commit FE + merge feature → main ở FE, BE | 🔄 DOING | | |
| T-001.2 | Tạo repo `sonla-food` giữ lịch sử | ⬜ TODO | | |
| T-001.3 | `package.json` gốc + `scripts/dev.mjs` + README | ⬜ TODO | | |
| T-001.4 | Chuyển `CLAUDE.md` + `docs/features` lên gốc | ⬜ TODO | | |
| T-001.5 | Cài đặt + kiểm thử (tsc, lint, build, test BE, Playwright) | ⬜ TODO | | |
| T-001.6 | Chốt + bàn giao | ⬜ TODO | | |

## Kết quả test gần nhất

| Thời gian | Lệnh / kịch bản | Kết quả | Ghi chú |
|---|---|---|---|

## Nhật ký phiên

- 2026-11-13 14:20 — Khảo sát 2 repo (cùng Next 16.2.6/React 19.2.4; BE không có remote; FE remote `Nongcode/Food_front-end`; main là tổ tiên của feature ở cả hai). Người dùng chốt: thư mục mới, commit + merge main, không workspaces. Lập plan CR-001.
