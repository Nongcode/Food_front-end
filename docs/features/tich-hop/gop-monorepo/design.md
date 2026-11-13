# Design — Gộp FE và BE về một repo (monorepo)

## Kiến trúc

Không đổi luồng chạy: trình duyệt → FE Next.js (:3000) → rewrite `/api`, `/admin`, `/be-static`, `/uploads` → BE Next.js (:3001) → Prisma → DB. Chỉ đổi vị trí mã nguồn và cách khởi chạy.

Cấu trúc dự kiến:

```
D:\Duc-TPE\sonla-food\
├── frontend/          ← toàn bộ repo sonla-food-frontend (package-lock, node_modules, .env riêng)
├── backend/           ← toàn bộ repo sonla-food-backend (Prisma, tests, .env riêng)
├── docs/features/     ← chuyển từ frontend/docs
├── scripts/dev.mjs    ← chạy FE + BE song song
├── package.json       ← chỉ có scripts, không dependencies
├── CLAUDE.md, AGENTS.md, README.md, .gitignore
```

## Vị trí code

| File | Symbol | Dòng | Vai trò |
|---|---|---|---|
| `package.json` (gốc) | `scripts` | — | Lệnh chung gọi `npm --prefix frontend|backend` |
| `scripts/dev.mjs` | — | — | Spawn 2 dev server, tiền tố log, dừng cả hai khi một bên thoát |
| `frontend/next.config.ts` | `rewrites` | — | Không đổi |
| `backend/next.config.ts` | `assetPrefix` | — | Không đổi |

## API

Không đổi.

## Dữ liệu

Không đổi (không chạm schema Prisma, DB).

## Giao diện

Không đổi. `index.html` mô tả cấu trúc repo và tiến độ.

## Nhật ký sửa đổi

### CR-001 — Gộp FE + BE thành monorepo

| Task | File:dòng | Thay đổi | Lý do |
|---|---|---|---|
| T-001.1 | FE commit 7aa017a, b310641 | Commit code + docs; `main` FE/BE fast-forward tới feature | Gộp từ `main` theo lựa chọn của người dùng |
| T-001.2 | `D:/Duc-TPE/sonla-food` (.gitignore gốc, frontend/, backend/) | Repo mới, lịch sử 2 repo qua git mv + pull --allow-unrelated-histories | Giữ blame/log qua mốc gộp |
| T-001.3 | `package.json`, `scripts/dev.mjs`, `README.md`, `frontend/.env.example`, `backend/.env.example` | Lệnh chung `npm --prefix`; dev.mjs spawn 2 dev server, taskkill /T trên Windows | Không thêm thư viện |
| T-001.4 | `CLAUDE.md` (mục Cấu trúc repo + Lệnh kiểm tra), `AGENTS.md`, `docs/features/README.md:5`, `frontend/CLAUDE.md` | Chuyển tài liệu lên gốc | Một nơi duy nhất cho quy trình |
| T-001.5 | `package.json` (`install:all`) | `npm --prefix X install` → `cd X && npm install` | --prefix làm npm thêm package gốc vào dependencies + viết lại lockfile |
| Git | lịch sử `backend/` | Xoá `test-pass.ts`, `get-users.js`, `query-admins.ts` khỏi mọi commit; remote origin = Food_front-end | Không đưa hash mật khẩu admin lên GitHub |
