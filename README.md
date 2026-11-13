# Sơn La Food

Monorepo gồm hai ứng dụng Next.js:

| Thư mục | Vai trò | Cổng dev |
|---|---|---|
| `frontend/` | Website khách hàng; chuyển tiếp `/api`, `/admin`, `/be-static`, `/uploads` sang backend | 3000 |
| `backend/` | API, trang quản trị `/admin`, Prisma + PostgreSQL | 3001 |
| `docs/features/` | Tài liệu từng chức năng (plan, design, status) | — |

Mỗi app giữ `node_modules` và `package-lock.json` riêng; `package.json` ở gốc chỉ chứa lệnh chung.

## Cài đặt

1. Tạo biến môi trường từ file mẫu:
   - `frontend/.env` từ `frontend/.env.example` — khi chạy local đặt `BACKEND_INTERNAL_URL="http://localhost:3001"`.
   - `backend/.env` từ `backend/.env.example` — `DATABASE_URL`, `JWT_SECRET`, Cloudinary…
2. `npm run install:all` (backend tự chạy `prisma generate` khi cài).

## Lệnh

| Lệnh | Việc làm |
|---|---|
| `npm run dev` | Chạy backend :3001 và frontend :3000 cùng lúc |
| `npm run dev:fe` · `npm run dev:be` | Chạy riêng một bên |
| `npm run build` | Build backend rồi frontend (`build:fe`, `build:be` để build riêng) |
| `npm run lint` · `npm run typecheck` | ESLint / TypeScript cho cả hai |
| `npm run test` | Test backend (`test:unit` + `test:api`, cần DB) |

Lệnh riêng của từng app (vd `db:deploy`, `db:seed-marketplace` của backend): `npm --prefix backend run <lệnh>`.
