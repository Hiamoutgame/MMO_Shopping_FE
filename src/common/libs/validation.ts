import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email không được để trống').email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export const registerSchema = z
  .object({
    displayName: z.string().min(2, 'Họ tên phải từ 2 ký tự trở lên'),
    email: z.string().min(1, 'Email không được để trống').email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export const contactSchema = z.object({
  fullName: z.string().min(2, 'Họ tên ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  subject: z.string().min(3, 'Tiêu đề ít nhất 3 ký tự'),
  message: z.string().min(10, 'Nội dung ít nhất 10 ký tự'),
});

export const cashbackLinkSchema = z.object({
  url: z.string().trim().url('Link sản phẩm không hợp lệ').refine(
    (value) => value.startsWith('https://') || value.startsWith('http://'),
    'Link phải bắt đầu bằng http:// hoặc https://',
  ),
});

export const cashbackWithdrawalSchema = z.object({
  amount: z.string().trim().regex(/^\d+(?:\.\d+)?$/, 'Số tiền không hợp lệ'),
  accountNumber: z.string().trim().min(3, 'Vui lòng nhập số tài khoản'),
  accountName: z.string().trim().min(2, 'Vui lòng nhập tên chủ tài khoản'),
  bankName: z.string().trim().min(1, 'Vui lòng chọn ngân hàng hoặc ví'),
  otpCode: z.string().trim().optional(),
});

export const cashbackPaymentAccountSchema = z.object({
  bankName: z.string().trim().min(1, 'Vui lòng chọn ngân hàng hoặc ví'),
  accountNumber: z.string().trim().min(3, 'Vui lòng nhập số tài khoản'),
  accountName: z.string().trim().min(2, 'Vui lòng nhập tên chủ tài khoản'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
