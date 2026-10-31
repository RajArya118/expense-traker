"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Plus,
  ArrowUpRight,
  Briefcase,
  Layers,
  Calendar,
  Search,
  Trash2,
  Edit2,
  RotateCcw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useExpense } from "@/context/ExpenseContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Transaction } from "@/types";

export default function IncomePage() {
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
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");

  // Income transactions only
  const incomeTx = useMemo(() => {
    return transactions.filter((t) => t.type === "income");
  }, [transactions]);

  // Filtered income transactions
  const filteredIncome = useMemo(() => {
    let result = incomeTx.filter((tx) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tx.description.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        tx.account.toLowerCase().includes(q) ||
        (tx.note && tx.note.toLowerCase().includes(q));

      const matchesCat = selectedCategory === "all" || tx.categoryId === selectedCategory;

      return matchesSearch && matchesCat;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "date-desc") return b.date.localeCompare(a.date);
      if (sortBy === "date-asc") return a.date.localeCompare(b.date);
      if (sortBy === "amount-desc") return b.amount - a.amount;
      if (sortBy === "amount-asc") return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [incomeTx, searchTerm, selectedCategory, sortBy]);

  // Calculations from actual records
  const totalIncome = incomeTx.reduce((sum, t) => sum + t.amount, 0);
  const projectedAnnual = totalIncome * 12;

  // Stream breakdown by category
  const streamMap = new Map<string, { amount: number; color: string; count: number }>();
  for (const tx of incomeTx) {
    const existing = streamMap.get(tx.category) || { amount: 0, color: "#10b981", count: 0 };
    existing.amount += tx.amount;
    existing.count += 1;
    streamMap.set(tx.category, existing);
  }

  const streams = Array.from(streamMap.entries()).map(([name, data]) => ({
    name,
    amount: data.amount,
    percentage: totalIncome > 0 ? Math.round((data.amount / totalIncome) * 100) : 0,
    count: data.count,
    color: data.color,
  }));

  const handleEdit = (tx: Transaction) => {
    setTransactionToEdit(tx);
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id: string, description: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete income entry "${description}"? Account balance will be reversed.`
      )
    ) {
      await deleteTransaction(id);
    }
  };

  const handleRecordIncome = () => {
    setTransactionToEdit(null);
    setModalDefaultType("income");
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Income Streams & Revenue
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor incoming cash flow, customer retainers, and dividends connected to PostgreSQL.
          </p>
        </div>
        <Button size="sm" onClick={handleRecordIncome} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4 mr-1.5" />
          Record New Income
        </Button>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Total Inflow Recorded
          </span>
          <div className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-2">
            {formatCurrency(totalIncome)}
          </div>
          <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-300">
            Across {incomeTx.length} recorded payments
          </p>
        </Card>

        <Card>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Active Revenue Streams
          </span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {streams.length} {streams.length === 1 ? "Stream" : "Streams"}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Contractual retainers, sales & capital yields
          </p>
        </Card>

        <Card>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Projected Annual Run-Rate
          </span>
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
            {formatCurrency(projectedAnnual)}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Estimated velocity based on active monthly inflow
          </p>
        </Card>
      </div>

      {/* Breakdown by Revenue Source */}
      {streams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Income Stream Breakdown</CardTitle>
            <CardDescription>
              Relative contribution by category from PostgreSQL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {streams.map((s) => (
              <div key={s.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800 dark:text-slate-200">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">({s.count} entries)</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {formatCurrency(s.amount)} ({s.percentage}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${s.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Filters & Ledger */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter income records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <option value="all">All Categories</option>
                {categories
                  .filter((c) => c.type === "income")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Highest First</option>
                <option value="amount-asc">Lowest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Income Table */}
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
              {filteredIncome.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No income records found. Click &quot;Record New Income&quot; to add one.
                  </td>
                </tr>
              ) : (
                filteredIncome.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 pl-3 pr-3 font-semibold text-slate-900 dark:text-white">
                      {tx.description}
                      {tx.note && <span className="block text-[11px] text-slate-400 font-normal">{tx.note}</span>}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-500">{tx.account}</td>
                    <td className="px-3 py-3 text-slate-500">{formatDate(tx.date)}</td>
                    <td className="px-3 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3 pl-3 pr-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(tx)}
                          title="Edit income"
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id, tx.description)}
                          title="Delete income"
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
