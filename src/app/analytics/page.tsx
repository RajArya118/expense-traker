"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  TrendingUp,
  Award,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Download,
  Filter,
  DollarSign,
  PiggyBank,
  TrendingDown,
  Layers,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getAnalyticsAction } from "@/actions/transactions";
import { AnalyticsData } from "@/lib/db/transaction-repository";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"1m" | "3m" | "6m" | "1y" | "all">("6m");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [useCustomDates, setUseCustomDates] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAnalyticsAction(
        timeRange,
        useCustomDates && customStart ? customStart : undefined,
        useCustomDates && customEnd ? customEnd : undefined
      );
      if (res.success && res.data) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [timeRange, useCustomDates, customStart, customEnd]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleApplyCustomDates = () => {
    if (customStart && customEnd) {
      setUseCustomDates(true);
      fetchAnalytics();
    }
  };

  const handleResetPresets = (preset: "1m" | "3m" | "6m" | "1y" | "all") => {
    setUseCustomDates(false);
    setTimeRange(preset);
  };

  const exportAnalyticsCSV = () => {
    if (!analytics) return;

    let csvContent = "EXPENSEFLOW FINANCIAL INTELLIGENCE REPORT\n";
    csvContent += `Generated,${new Date().toISOString()}\n`;
    csvContent += `Time Range,${analytics.timeRange} (${analytics.startDate} to ${analytics.endDate})\n\n`;

    csvContent += "EXECUTIVE SUMMARY\n";
    csvContent += `Total Gross Income,$${analytics.totalIncome.toFixed(2)}\n`;
    csvContent += `Total Gross Expenses,$${analytics.totalExpense.toFixed(2)}\n`;
    csvContent += `Net Cash Surplus,$${analytics.netSavings.toFixed(2)}\n`;
    csvContent += `Effective Savings Rate,${analytics.savingsRate}%\n`;
    csvContent += `Daily Average Burn,$${analytics.dailyAverageSpend.toFixed(2)}\n\n`;

    csvContent += "MONTHLY CASH FLOW TRAJECTORY\n";
    csvContent += "Month,Income,Expense,Net Savings,Cumulative Savings\n";
    for (const m of analytics.monthlyCashFlow) {
      csvContent += `"${m.month}",${m.income},${m.expense},${m.savings},${m.cumulativeSavings}\n`;
    }
    csvContent += "\n";

    csvContent += "EXPENSE ALLOCATION BY CATEGORY\n";
    csvContent += "Category,Amount,Percentage\n";
    for (const c of analytics.expenseCategoryBreakdown) {
      csvContent += `"${c.name}",${c.amount},${c.percentage}%\n`;
    }
    csvContent += "\n";

    csvContent += "TOP 5 OUTFLOW DRIVERS\n";
    csvContent += "Description,Category,Account,Date,Amount\n";
    for (const t of analytics.topExpenseDrivers) {
      csvContent += `"${t.description}","${t.category}","${t.account}","${t.date}",${t.amount}\n`;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenseflow_analytics_${analytics.startDate}_to_${analytics.endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Tooltip custom formatter
  const CurrencyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-200 bg-white/95 p-3 text-xs shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
          <p className="font-bold text-slate-900 dark:text-white mb-1.5">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Financial Intelligence & Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time cash flow trajectory, net savings velocity, and expense allocations from PostgreSQL.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={exportAnalyticsCSV} disabled={!analytics}>
            <Download className="h-4 w-4 mr-1.5" />
            Export Report
          </Button>

          {/* Time Range Preset Buttons */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {(["1m", "3m", "6m", "1y", "all"] as const).map((r) => (
              <button
                key={r}
                onClick={() => handleResetPresets(r)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold uppercase transition-all ${
                  timeRange === r && !useCustomDates
                    ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <Card className="p-3.5 bg-slate-50/60 dark:bg-slate-900/50 border-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Analysis Window:
            </span>
            <span className="font-medium text-slate-500">
              {analytics ? `${formatDate(analytics.startDate)} – ${formatDate(analytics.endDate)}` : "Loading..."}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 text-[11px]">Custom Range:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleApplyCustomDates}
              className="text-xs h-7 px-2.5 rounded-lg"
            >
              Filter
            </Button>
          </div>
        </div>
      </Card>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Net Savings */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-400 font-semibold">
            <span>Net Period Savings</span>
            <PiggyBank className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {analytics ? formatCurrency(analytics.netSavings) : "$0.00"}
            </div>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              {analytics?.savingsRate}% retained for wealth creation
            </p>
          </div>
          <p className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
            Gross Income minus Gross Expenses
          </p>
        </Card>

        {/* 2. Total Inflows */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>Total Inflow</span>
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
              {analytics ? formatCurrency(analytics.totalIncome) : "$0.00"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              From contract retainers & capital yields
            </p>
          </div>
          <p className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
            Recorded over the selected window
          </p>
        </Card>

        {/* 3. Total Outflows */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold">
            <span>Total Outflow</span>
            <TrendingDown className="h-4 w-4" />
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-700 dark:text-rose-400">
              {analytics ? formatCurrency(analytics.totalExpense) : "$0.00"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Operational and lifestyle burn
            </p>
          </div>
          <p className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
            Consolidated expense items
          </p>
        </Card>

        {/* 4. Daily Average Spend */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-400 font-semibold">
            <span>Daily Velocity</span>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {analytics ? `${formatCurrency(analytics.dailyAverageSpend)}/d` : "$0.00/d"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Average 24h burn rate
            </p>
          </div>
          <p className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
            Divided across calendar days
          </p>
        </Card>
      </div>

      {/* Chart Section 1: Monthly Cash Flow Recharts BarChart */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Monthly Inflow vs Outflow Comparison
            </CardTitle>
            <CardDescription>
              Detailed monthly breakdown of revenues and expenses from PostgreSQL
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md bg-emerald-500 shadow-sm" />
              <span className="text-slate-600 dark:text-slate-400">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md bg-rose-500 shadow-sm" />
              <span className="text-slate-600 dark:text-slate-400">Expense</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-72 w-full">
            {analytics?.monthlyCashFlow && analytics.monthlyCashFlow.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlyCashFlow} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip content={<CurrencyTooltip />} />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No monthly transactions recorded for this period.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chart Section 2: 2 Columns (Cumulative Surplus Area Chart & Category Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cumulative Savings Area Chart */}
        <div className="lg:col-span-7">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Cumulative Capital Accumulation
              </CardTitle>
              <CardDescription>
                Growth curve of unallocated cash surplus over time
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex-1">
              <div className="h-64 w-full">
                {analytics?.monthlyCashFlow && analytics.monthlyCashFlow.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.monthlyCashFlow} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip content={<CurrencyTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="cumulativeSavings"
                        name="Cumulative Surplus"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#savingsGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No cumulative trajectory available.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expense Category Donut Chart */}
        <div className="lg:col-span-5">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Expense Category Allocation
              </CardTitle>
              <CardDescription>
                Relative distribution of outgoing capital
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 flex-1 flex flex-col items-center justify-center">
              <div className="h-56 w-full flex items-center justify-center">
                {analytics?.expenseCategoryBreakdown && analytics.expenseCategoryBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.expenseCategoryBreakdown}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {analytics.expenseCategoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CurrencyTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-slate-400">No category breakdown data.</div>
                )}
              </div>

              {/* Legend List */}
              <div className="w-full space-y-1.5 mt-2 max-h-36 overflow-y-auto pr-1">
                {analytics?.expenseCategoryBreakdown.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-xs py-0.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="truncate max-w-[120px] font-medium text-slate-700 dark:text-slate-300">
                        {c.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(c.amount)}
                      </span>
                      <span className="text-[11px] text-slate-400 w-8 text-right">
                        {c.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Expense Drivers & Income Sources Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top 5 Outflow Drivers */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Top 5 Single Outflow Drivers
            </h3>
            <p className="text-xs text-slate-400">
              The highest individual purchases logged in this timeframe
            </p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {analytics?.topExpenseDrivers && analytics.topExpenseDrivers.length > 0 ? (
              analytics.topExpenseDrivers.map((t, idx) => (
                <div key={t.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center font-bold text-[10px]">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{t.description}</p>
                      <p className="text-[11px] text-slate-400">
                        {t.category} • {formatDate(t.date)}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                    -{formatCurrency(t.amount)}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400">No expenses recorded.</div>
            )}
          </div>
        </Card>

        {/* Income Sources Summary */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Revenue Stream Contributions
            </h3>
            <p className="text-xs text-slate-400">
              Inflows categorized by client contracts and asset yields
            </p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {analytics?.incomeCategoryBreakdown && analytics.incomeCategoryBreakdown.length > 0 ? (
              analytics.incomeCategoryBreakdown.map((c) => (
                <div key={c.name} className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="font-semibold text-slate-900 dark:text-white">{c.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      +{formatCurrency(c.amount)}
                    </p>
                    <p className="text-[11px] text-slate-400">{c.percentage}% of gross</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400">No income streams recorded.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
