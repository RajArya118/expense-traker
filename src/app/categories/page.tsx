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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { SAMPLE_CATEGORIES } from "@/data/mockData";
import { Category } from "@/types";
import { formatCurrency } from "@/lib/utils";

// Helper icon resolver
const iconMap: Record<string, React.ReactNode> = {
  Home: <Home className="h-4.5 w-4.5" />,
  Utensils: <Utensils className="h-4.5 w-4.5" />,
  Cpu: <Cpu className="h-4.5 w-4.5" />,
  Car: <Car className="h-4.5 w-4.5" />,
  HeartPulse: <HeartPulse className="h-4.5 w-4.5" />,
  Film: <Film className="h-4.5 w-4.5" />,
  Briefcase: <Briefcase className="h-4.5 w-4.5" />,
  TrendingUp: <TrendingUp className="h-4.5 w-4.5" />,
  Code: <Code className="h-4.5 w-4.5" />,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(SAMPLE_CATEGORIES);
  const [filterType, setFilterType] = useState<"all" | "expense" | "income">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Category form state
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState<"expense" | "income">("expense");
  const [newCatColor, setNewCatColor] = useState("#6366f1");
  const [newCatBudget, setNewCatBudget] = useState("");

  const filtered = filterType === "all"
    ? categories
    : categories.filter((c) => c.type === filterType);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName,
      type: newCatType,
      icon: "Tag",
      color: newCatColor,
      monthlyBudget: parseFloat(newCatBudget) || 500,
      spent: 0,
      transactionCount: 0,
    };

    setCategories((prev) => [...prev, newCategory]);
    setNewCatName("");
    setNewCatBudget("");
    setIsModalOpen(false);
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
            Structure your ledger with colored category tags, icon sets, and budget caps.
          </p>
        </div>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
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
              : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300"
          }`}
        >
          All Categories ({categories.length})
        </button>
        <button
          onClick={() => setFilterType("expense")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            filterType === "expense"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300"
          }`}
        >
          Expense Categories ({categories.filter((c) => c.type === "expense").length})
        </button>
        <button
          onClick={() => setFilterType("income")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            filterType === "income"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300"
          }`}
        >
          Income Categories ({categories.filter((c) => c.type === "income").length})
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cat) => {
          const isExpense = cat.type === "expense";
          const percentUsed = cat.monthlyBudget > 0 ? (cat.spent / cat.monthlyBudget) * 100 : 0;

          return (
            <Card key={cat.id} hoverEffect className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm"
                      style={{ backgroundColor: cat.color }}
                    >
                      {iconMap[cat.icon] || <Tag className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {cat.transactionCount} transactions logged
                      </p>
                    </div>
                  </div>
                  <Badge variant={isExpense ? "danger" : "success"}>
                    {cat.type}
                  </Badge>
                </div>

                {isExpense && (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Current Spend</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(cat.spent)} / {formatCurrency(cat.monthlyBudget)}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          percentUsed > 100
                            ? "bg-rose-500"
                            : percentUsed > 85
                            ? "bg-amber-500"
                            : "bg-indigo-600"
                        }`}
                        style={{ width: `${Math.min(percentUsed, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Color tag</span>
                <span
                  className="h-3.5 w-8 rounded-full border border-black/10"
                  style={{ backgroundColor: cat.color }}
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Category"
        description="Create an organization bucket for your financial activities."
      >
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Category Name
            </label>
            <Input
              required
              placeholder="e.g. Subscriptions, Groceries, Travel"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Classification
              </label>
              <select
                value={newCatType}
                onChange={(e) => setNewCatType(e.target.value as "expense" | "income")}
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Monthly Target / Cap ($)
              </label>
              <Input
                type="number"
                placeholder="500"
                value={newCatBudget}
                onChange={(e) => setNewCatBudget(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Badge Color Accent
            </label>
            <div className="flex items-center gap-2">
              {["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"].map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setNewCatColor(c)}
                  className={`h-7 w-7 rounded-full flex items-center justify-center transition-transform ${
                    newCatColor === c ? "ring-2 ring-offset-2 ring-slate-900 scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {newCatColor === c && <Check className="h-3.5 w-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Category</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
