"use client";

import React, { useState } from "react";
import {
  Layers,
  Plus,
  Home,
  Utensils,
  Cpu,
  Car,
  HeartPulse,
  Film,
  Briefcase,
  TrendingUp,
  Code,
  Tag,
  Check,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import { useExpense } from "@/context/ExpenseContext";
import { createCategoryAction, deleteCategoryAction } from "@/actions/transactions";

export default function CategoriesPage() {
  const { categories, transactions, refreshData } = useExpense();
  const [filterType, setFilterType] = useState<"all" | "expense" | "income">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Category form state
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState<"expense" | "income">("expense");
  const [newCatColor, setNewCatColor] = useState("#6366f1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = [
    "#6366f1", // Indigo
    "#10b981", // Emerald
    "#f43f5e", // Rose
    "#f97316", // Amber/Orange
    "#3b82f6", // Blue
    "#8b5cf6", // Purple
    "#14b8a6", // Teal
    "#ec4899", // Pink
  ];

  const filtered = filterType === "all"
    ? categories
    : categories.filter((c) => c.type === filterType);

  // Compute live statistics per category from database transactions
  const enrichedCategories = filtered.map((cat) => {
    const catTxs = transactions.filter((t) => t.categoryId === cat.id);
    const totalVolume = catTxs.reduce((sum, t) => sum + t.amount, 0);

    return {
      ...cat,
      transactionCount: catTxs.length,
      volume: totalVolume,
    };
  });

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await createCategoryAction(newCatName.trim(), newCatType, newCatColor);
      if (res.success) {
        await refreshData();
        setNewCatName("");
        setIsModalOpen(false);
      } else {
        setError(res.error || "Failed to create category.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      const res = await deleteCategoryAction(id);
      if (res.success) {
        await refreshData();
      } else {
        alert(res.error || "Cannot delete category.");
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Category Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Structure your ledger with colored category tags, icon sets, and budget caps in PostgreSQL.
          </p>
        </div>
        <Button size="sm" onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="h-4 w-4 mr-1.5" />
          Create Category
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterType("all")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            filterType === "all"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
          }`}
        >
          All Categories ({categories.length})
        </button>
        <button
          onClick={() => setFilterType("expense")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            filterType === "expense"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
          }`}
        >
          Expenses ({categories.filter((c) => c.type === "expense").length})
        </button>
        <button
          onClick={() => setFilterType("income")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            filterType === "income"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
          }`}
        >
          Inflow ({categories.filter((c) => c.type === "income").length})
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {enrichedCategories.map((c) => {
          const isExpense = c.type === "expense";

          return (
            <Card key={c.id} hoverEffect className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-sm font-bold text-base"
                      style={{ backgroundColor: c.color }}
                    >
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {c.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 capitalize">
                        {c.type} Category
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant={isExpense ? "danger" : "success"}
                      className="capitalize text-[10px]"
                    >
                      {c.type}
                    </Badge>
                    <button
                      onClick={() => handleDeleteCategory(c.id, c.name)}
                      title="Delete category"
                      className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Database Metrics */}
                <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400">Total Volume:</span>
                    <p className={`font-bold ${isExpense ? "text-slate-900 dark:text-white" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {formatCurrency(c.volume)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Transactions:</span>
                    <p className="font-bold text-slate-700 dark:text-slate-300">
                      {c.transactionCount} {c.transactionCount === 1 ? "entry" : "entries"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Color code: {c.color}</span>
                <span className="capitalize">{c.icon || "Tag"}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Category"
        description="Add a new custom category classification in PostgreSQL."
      >
        <form onSubmit={handleAddCategory} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setNewCatType("expense")}
              className={`rounded-lg py-2 text-xs font-bold transition-all ${
                newCatType === "expense"
                  ? "bg-white text-rose-600 shadow-sm dark:bg-slate-900 dark:text-rose-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              Expense Category
            </button>
            <button
              type="button"
              onClick={() => setNewCatType("income")}
              className={`rounded-lg py-2 text-xs font-bold transition-all ${
                newCatType === "income"
                  ? "bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              Income Category
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Category Name
            </label>
            <Input
              required
              placeholder="e.g. Software Subscriptions, Gym & Wellness"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Color Palette Swatches */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Category Color Accent
            </label>
            <div className="flex items-center gap-2.5">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewCatColor(c)}
                  className="h-7 w-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                  style={{ backgroundColor: c }}
                >
                  {newCatColor === c && <Check className="h-4 w-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? "Creating..." : "Save Category"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
