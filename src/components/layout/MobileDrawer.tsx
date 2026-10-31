"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useExpense } from "@/context/ExpenseContext";

export function MobileDrawer() {
  const { isMobileDrawerOpen, setIsMobileDrawerOpen } = useExpense();

  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileDrawerOpen]);

  if (!isMobileDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsMobileDrawerOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl transition-transform dark:bg-slate-900 z-50 flex flex-col">
        <div className="absolute right-3 top-3 z-50">
          <button
            onClick={() => setIsMobileDrawerOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="h-full w-full">
          <Sidebar onNavigate={() => setIsMobileDrawerOpen(false)} />
        </div>
      </div>
    </div>
  );
}
