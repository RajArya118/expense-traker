"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StoredBudget } from "@/lib/db/transaction-repository";
import { setBudgetAction } from "@/actions/transactions";
import { AlertCircle } from "lucide-react";

interface BudgetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { id: string; name: string; type: string }[];
  budgetToEdit?: StoredBudget | null;
  onSuccess: () => void;
}

export function BudgetDialog({
  isOpen,
  onClose,
  categories,
  budgetToEdit,
  onSuccess,
}: BudgetDialogProps) {
  const [categoryId, setCategoryId] = useState("");
  const [limit, setLimit] = useState("");
  const [period, setPeriod] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expenseCategories = categories.filter((c) => c.type === "expense");

  useEffect(() => {
    if (budgetToEdit) {
      setCategoryId(budgetToEdit.categoryId);
      setLimit(budgetToEdit.limit.toString());
      setPeriod(budgetToEdit.period);
    } else {
      if (expenseCategories.length > 0) {
        setCategoryId(expenseCategories[0].id);
      }
      setLimit("");
      setPeriod("MONTHLY");
    }
    setError(null);
  }, [budgetToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericLimit = parseFloat(limit);
    if (isNaN(numericLimit) || numericLimit <= 0) {
      setError("Please specify a valid limit greater than 0.");
      return;
    }
    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    setLoading(true);
    try {
      const res = await setBudgetAction(categoryId, numericLimit, period);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || "Failed to save budget limit.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={budgetToEdit ? "Adjust Budget Limit" : "Set Category Budget"}
      description="Define spending thresholds. You will be warned when spending reaches 80% or exceeds the cap."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Expense Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={Boolean(budgetToEdit)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 disabled:opacity-60"
          >
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Spending Limit ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-semibold text-slate-400">
                $
              </span>
              <Input
                required
                type="number"
                step="1"
                min="1"
                placeholder="500"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="pl-7 w-full font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {loading ? "Saving..." : budgetToEdit ? "Update Limit" : "Set Limit"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
