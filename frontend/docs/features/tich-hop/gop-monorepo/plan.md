# Plan — Gộp FE và BE về một repo (monorepo)

## Tổng quan

- **Mục tiêu:** Đưa `sonla-food-frontend` và `sonla-food-backend` về một repo duy nhất `D:\Duc-TPE\sonla-food`, giữ nguyên lịch sử git của cả hai, để một thay đổi/PR có thể sửa cả FE lẫn BE và tài liệu `docs/features` chỉ còn một chỗ.
- **Module:** tich-hop
- **Chức năng con:** Không tách (6 task, một luồng tuần tự).

## Yêu cầu

### CR-001 — Gộp FE + BE thành monorepo (cách A) · 2026-11-13

**Mô tả yêu cầu (nguyên văn từ người dùng):**
> tôi muốn đưa cả back-end và front-end về cùng 1 repo được không nhỉ ? — hãy thực hiện cách A đi

Người dùng đã chốt:
- Repo mới ở thư mục mới `D:\Duc-TPE\sonla-food`; 2 repo cũ giữ nguyên làm bản dự phòng; chưa đẩy lên GitHub.
- Commit phần FE đang dở, rồi merge `feature/tai-khoan-don-hang` vào `main` ở cả FE và BE, sau đó gộp từ `main`.
- Không dùng npm workspaces: `frontend/` và `backend/` giữ `node_modules` + `package-lock.json` riêng; `package.json` gốc chỉ có lệnh chung.

**Phạm vi**
- Trong phạm vi: commit/merge 2 repo cũ (local, không push); tạo repo mới giữ lịch sử; `package.json` gốc + script chạy song song; chuyển `CLAUDE.md`/`docs/features` lên gốc; cài đặt + kiểm thử lại toàn bộ trong cấu trúc mới.
- Ngoài phạm vi: tạo/đổi remote GitHub, push; workflow deploy (T15 vẫn 🔴 BLOCKED chờ cấu hình server — các file `deploy.yml` nằm trong `frontend/.github`, `backend/.github` sẽ không còn được GitHub chạy, giống thực tế hiện nay vì cả hai đều trigger nhánh `master` không tồn tại); xoá 2 repo cũ; sửa code chức năng.

**Cách làm:**
- Giữ lịch sử để `git log --follow` / `git blame` vẫn chạy qua mốc gộp: với mỗi repo, clone tạm → `git mv` toàn bộ file vào `frontend/` (hoặc `backend/`) → commit → trong repo mới `git pull <clone-tạm> main --allow-unrelated-histories`. Không cần cài `git-filter-repo`, không dùng `git subtree` (subtree làm `git log -- frontend/...` dừng ở mốc gộp).
- Cài đặt riêng từng thư mục để Turbopack tự nhận đúng root (mỗi thư mục có `package-lock.json` riêng — xem `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/turbopack.md` mục "Root directory"), Prisma generate vẫn chạy trong `backend/` như cũ.
- Lệnh chạy song song dùng script Node tự viết `scripts/dev.mjs` (không thêm thư viện).

**Task**

#### T-001.1 — Commit FE và merge `feature/tai-khoan-don-hang` → `main` ở cả 2 repo cũ
- File: repo `sonla-food-frontend` (toàn bộ thay đổi chưa commit), repo `sonla-food-backend` (chỉ merge)
- Các bước:
  1. FE: `git status`, rà diff không có bí mật (`.env*` đã bị ignore; không có token/mật khẩu trong code), không lẫn file rác (`dev-server-3002.*.log`, `.playwright-mcp/`, `.superpowers/`, `tsconfig.tsbuildinfo`).
  2. FE: commit theo nhóm — (a) code tài khoản/đơn hàng/sửa lỗi QA, (b) `docs/features` + `CLAUDE.md`. Không push.
  3. FE: `git switch main && git merge --ff-only feature/tai-khoan-don-hang` (main = a32c82c là tổ tiên của feature → fast-forward).
  4. BE: `git status` sạch; `git switch main && git merge --ff-only feature/tai-khoan-don-hang` (main = f01417c là tổ tiên).
  5. `npx tsc --noEmit` ở FE trên `main` để chắc commit đủ file.
- Xong khi: `git status` FE/BE sạch (trừ file rác bị ignore), `main` = `feature/tai-khoan-don-hang` ở cả hai, tsc FE sạch.

