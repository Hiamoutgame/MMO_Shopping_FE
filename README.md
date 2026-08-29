# MMO Shopping — Frontend

Frontend React cho dự án **MMO Shopping** ("Chợ Tài Khoản AI"), kết nối API backend NestJS (`/api/v1`).

## Stack

| Nhóm | Công nghệ |
| :--- | :--- |
| UI runtime | React 19, React DOM 19 |
| Build | Vite, TypeScript |
| Routing | React Router DOM 7 |
| Styling | Tailwind CSS 4, `clsx`, `tailwind-merge` |
| Client state | Zustand 5 |
| HTTP | Axios (một client duy nhất `common/apis/httpClient.ts`) |
| Validation | Zod |

## Chạy dự án

```bash
# Cài dependency
pnpm install

# Dev server
pnpm dev

# Build production
pnpm build

# Preview bản build
pnpm preview

# Lint
pnpm lint
```

## Biến môi trường

Copy `.env.example` thành `.env` rồi điều chỉnh:

| Biến | Mô tả | Mặc định local |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base path API frontend gọi | `/api/v1` |
| `VITE_API_PROXY_TARGET` | Target proxy Vite dev | `http://127.0.0.1:3000` |
| `VITE_ENABLE_SUPPORT_CODE` | Bật/tắt feature support-code (hiện `BLOCKED`) | `false` |

Vite proxy `/api` → `VITE_API_PROXY_TARGET` để dev tránh CORS (backend chưa bật `enableCors`).

## Quality gate

Bắt buộc trước khi kết thúc công việc:

- `pnpm lint`
- `pnpm build`

Project chưa có test runner/script test — đừng mô tả test như năng lực đã có.

## Tài liệu & rule bắt buộc đọc

Trước khi sửa code, đọc:

- `docs/rules/structure.md` — cấu trúc thư mục & trách nhiệm từng layer.
- `docs/rules/design.md` — design system + section **Admin UI**.
- `docs/rules/reuse.md` — layout/component tái sử dụng + shared admin components.
- `docs/structure/FE.md` (trong repo gốc `MMO_Shopping/docs/structure/FE.md`) — kiến trúc tổng thể.

## Local skill

Project có local skill **`design-taste-frontend`** tại `.codex/skills/design-taste-frontend/` (nguồn `https://github.com/Leonxlnx/taste-skill`, biến thể v2 `design-taste-frontend`).

- Dùng làm guideline UI chống "AI-slop" (layout, typography, spacing, motion).
- Skill này hướng đến landing/portfolio nên áp dụng **có chọn lọc**: với admin, ưu tiên operational dashboard (dense, scan nhanh) theo `docs/rules/design.md` mục 7, không dùng hero marketing.

## Kiến trúc admin v1

- Route `/admin/*` bọc `RequireAdmin` (chặn guest + user thường) + `AdminLayout`.
- `common/apis/adminApi.ts` gọi `/api/v1/admin/*`; DTO/mapper ở `common/models` + `common/mapping`.
- Pages admin ở `pages/admin/*`; shared admin UI (table, status badge, filter bar, form modal, confirm dialog, pagination) ở `components`.
