# Design — Đồng bộ FE ↔ BE

## Kiến trúc

```
Trình duyệt → FE (Next, :3000)
  ├─ Trang public (SSR) → lib/publicApi.ts → BE /api/public/* (BACKEND_INTERNAL_URL)
  └─ next.config.ts rewrites: /api/* , /admin/* , /uploads/* → BE (:3001)
BE (Next + Prisma + Postgres) — API public, API admin, trang admin, proxy.ts bảo vệ /admin
```

## Phần dùng chung

- Cookie admin: `admin_token` (JWT HS256 tự ký, `lib/auth.ts`), set bởi BE `app/api/admin/login/route.ts`.
- Trạng thái nội dung dạng chuỗi tiếng Việt (`Đang mở`, `Hiển thị`, `Đã xuất bản`), BE chấp nhận cả biến thể mojibake (`app/api/public/_data.ts`).
- Model/API mới sẽ chốt ở `mo-hinh-du-lieu/design.md`.