#### T-001.2 — Tạo repo `D:\Duc-TPE\sonla-food` giữ lịch sử
- File: `D:\Duc-TPE\sonla-food\` (mới), thư mục tạm `D:\Duc-TPE\_tmp_monorepo\`
- Các bước:
  1. `git clone` FE và BE (nhánh `main`) vào `_tmp_monorepo/fe`, `_tmp_monorepo/be`.
  2. Trong mỗi clone: chuyển mọi file đang được track vào `frontend/` (hoặc `backend/`) bằng `git mv`, commit `chore: chuyển mã nguồn vào frontend/` (`backend/`).
  3. `git init -b main D:\Duc-TPE\sonla-food`; commit đầu tiên chỉ có `.gitattributes`/`.gitignore` gốc.
  4. `git pull ../_tmp_monorepo/fe main --allow-unrelated-histories --no-rebase`, tương tự BE.
  5. Xoá `_tmp_monorepo`.
- Xong khi: `git log --oneline` có commit của cả 2 repo; `git log --follow frontend/app/page.tsx` và `git log --follow backend/prisma/schema.prisma` hiện commit trước mốc gộp; số file track = FE + BE + file gốc.

#### T-001.3 — `package.json` gốc + lệnh chung
- File: `package.json`, `scripts/dev.mjs`, `.gitignore`, `README.md` (gốc)
- Các bước:
  1. `package.json` gốc (private, không dependencies) với lệnh: `install:all`, `dev` (FE :3000 + BE :3001 song song), `dev:fe`, `dev:be`, `build`, `lint`, `typecheck`, `test` (BE `test:unit` + `test:api`).
  2. `scripts/dev.mjs`: spawn `npm run dev` trong 2 thư mục, gắn tiền tố `[fe]`/`[be]` cho log, Ctrl+C dừng cả hai, một bên chết thì dừng bên kia.
  3. `.gitignore` gốc: `node_modules/`, `.env*` (trừ `.env.example`), `*.log`, `.playwright-mcp/`, `.superpowers/`.
  4. `README.md`: cấu trúc thư mục, cài đặt, lệnh chạy, biến môi trường cần (`frontend/.env`: `BACKEND_INTERNAL_URL`…; `backend/.env`: DB…).
- Xong khi: `npm run` ở gốc liệt kê đủ lệnh; `node --check scripts/dev.mjs` OK.

#### T-001.4 — Chuyển `CLAUDE.md` + `docs/features` lên gốc
- File: `CLAUDE.md`, `AGENTS.md` (gốc), `docs/features/**`, `frontend/CLAUDE.md`, `backend/CLAUDE.md`
- Các bước:
  1. `git mv frontend/docs docs`.
  2. `CLAUDE.md` gốc = nội dung `frontend/CLAUDE.md` cũ, sửa mục "Lệnh kiểm tra" theo lệnh gốc + đường dẫn `frontend/`, `backend/`. `AGENTS.md` gốc trỏ tới `frontend/AGENTS.md`/`backend/AGENTS.md` (mỗi app vẫn đọc docs Next trong `node_modules` của chính nó).
  3. `frontend/CLAUDE.md`, `backend/CLAUDE.md` giữ `@AGENTS.md` (vẫn đúng trong từng app).
  4. `docs/features/README.md`: ghi chú quy ước — "FE `x`" = `frontend/x`, "BE `x`" = `backend/x`; cập nhật dòng `gop-monorepo`. Không sửa lại toàn bộ tài liệu cũ.
  5. Chép memory Claude (`respond-in-vietnamese`) sang thư mục memory của project mới.
- Xong khi: `docs/features` chỉ nằm ở gốc; CLAUDE.md gốc có lệnh đúng.

#### T-001.5 — Cài đặt + kiểm thử trong cấu trúc mới
- File: `frontend/.env`, `backend/.env` (chép từ repo cũ, không commit)
- Các bước:
  1. Chép `.env` từ 2 repo cũ; `npm run install:all`.
  2. `npm run typecheck`, `npm run lint` (so với baseline: FE 3 lỗi cũ, BE 74 lỗi cũ — không thêm lỗi mới), `npm run build`, `npm run test` (BE unit 23/23, api 40/40).
  3. `npm run dev` ở gốc → Playwright TC-01→TC-03.
  4. Dọn dữ liệu test, tắt dev server.
- Xong khi: tất cả lệnh đạt baseline, TC pass, console 0 lỗi.

#### T-001.6 — Chốt
- Các bước: `git status` sạch ở repo mới; cập nhật status/README; báo người dùng việc còn lại (tạo remote GitHub + push, lưu trữ 2 repo cũ, mở Claude Code ở `D:\Duc-TPE\sonla-food`).
- Xong khi: CR-001 ✅.

**Tiêu chí nghiệm thu**
- [ ] `D:\Duc-TPE\sonla-food` có `frontend/`, `backend/`, `docs/`, `package.json`, `CLAUDE.md`, `README.md`
- [ ] Lịch sử cả 2 repo còn, `git log --follow` qua được mốc gộp
- [ ] `npm run dev` ở gốc chạy FE :3000 + BE :3001
- [ ] typecheck/build/test đạt như trước khi gộp; lint không thêm lỗi
- [ ] 2 repo cũ vẫn nguyên (đã commit + merge main), không push gì lên GitHub

**Kịch bản test (Playwright / e2e)**

| ID | Kịch bản | Kết quả mong đợi |
|---|---|---|
| TC-01 | `npm run dev` ở gốc → mở `/`, `/dac-san`, `/combo-dac-san`, `/tin-tuc`, `/lien-he`, `/en` trên :3000 | 200, dữ liệu lấy từ BE, console 0 lỗi |
| TC-02 | Đăng nhập admin qua `http://localhost:3000/admin` → Đơn hàng, Combo | Trang hiển thị đủ CSS/JS (`/be-static`), 0 HTTP ≥ 400 |
| TC-03 | Đăng ký khách → thêm combo vào giỏ → đặt đơn → `/tai-khoan` thấy đơn → admin xác nhận → khách thấy "Đã xác nhận"; dọn dữ liệu | Đơn 201, trạng thái cập nhật đúng |
| TC-04 | Mở `docs/features/tich-hop/gop-monorepo/index.html` (file://) | Hiển thị đúng, console 0 lỗi |

**Rủi ro / câu hỏi mở**
- Đường dẫn Windows dài hơn (`sonla-food\frontend\node_modules\...`) — chưa thấy vấn đề, sẽ kiểm ở build.
- Server deploy hiện kéo code tại `D:\Travel` theo repo FE; sau khi gộp cần viết lại workflow (T15, chờ người dùng).
- Claude Code mở ở thư mục mới sẽ có thư mục memory mới — đã xử lý ở T-001.4.
