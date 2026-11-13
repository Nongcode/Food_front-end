@AGENTS.md

## Quy trình chức năng (BẮT BUỘC)

Mọi yêu cầu **tạo mới, sửa giao diện, sửa chức năng** (kể cả thay đổi nhỏ) hoặc **tiếp tục công việc dở dang** phải đi theo skill `feature`:

- Tài liệu mỗi chức năng nằm ở `docs/features/<module>/<ten-chuc-nang>/` gồm `plan.md`, `design.md`, `status.md`, `index.html`.
- Sổ đăng ký: `docs/features/README.md`.
- Lập kế hoạch và chia task vào `plan.md` **trước** khi sửa code; chờ người dùng duyệt (trừ khi họ nói "làm luôn").
- Cập nhật `status.md`, `design.md`, `index.html` **ngay sau mỗi task**, không dồn đến cuối.
- **Chức năng mới** (màn hình / API / model mới): BẮT BUỘC đi đủ chuỗi Superpowers — brainstorming → writing-plans → subagent-driven-development (TDD) → requesting-code-review → verification-before-completion → finishing-a-development-branch. Kết quả ghi vào `design.md` / `plan.md` / `status.md` của chức năng, KHÔNG ghi vào `docs/superpowers/`.
- Sau mỗi task có sửa code: chạy Playwright nếu thay đổi ảnh hưởng giao diện / luồng người dùng / API màn hình gọi; nếu bỏ qua phải ghi lý do vào `status.md`.
- Kiểm thử bằng Playwright (MCP hoặc `@playwright/test` nếu project có) + bộ test của project; ghi kết quả vào `status.md`.
- Ngoại lệ: câu hỏi thuần tuý, giải thích code, hoặc người dùng nói rõ "không cần quy trình".

### Cấu trúc repo

- Monorepo: `frontend/` (Next.js, cổng 3000) và `backend/` (Next.js + Prisma, cổng 3001); mỗi app có `node_modules`, `package-lock.json`, `.env` riêng.
- Trong tài liệu cũ ở `docs/features`: "FE `x`" = `frontend/x`, "BE `x`" = `backend/x`.
- Cài thư viện cho app nào thì chạy trong thư mục app đó (`npm --prefix frontend install <gói>`), không cài ở gốc.

### Lệnh kiểm tra (chạy ở thư mục gốc)

- Build: `npm run build` (hoặc `build:fe` / `build:be`)
- Lint / type-check: `npm run lint` · `npm run typecheck`
- Test: `npm run test` (backend `test:unit` + `test:api`, cần DB); frontend chưa có test tự động (chưa cài `@playwright/test`) — dùng Playwright MCP
- URL chạy dev (cho Playwright): `npm run dev` chạy cả FE `http://localhost:3000` và BE `http://localhost:3001` (`dev:fe` / `dev:be` để chạy riêng)

### Khi bắt đầu phiên mới

Nếu người dùng nói "tiếp tục", "làm tiếp", "đang làm dở" hoặc không nói rõ chức năng:
1. Đọc `docs/features/README.md`, tìm chức năng 🟡 IN_PROGRESS.
2. Đọc `status.md` của chức năng đó (Tóm tắt nhanh + File chính) — **không đọc lại toàn bộ code**.
3. Báo đang ở bước nào rồi tiếp tục.
