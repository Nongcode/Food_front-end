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
