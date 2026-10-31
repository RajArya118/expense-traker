"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  ShieldAlert,
  Edit2,
  Trash2,
  Download,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatCurrency } from "@/lib/utils";
import { getBudgetsAction, deleteBudgetAction } from "@/actions/transactions";
import { StoredBudget } from "@/lib/db/transaction-repository";
import { useExpense } from "@/context/ExpenseContext";
import { BudgetDialog } from "@/components/budgets/BudgetDialog";

export default function BudgetsPage() {
  const { categories } = useExpense();
  const [budgets, setBudgets] = useState<StoredBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<StoredBudget | null>(null);

  const loadBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBudgetsAction();
      if (res.success && res.data) {
        setBudgets(res.data);
      }
    } catch (err) {
      console.error("Error loading budgets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const totalRemaining = Math.max(0, totalLimit - totalSpent);
  const overallPercentage = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  const overBudgetCategories = budgets.filter((b) => b.isOverBudget);
  const nearLimitCategories = budgets.filter((b) => b.isNearLimit);

  const handleOpenAdd = () => {
    setBudgetToEdit(null);
    setDialogOpen(true);
  };

  const handleEdit = (b: StoredBudget) => {
    setBudgetToEdit(b);
    setDialogOpen(true);
  };

  const handleDelete = async (budgetId: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove the budget cap for "${name}"?`)) {
      await deleteBudgetAction(budgetId);
      await loadBudgets();
    }
  };

  const exportBudgetCSV = () => {
    const headers = "Category,Limit,Spent,Remaining,Percentage,Status\n";
    const rows = budgets
      .map(
        (b) =>
          `"${b.categoryName}",${b.limit},${b.spent},${b.remaining},${b.percentage}%,"${
            b.isOverBudget ? "EXCEEDED" : b.isNearLimit ? "WARNING" : "HEALTHY"
          }"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenseflow_budgets_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Budgets & Spending Limits
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enforce spending discipline with category-specific monthly caps calculated from real database transactions.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={exportBudgetCSV}>
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
          <Button size="sm" onClick={handleOpenAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4 mr-1.5" />
            Set Budget Limit
          </Button>
        </div>
      </div>

      {/* Dynamic Exceeded Alert */}
      {overBudgetCategories.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 flex items-start gap-3 shadow-sm animate-pulse">
          <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold">Budget Cap Exceeded in {overBudgetCategories.length} Categories!</span> Real database spending has surpassed your allocated limit on{" "}
            {overBudgetCategories.map((b) => (
              <span key={b.id} className="font-semibold underline mr-1.5">
                {b.categoryName} (${(b.spent - b.limit).toFixed(2)} over)
              </span>
            ))}
            . Consider pausing non-essential purchases or reallocating limits.
          </div>
        </div>
      )}

      {/* Approaching Limit Warning */}
      {nearLimitCategories.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold">Approaching Threshold (&gt;80%):</span>{" "}
            {nearLimitCategories.map((b) => (
              <span key={b.id} className="font-medium mr-1.5">
                {b.categoryName} ({b.percentage}% used, ${b.remaining.toFixed(2)} remaining)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* High-Level Overview Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Allocated Budget
          </span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {formatCurrency(totalLimit)}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Spread across {budgets.length} expense categories
          </p>
        </Card>

        <Card>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Spent Month-to-Date
          </span>
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
            {formatCurrency(totalSpent)}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {overallPercentage}% of total allocated pool utilized
          </p>
        </Card>

        <Card className="bg-emerald-50/50 border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-900/40">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Available Runway Buffer
          </span>
          <div className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-2">
            {formatCurrency(totalRemaining)}
          </div>
          <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-300">
            Safe remaining buffer for current billing period
          </p>
        </Card>
      </div>

      {/* Category Budgets Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Category Spending Progress
          </h2>
          <span className="text-xs text-slate-400">
            Based on October 2026 database transactions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const isDanger = b.isOverBudget;
            const isWarning = b.isNearLimit;

            return (
              <Card
                key={b.id}
                className={`p-5 transition-all ${
                  isDanger
                    ? "border-rose-300 bg-rose-50/20 dark:border-rose-900/50 dark:bg-rose-950/10"
                    : isWarning
                    ? "border-amber-200 bg-amber-50/20 dark:border-amber-900/40 dark:bg-amber-950/10"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
                      style={{ backgroundColor: b.categoryColor }}
                    >
                      {b.categoryName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {b.categoryName}
                      </h3>
                      <p className="text-[11px] text-slate-400 capitalize">
                        {b.period.toLowerCase()} allowance
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant={isDanger ? "danger" : isWarning ? "warning" : "success"}
                      className="text-[10px]"
                    >
                      {isDanger ? "Exceeded" : isWarning ? "80%+" : "On Track"}
                    </Badge>
                    <button
                      onClick={() => handleEdit(b)}
                      title="Edit budget"
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id, b.categoryName)}
                      title="Remove cap"
                      className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatCurrency(b.spent)}{" "}
                      <span className="text-slate-400 font-normal">
                        of {formatCurrency(b.limit)}
                      </span>
                    </span>
                    <span
                      className={`font-bold ${
                        isDanger
                          ? "text-rose-600 dark:text-rose-400"
                          : isWarning
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {b.percentage}%
                    </span>
                  </div>

                  <ProgressBar
                    value={b.percentage}
                    indicatorColor={isDanger ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-indigo-600"}
                  />
                </div>

                {/* Card Footer Detail */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    {isDanger ? (
                      <span className="text-rose-600 font-bold">
                        ${(b.spent - b.limit).toFixed(2)} over limit
                      </span>
                    ) : (
                      <span>${b.remaining.toFixed(2)} remaining</span>
                    )}
                  </span>
                  <span>{b.spent > 0 ? "Active spending" : "Zero spend"}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Set/Edit Budget Dialog */}
      <BudgetDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        categories={categories}
        budgetToEdit={budgetToEdit}
        onSuccess={loadBudgets}
      />
    </div>
  );
}
