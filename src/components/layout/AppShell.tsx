"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { MobileDrawer } from "./MobileDrawer";
import { QuickAddModal } from "@/components/dashboard/QuickAddModal";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  if (isAuthPage) {
    return (
      <main className="min-h-screen w-full bg-slate-950 flex items-center justify-center">
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50/60 dark:bg-slate-950">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col z-40">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <Navbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Quick Add Transaction Modal */}
      <QuickAddModal />
    </div>
  );
}
