"use client";

import React, { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  Plus,
  Calendar,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useExpense } from "@/context/ExpenseContext";

export function Navbar() {
  const { setIsAddModalOpen, setIsMobileDrawerOpen } = useExpense();
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 md:px-8 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-all">
      {/* Left: Mobile Menu & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="lg:hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions, accounts, categories..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9.5 pr-14 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200 dark:focus:bg-slate-900"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:border-slate-700 dark:bg-slate-800">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Period, Notifications, Quick Action */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Period Selector Filter */}
        <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-subtle dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <Calendar className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>October 2026</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
        </div>

        {/* AI Insight Badge */}
        <div className="hidden xl:flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          <span>Savings up +18.5%</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
          </button>

          {/* Notifications Dropdown */}
          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-dropdown dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Notifications (2)
                </span>
                <span className="text-[11px] text-indigo-600 font-semibold cursor-pointer hover:underline">
                  Mark read
                </span>
              </div>
              <div className="space-y-3 pt-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Budget alert: Entertainment
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Exceeded allocated budget of $400.00 by $20.00.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Payment received
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Acme Corp settled invoice #089 for $6,500.00.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-xl shadow-md shadow-indigo-600/20 font-semibold"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </header>
  );
}
