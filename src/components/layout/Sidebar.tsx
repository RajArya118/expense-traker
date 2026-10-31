"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Layers,
  PieChart,
  BarChart3,
  Settings,
  Wallet,
  ShieldCheck,
  LogOut,
  ChevronUp,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { SAMPLE_ACCOUNTS } from "@/data/mockData";
import { logoutAction, getAuthUser } from "@/actions/auth";
import { UserSession } from "@/lib/auth/session";

export const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: ArrowLeftRight,
    badge: "14",
  },
  {
    name: "Income",
    href: "/income",
    icon: TrendingUp,
    badge: null,
  },
  {
    name: "Expenses",
    href: "/expenses",
    icon: TrendingDown,
    badge: null,
  },
  {
    name: "Categories",
    href: "/categories",
    icon: Layers,
    badge: "9",
  },
  {
    name: "Budgets",
    href: "/budgets",
    icon: PieChart,
    badge: "Alert",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    badge: null,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    badge: null,
  },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const authUser = await getAuthUser();
      setUser(authUser);
    }
    loadUser();
  }, []);

  const displayName = user?.name || "Alex Morgan";
  const displayEmail = user?.email || "alex@expenseflow.io";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="flex h-full w-64 flex-col justify-between border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 select-none">
      {/* Brand Header */}
      <div>
        <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/25">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                Expense<span className="text-indigo-600">Flow</span>
              </span>
              <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Fintech Workspace</p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Main Menu
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-950/60 dark:text-indigo-300"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "h-4.5 w-4.5 transition-colors",
                        isActive
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                      )}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        item.badge === "Alert"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Accounts & User Widget */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-3 relative">
        {/* Linked Accounts Mini Card */}
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
          <div className="flex items-center justify-between pb-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Primary Account</span>
            <span className="flex items-center text-[10px] text-emerald-600 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
              Synced
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate max-w-[120px]">
              {SAMPLE_ACCOUNTS[0].name}
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {formatCurrency(SAMPLE_ACCOUNTS[0].balance)}
            </span>
          </div>
        </div>

        {/* User Profile Popup Menu */}
        {showUserMenu && (
          <div className="absolute bottom-16 left-3 right-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-dropdown dark:border-slate-700 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{displayEmail}</p>
            </div>
            <Link
              href="/settings"
              onClick={() => setShowUserMenu(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              <Settings className="h-3.5 w-3.5 text-slate-400" />
              <span>Account Settings</span>
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        )}

        {/* User Profile Mini Bar */}
        <div
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center justify-between rounded-xl px-2.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 text-white font-bold text-xs shadow-sm">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-400 truncate max-w-[110px]">
                {displayEmail}
              </p>
            </div>
          </div>
          <ChevronUp
            className={cn(
              "h-4 w-4 text-slate-400 transition-transform",
              showUserMenu && "rotate-180"
            )}
          />
        </div>
      </div>
    </aside>
  );
}
