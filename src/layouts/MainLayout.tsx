import React from 'react';
import { Header } from '../components/Header/Header';
import { Footer } from '../components/Footer/Footer';

export interface MainLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export function MainLayout({ children, pageTitle }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-[#07080D] text-white flex flex-col justify-between selection:bg-[#0EA5FF] selection:text-white">
      <Header />
      <main className="flex-1 flex flex-col items-center w-full">{children}</main>
      <Footer pageTitle={pageTitle} />
    </div>
  );
}
