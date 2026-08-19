import React from 'react';
import { Link } from 'react-router-dom';
import { APP_CONSTANTS } from '../common/const/app';

export interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#07080D] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-[#0EA5FF]/10 rounded-full blur-[120px] pointer-events-none -top-24 -left-24" />
      <div className="absolute w-[500px] h-[500px] bg-[#7C3DFF]/10 rounded-full blur-[120px] pointer-events-none -bottom-24 -right-24" />

      {/* Brand Header */}
      <Link to={APP_CONSTANTS.ROUTES.PRODUCTS} className="flex items-center gap-3 mb-8 group z-10">
        <div className="w-10 h-10 rounded-[12px] bg-gradient-to-r from-[#0EA5FF] to-[#7C3DFF] shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform" />
        <span className="font-bold text-xl text-[#F8FAFC]">Chợ Tài Khoản AI</span>
      </Link>

      {/* Main Form Container */}
      <main className="w-full max-w-md z-10">{children}</main>
    </div>
  );
}
