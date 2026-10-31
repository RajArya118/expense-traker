"use client";

import React from "react";
import { Download, Sparkles, Plus, Wallet, CreditCard, ArrowUpRight } from "lucide-react";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import { CategoryBreakdownChart } from "@/components/dashboard/CategoryBreakdownChart";
import { RecentTransactionsTable } from "@/components/dashboard/RecentTransactionsTable";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useExpense } from "@/context/ExpenseContext";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { setIsAddModalOpen, setTransactionToEdit, accounts } = useExpense();

  const handleOpenAdd = () => {
    setTransactionToEdit(null);
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Financial Overview
            </h1>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/50 px-2 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time cash flow, balances, and analytics connected to PostgreSQL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="rounded-xl shadow-md shadow-indigo-600/20 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Add Transaction</span>
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <MetricCards />

      {/* Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <IncomeExpenseChart />
        </div>
        <div className="lg:col-span-5">
          <CategoryBreakdownChart />
        </div>
      </div>

      {/* Connected Accounts Strip */}
      <div>
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Accounts & Wallets
          </h2>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
            Live Balances
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {accounts.map((account) => (
            <Card
              key={account.id}
              hoverEffect
              className="p-4 flex items-center justify-between border-slate-200/80 bg-white dark:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm"
                  style={{ backgroundColor: account.color || "#3b82f6" }}
                >
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {account.name}
                  </p>
                  <p className="text-[11px] text-slate-400 capitalize">
                    {account.type.toLowerCase().replace("_", " ")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatCurrency(account.balance)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <RecentTransactionsTable limit={6} showViewAll={true} />
    </div>
  );
}
