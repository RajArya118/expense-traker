"use client";

import React from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { useExpense } from "@/context/ExpenseContext";

export function MetricCards() {
  const { metrics, transactions, accounts } = useExpense();

  // If server metrics are available, use them; otherwise compute from current context transactions
  const totalBalance =
    metrics?.totalBalance ??
    accounts.reduce((sum, a) => sum + a.balance, 0);

  const totalIncome =
    metrics?.monthlyIncome ??
    transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense =
    metrics?.monthlyExpense ??
    transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

  const savingsRate =
    metrics?.savingsRate ??
    (totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0);

  const netSavings = totalIncome - totalExpense;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Balance Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white border-0 shadow-lg shadow-indigo-950/20">
        <div className="absolute -right-4 -top-4 h-28 w-28 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
            Total Net Balance
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-indigo-300 backdrop-blur-md">
            <Wallet className="h-4.5 w-4.5" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {formatCurrency(totalBalance)}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-indigo-200 font-medium">
            <span className="flex items-center text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              Live
            </span>
            <span>Across all accounts</span>
          </div>
        </div>
      </Card>

      {/* 2. Monthly Income Card */}
      <Card hoverEffect className="relative overflow-hidden">
        <div className="flex items-center justify-between pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Monthly Income
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {formatCurrency(totalIncome)}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              Inflow
            </span>
            <span>Recorded this month</span>
          </div>
        </div>
      </Card>

      {/* 3. Monthly Expense Card */}
      <Card hoverEffect className="relative overflow-hidden">
        <div className="flex items-center justify-between pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Monthly Expenses
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
            <TrendingDown className="h-4.5 w-4.5" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {formatCurrency(totalExpense)}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
              <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
              Outflow
            </span>
            <span>Recorded this month</span>
          </div>
        </div>
      </Card>

      {/* 4. Savings Rate Card */}
      <Card hoverEffect className="relative overflow-hidden">
        <div className="flex items-center justify-between pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Net Savings Rate
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <PiggyBank className="h-4.5 w-4.5" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {savingsRate}%
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">
              <Sparkles className="h-3.5 w-3.5 mr-0.5" />
              {formatCurrency(netSavings)}
            </span>
            <span>Net saved</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
