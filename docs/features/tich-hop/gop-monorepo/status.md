# Status — Gộp FE và BE về một repo (monorepo)

> Nguồn sự thật để tiếp tục công việc. Cập nhật NGAY sau mỗi task.
> Khi tiếp tục: đọc "Tóm tắt nhanh" + "File chính" là đủ, không cần đọc lại toàn bộ code.

## Tóm tắt nhanh

| Mục | Giá trị |
|---|---|
| Trạng thái | 🟡 IN_PROGRESS |
| Yêu cầu đang làm | CR-001 — Gộp FE + BE thành monorepo (cách A) |
| Bước Superpowers | Không áp dụng đủ chuỗi (thay đổi cấu trúc repo, không thêm màn hình/API/model) |
| Task đang làm | T-001.5 |
| **Bước tiếp theo** | T-001.5 — chép .env, npm run install:all, typecheck/lint/build/test, Playwright TC-01→04 |
| Branch | FE/BE `feature/tai-khoan-don-hang` → `main`; repo mới `D:\Duc-TPE\sonla-food` nhánh `main` |
| Cập nhật lần cuối | 2026-11-13 14:26 |
| Ghi chú dở dang | Từ T-001.4, tài liệu này nằm ở D:/Duc-TPE/sonla-food/docs/features/tich-hop/gop-monorepo (bản trong sonla-food-frontend là cũ) |

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
| T-001.1 | Commit FE + merge feature → main ở FE, BE | ✅ DONE | Bỏ qua Playwright: chỉ commit/merge, không đổi code (đã test ở T-003.6). FE `npx tsc --noEmit` trên main sạch; git status FE/BE sạch | FE 7aa017a (code) + b310641 (docs), main ff → b310641; BE main ff → 15437d3. Không push |
| T-001.2 | Tạo repo `sonla-food` giữ lịch sử | ✅ DONE | Bỏ qua Playwright: chỉ thao tác git. 406 file track (162 FE + 243 BE + .gitignore), 36 commit; git blame frontend/app/page.tsx ra commit FE (a7140ad, 82a6e9a, 7aa017a); git log --follow backend/prisma/schema.prisma qua mốc gộp | Mốc gộp: f53d029 (frontend/), commit tương ứng BE. Lưu ý: --follow có thể lẫn commit repo kia khi trùng tên file (vd app/page.tsx) — dùng git blame / git log -- <đường dẫn cũ>. Đã xoá _tmp_monorepo |
| T-001.3 | `package.json` gốc + `scripts/dev.mjs` + README | ✅ DONE | Bỏ qua Playwright: chỉ thêm cấu hình/lệnh, chạy thật ở T-001.5. node --check dev.mjs OK; npm run liệt kê 11 lệnh | Commit 11f71d2. Thêm frontend/.env.example, backend/.env.example (git add -f, giá trị mẫu) |
| T-001.4 | Chuyển `CLAUDE.md` + `docs/features` lên gốc | ✅ DONE | Bỏ qua Playwright: chỉ tài liệu. Kiểm: docs chỉ còn ở gốc (frontend/docs không còn), CLAUDE.md gốc có mục Cấu trúc repo + lệnh gốc | git mv frontend/docs → docs, frontend/CLAUDE.md → CLAUDE.md (frontend/CLAUDE.md mới = @AGENTS.md; backend giữ nguyên). AGENTS.md gốc trỏ tới node_modules của từng app. Memory chép sang projects/D--Duc-TPE-sonla-food |
| T-001.5 | Cài đặt + kiểm thử (tsc, lint, build, test BE, Playwright) | ⬜ TODO | | |
| T-001.6 | Chốt + bàn giao | ⬜ TODO | | |

## Kết quả test gần nhất

| Thời gian | Lệnh / kịch bản | Kết quả | Ghi chú |
|---|---|---|---|

## Nhật ký phiên

- 2026-11-13 14:20 — Khảo sát 2 repo (cùng Next 16.2.6/React 19.2.4; BE không có remote; FE remote `Nongcode/Food_front-end`; main là tổ tiên của feature ở cả hai). Người dùng chốt: thư mục mới, commit + merge main, không workspaces. Lập plan CR-001.
- 2026-11-13 14:24 — T-001.1 ✅: FE commit 7aa017a + b310641, main FE/BE fast-forward. Không push.
- 2026-11-13 14:24 — T-001.2 ✅: tạo D:/Duc-TPE/sonla-food (main), pull lịch sử FE + BE. Không thêm .gitattributes (giữ core.autocrlf như cũ).
- 2026-11-13 14:25 — T-001.3 ✅: package.json gốc, scripts/dev.mjs, README, .env.example (commit 11f71d2).
- 2026-11-13 14:26 — T-001.4 ✅: docs/features + CLAUDE.md lên gốc monorepo; AGENTS.md gốc; memory chép sang project mới.
