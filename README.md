# MMO Shopping - Frontend

React + TypeScript frontend cho hệ thống CHUNG SỨC.

> **Role hỗ trợ: `USER` (khách) và `ADMIN` (chủ shop).** Role seller đã ngừng từ 23/10/2026; trang/API seller đã gỡ khỏi frontend. Xem `docs/changes/seller-role-disabled-2026-10-23.md` trong repo backend.

## 🚀 Quick Start

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình environment
File `.env` đã được tạo với cấu hình mặc định:
```
VITE_API_URL=http://localhost:4000/api
```

### 3. Chạy development server
```bash
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3000

## 📁 Cấu trúc dự án

```
src/
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx          # Đăng nhập
│   │   └── RegisterPage.tsx       # Đăng ký
│   ├── chung-suc/
│   │   ├── ChungSucCampaignsPage.tsx  # Danh sách chiến dịch
│   │   └── JoinChungSucPage.tsx       # Tham gia chiến dịch
│   ├── packages/
│   │   └── PackagesPage.tsx       # Danh sách gói
│   ├── seasons/
│   │   └── SeasonsPage.tsx        # Danh sách seasons
│   └── admin/
│       └── AdminChungSucPages.tsx   # Quản lý admin
├── services/
│   └── api.ts                     # API client
├── types/
│   └── chung-suc.types.ts        # TypeScript types
├── styles/
│   ├── chung-suc.css             # Main styles
│   └── auth.css                  # Auth styles
├── App.tsx                        # Routing
└── main.tsx                       # Entry point
```

## 🎨 Features

### Trang công khai
- ✅ Đăng nhập / Đăng ký
- ✅ Danh sách chiến dịch CHUNG SỨC
- ✅ Tham gia chiến dịch với tính giá real-time
- ✅ Danh sách gói theo role
- ✅ Danh sách seasons

### Admin Panel
- ✅ Quản lý seasons (CRUD + lifecycle)
- ✅ Quản lý chiến dịch CHUNG SỨC
- ✅ Xem progress real-time

## 🔐 Tài khoản demo

```
USER:   user@mmo.vn / password123
ADMIN:  admin@mmo.vn / password123
```

## 🛠️ Scripts

```bash
# Development
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

## 🎯 Routing

```
/                          → Danh sách chiến dịch (protected)
/login                     → Đăng nhập
/register                  → Đăng ký
/chung-suc                 → Danh sách chiến dịch
/chung-suc/:id/join        → Tham gia chiến dịch
/packages                  → Danh sách gói
/seasons                   → Danh sách seasons
/admin/seasons             → Quản lý seasons (ADMIN only)
/admin/campaigns           → Quản lý campaigns (ADMIN only)
```

## 🔒 Authentication

- JWT token được lưu trong localStorage
- Axios interceptor tự động thêm Authorization header
- Auto redirect về /login khi token hết hạn (401)
- Role-based routing với ProtectedRoute component

## 💰 Price Calculation Flow

1. User nhập số lượng, mã coupon (account lấy từ phiên đăng nhập ở backend)
2. Frontend gọi `POST /api/pricing/calculate` với tất cả params
3. Backend tính giá qua price engine (KHÔNG tin frontend)
4. Response trả về breakdown chi tiết từng bước giảm giá
5. Frontend hiển thị breakdown + final price

**QUAN TRỌNG:** Final price LUÔN được server tính toán, frontend KHÔNG BAO GIỜ tính giá.

## 🎨 Design System

- **Base colors:** #05070C → #161D2B (dark surfaces)
- **Accent:** #38BDF8 (cyan), #6EE7B7 (emerald)
- **Typography:** fluid clamp() sizing
- **Layout:** CSS Grid primary, Flexbox secondary
- **Radius:** 16px cards, 999px pills
- **Responsive:** mobile-first approach

## 📦 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router 6** - Routing
- **Axios** - HTTP client
- **Vite** - Build tool
- **CSS** - Vanilla CSS (no preprocessor)

## 🔗 API Integration

Backend API: http://localhost:4000/api

Tất cả API calls đều qua `src/services/api.ts` với:
- Request interceptor: thêm Authorization header
- Response interceptor: handle 401 errors
- Typed responses với TypeScript interfaces

## 📝 Next Steps

1. Run backend: `cd ../MMO_Shopping_BE && npm run start:dev`
2. Run migration: `npm run typeorm:migration:run`
3. Seed data: `npm run seed:chung-suc`
4. Install frontend deps: `npm install`
5. Start frontend: `npm run dev`
6. Open: http://localhost:3000
7. Login với tài khoản demo

## 🐛 Troubleshooting

**CORS errors:**
- Backend phải enable CORS cho http://localhost:3000
- Check main.ts: `app.enableCors({ origin: 'http://localhost:3000' })`

**401 Unauthorized:**
- Token hết hạn, đăng nhập lại
- Check localStorage có accessToken không

**API not found:**
- Backend phải chạy trên port 4000
- Check VITE_API_URL trong .env

**Build errors:**
- Run `npm install` lại
- Delete node_modules và package-lock.json, cài lại
