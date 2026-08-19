# 📐 Reusable Components & Layout Guidelines (Quy tắc tái sử dụng)

> [!NOTE]
> Tài liệu chuẩn hóa cách thiết kế Layout và Component có khả năng tái sử dụng cao nhất cho dự án MMO Shopping FE.

---

## 1. 🏗️ Quy tắc Tách Layout (`src/layouts/`)

Layout đóng vai trò là khung bao bọc (Wrapper Frame) cấu trúc trang:

- **Chức năng:** Định vị vị trí Header, Footer, Sidebar, và khu vực nội dung chính (`<main>`).
- **Quy tắc:**
  1. Sử dụng prop `children: React.ReactNode` để truyền nội dung trang vào.
  2. KHÔNG gọi API hoặc chứa logic xử lý dữ liệu phức tạp.
  3. KHÔNG phụ thuộc vào trang cụ thể.

```tsx
// Ví dụ: MainLayout.tsx
interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-[#07080D] text-white flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

---

## 2. 🧩 Quy tắc Tách Component (`src/components/`)

Component tái sử dụng (Dumb/Presentational Component) nằm tại `src/components/`:

- **Quy tắc:**
  1. **Pure UI (UI Thuần):** Chỉ nhận dữ liệu (`props`) và phát sự kiện (`onChange`, `onClick`).
  2. **Ghi đè Styling:** Tải thuộc tính `className` từ props và gộp bằng helper `cn()` (sử dụng `clsx` + `tailwind-merge`).
  3. **Extends Native Props:** Kế thừa attributes chuẩn của HTML Element tương ứng (`React.ButtonHTMLAttributes`, `React.HTMLAttributes`).

```tsx
// Ví dụ: Button.tsx
import React from "react";
import { cn } from "../../common/libs/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "px-5 py-3 rounded-xl font-semibold transition-all",
        variant === "primary" &&
          "bg-gradient-to-r from-[#0EA5FF] to-[#7C3DFF] text-white shadow-lg",
        variant === "secondary" &&
          "bg-[#0C101CEE] border border-white/10 text-[#DCE4F8]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

---

## 3. 🎯 Phân tầng Trách nhiệm (Separation of Concerns)

| Tầng          | Thư mục           | Trách nhiệm                          | Gọi API? |     Giữ State?     |
| :------------ | :---------------- | :----------------------------------- | :------: | :----------------: |
| **Component** | `src/components/` | Đóng gói UI, nhận props render       |    ❌    |  Chỉ UI state nhỏ  |
| **Layout**    | `src/layouts/`    | Khung trang (Header/Footer wrapper)  |    ❌    |         ❌         |
| **Page**      | `src/pages/`      | Container chính, kết nối API/Zustand |    ✅    | ✅ State nghiệp vụ |
