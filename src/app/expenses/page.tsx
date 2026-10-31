"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingDown,
  Plus,
  Search,
  Trash2,
  Edit2,
  Filter,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useExpense } from "@/context/ExpenseContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Transaction } from "@/types";

export default function ExpensesPage() {
  const {
    transactions,
    deleteTransaction,
    setTransactionToEdit,
    setIsAddModalOpen,
    setModalDefaultType,
    categories,
  } = useExpense();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filterThreshold, setFilterThreshold] = useState<"all" | "high">("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");

  // Expense transactions only
  const expenseTx = useMemo(() => {
    return transactions.filter((t) => t.type === "expense");
  }, [transactions]);

  // Filtered expenses
  const filtered = useMemo(() => {
    let result = expenseTx.filter((tx) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tx.description.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        tx.account.toLowerCase().includes(q) ||
        (tx.note && tx.note.toLowerCase().includes(q));

      const matchesCat = selectedCategory === "all" || tx.categoryId === selectedCategory;
      const matchesThreshold = filterThreshold === "all" || tx.amount >= 200;

      return matchesSearch && matchesCat && matchesThreshold;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "date-desc") return b.date.localeCompare(a.date);
      if (sortBy === "date-asc") return a.date.localeCompare(b.date);
      if (sortBy === "amount-desc") return b.amount - a.amount;
      if (sortBy === "amount-asc") return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [expenseTx, searchTerm, selectedCategory, filterThreshold, sortBy]);

  const totalExpense = expenseTx.reduce((sum, t) => sum + t.amount, 0);
  const dailyAverage = totalExpense / 30;

  // Identify top outflow category
  const categorySpendMap = new Map<string, number>();
  for (const t of expenseTx) {
    categorySpendMap.set(t.category, (categorySpendMap.get(t.category) || 0) + t.amount);
  }

  let topCategory = "None";
  let topCategoryAmount = 0;
  for (const [cat, amt] of categorySpendMap.entries()) {
    if (amt > topCategoryAmount) {
      topCategory = cat;
      topCategoryAmount = amt;
    }
  }
  const topCategoryPercent = totalExpense > 0 ? Math.round((topCategoryAmount / totalExpense) * 100) : 0;

  const handleEdit = (tx: Transaction) => {
    setTransactionToEdit(tx);
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id: string, description: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${description}"? Account balance will be reversed in PostgreSQL.`
      )
    ) {
      await deleteTransaction(id);
    }
  };

  const handleLogExpense = () => {
    setTransactionToEdit(null);
    setModalDefaultType("expense");
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Expenses & Outflows
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track day-to-day expenditures, vendor bills, and optimize your burn rate connected to PostgreSQL.
          </p>
        </div>
        <Button size="sm" variant="danger" onClick={handleLogExpense} className="bg-rose-600 hover:bg-rose-700 text-white">
          <Plus className="h-4 w-4 mr-1.5" />
          Log New Expense
        </Button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/40">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-800 dark:text-rose-300">
            Total Outflows Recorded
          </span>
          <div className="text-3xl font-extrabold text-rose-700 dark:text-rose-400 mt-2">
            {formatCurrency(totalExpense)}
          </div>
          <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">
            Across {expenseTx.length} recorded purchases
          </p>
        </Card>

        <Card>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Daily Burn Velocity
          </span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {formatCurrency(dailyAverage)} / day
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Based on 30-day moving window
          </p>
        </Card>

        <Card>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Top Outflow Category
          </span>
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
            {topCategory} ({topCategoryPercent}%)
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {formatCurrency(topCategoryAmount)} spent in this category
          </p>
        </Card>
      </div>

      {/* Filter and Ledger */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto text-xs">
            {/* High Ticket Filter */}
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              <button
                onClick={() => setFilterThreshold("all")}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                  filterThreshold === "all"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterThreshold("high")}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                  filterThreshold === "high"
                    ? "bg-white text-rose-600 shadow-sm dark:bg-slate-900 dark:text-rose-400"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                High Ticket (&gt;$200)
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <option value="all">All</option>
                {categories
                  .filter((c) => c.type === "expense")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <option value="date-desc">Newest</option>
                <option value="date-asc">Oldest</option>
                <option value="amount-desc">Highest</option>
                <option value="amount-asc">Lowest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[10px] dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="py-2.5 pl-3 pr-3">Description</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Account</th>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5 text-right">Amount</th>
                <th className="py-2.5 pl-3 pr-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 pl-3 pr-3 font-semibold text-slate-900 dark:text-white">
                      {tx.description}
                      {tx.note && <span className="block text-[11px] text-slate-400 font-normal">{tx.note}</span>}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-500">{tx.account}</td>
                    <td className="px-3 py-3 text-slate-500">{formatDate(tx.date)}</td>
                    <td className="px-3 py-3 text-right font-bold text-rose-600 dark:text-rose-400">
                      -{formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3 pl-3 pr-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(tx)}
                          title="Edit expense"
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id, tx.description)}
                          title="Delete expense"
                          className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
