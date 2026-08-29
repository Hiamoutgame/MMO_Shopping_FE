# 📂 Project Structure Rules (Cấu trúc thư mục)

> [!NOTE]
> **Objective / Mục tiêu:** Define folder structure and responsibilities within `src/`.
> **Target / Đối tượng:** AI Agents (Context parsing) & Developers (Human readable).

## 🗂️ Root Directory: `src/`

Mô tả: Thư mục gốc chứa toàn bộ mã nguồn Frontend.

---

### 1. 🖼️ `assets/`
- **Context:** Static UI Resources / Tài nguyên tĩnh.
- **Rules:** No logic files allowed.
- **Sub-directories:**
  - `images/`: Banners, logos, general images.
  - `icons/`: Specific icons.
  - `fonts/`: Custom typography fonts.

### 2. 🧩 `common/`
- **Context:** Shared Core & Logic / Dùng chung toàn dự án.
- **Rules:** Must be highly reusable. No page-specific logic here.
- **Sub-directories:**
  - `apis/`: API services, request/response configs, backend connections. Admin request đặt trong `common/apis/adminApi.ts` (hoặc chia theo domain admin).
  - `const/`: Global constants.
  - `libs/`: Custom wrappers/libraries (axios, storage, formatter).
  - `mapping/`: Data transformers (API ↔ UI format).
  - `mocks/`: Mock data for UI testing/demo.
  - `models/`: Global Types, Interfaces, Data Models.

### 3. 🧱 `components/`
- **Context:** Reusable UI Components / Component giao diện tái sử dụng.
- **Rules:** Pure UI, minimize complex business logic. 
- **Examples:** Buttons, Inputs, Modals, Cards. (Use sub-folders for large component groups).

### 4. 🪝 `hooks/`
- **Context:** Custom React Hooks.
- **Rules:** Encapsulate reusable state/effect logic.
- **Examples:** Form handling, API fetching, LocalStorage sync.

### 5. 🖼️ `layouts/`
- **Context:** Page Wrappers / Khung giao diện chung.
- **Rules:** Define structural layout, not content. Layout KHÔNG gọi API, KHÔNG chứa business logic của page cụ thể.
- **Examples:** 
  - Public layout, Auth layout, Admin dashboard layout.
  - Shared sections: Header, Sidebar, Footer.
- **Admin layout:** `layouts/AdminLayout` chứa sidebar + topbar + vùng content. Chỉ render khung, không gọi API.

### 6. 📄 `pages/`
- **Context:** Main Screens & Views / Các trang chính.
- **Rules:** Each folder maps to a screen/route. Page-specific components go inside their respective folder.
- **Admin pages:** Đặt trong `pages/admin/*`. Mỗi trang map 1 route `/admin/*`. Page gọi `adminApi` và điều phối state; shared UI (table/badge/filter/form/confirm/pagination) đặt ở `components` để tái sử dụng.

### 7. 🛣️ `routes/`
- **Context:** Navigation & Routing / Điều hướng.
- **Rules:** Centralize all route definitions.
- **Includes:** Path mappings, Route Guards, Protected Routes.

---

## 📄 Root Files

- **`App.tsx`**: Root component. Wraps main layout, providers, and router.
- **`main.tsx`**: Entry point. Renders React App into DOM, runs initial configurations.

---

## ⚡ General Conventions (Quy ước chung)

- **Single Responsibility (SRP):** Mỗi folder đúng một chức năng. Không mix logic sai chỗ.
- **Reusability (Tái sử dụng):** Code dùng nhiều nơi -> Bắt buộc move vào `common/` hoặc `components/`.
- **Isolation (Độc lập):** Màn hình riêng -> Đặt vào `pages/`. Điều hướng -> Đặt vào `routes/`.
- **Scalability (Mở rộng):** Tách bạch rõ UI, Logic, Data, Routing.
