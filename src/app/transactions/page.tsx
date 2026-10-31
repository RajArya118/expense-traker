"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  CreditCard,
  RotateCcw,
  ArrowUpDown,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useExpense } from "@/context/ExpenseContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Transaction } from "@/types";

export default function TransactionsPage() {
  const {
    transactions,
    deleteTransaction,
    setTransactionToEdit,
    setIsAddModalOpen,
    setModalDefaultType,
    categories,
    accounts,
  } = useExpense();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "income" | "expense">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");

  // Filter and sort transactions dynamically
  const filteredTransactions = useMemo(() => {
    let result = transactions.filter((tx) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tx.description.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        tx.account.toLowerCase().includes(q) ||
        (tx.note && tx.note.toLowerCase().includes(q));

      const matchesType = selectedType === "all" || tx.type === selectedType;
      const matchesCategory = selectedCategory === "all" || tx.categoryId === selectedCategory;
      const matchesAccount = selectedAccount === "all" || tx.accountId === selectedAccount;

      return matchesSearch && matchesType && matchesCategory && matchesAccount;
    });

    // Apply sorting
    result = [...result].sort((a, b) => {
      if (sortBy === "date-desc") return b.date.localeCompare(a.date);
      if (sortBy === "date-asc") return a.date.localeCompare(b.date);
      if (sortBy === "amount-desc") return b.amount - a.amount;
      if (sortBy === "amount-asc") return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [transactions, searchTerm, selectedType, selectedCategory, selectedAccount, sortBy]);

  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netFiltered = totalFilteredIncome - totalFilteredExpense;

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedType !== "all" ||
    selectedCategory !== "all" ||
    selectedAccount !== "all" ||
    sortBy !== "date-desc";

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedCategory("all");
    setSelectedAccount("all");
    setSortBy("date-desc");
  };

  const handleEdit = (tx: Transaction) => {
    setTransactionToEdit(tx);
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id: string, description: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${description}"? Account balances will update automatically in PostgreSQL.`
      )
    ) {
      await deleteTransaction(id);
    }
  };

  const handleOpenAddModal = (type: "income" | "expense" = "expense") => {
    setTransactionToEdit(null);
    setModalDefaultType(type);
    setIsAddModalOpen(true);
  };

  const exportCSV = () => {
    const headers = "ID,Description,Amount,Type,Category,Account,Date,Status,Note\n";
    const rows = filteredTransactions
      .map(
        (t) =>
          `"${t.id}","${t.description.replace(/"/g, '""')}",${t.amount},"${t.type}","${t.category}","${t.account}","${t.date}","${t.status}","${(t.note || "").replace(/"/g, '""')}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenseflow_transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Transactions Registry
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Search, filter, and manage all income and expense records connected to PostgreSQL.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
          <Button size="sm" onClick={() => handleOpenAddModal("expense")}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary Filter Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <span className="text-xs text-slate-500">Filtered Inflow:</span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            +{formatCurrency(totalFilteredIncome)}
          </span>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <span className="text-xs text-slate-500">Filtered Outflow:</span>
          <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
            -{formatCurrency(totalFilteredExpense)}
          </span>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <span className="text-xs text-slate-500">Net Flow:</span>
          <span
            className={`text-sm font-bold ${
              netFiltered >= 0
                ? "text-slate-900 dark:text-white"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatCurrency(netFiltered)}
          </span>
        </div>
      </div>

      {/* Filters Control Card */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by vendor, memo, category, account..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9.5 pr-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>

          {/* Type Filter Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 self-stretch md:self-auto">
            <button
              onClick={() => setSelectedType("all")}
              className={`flex-1 md:flex-none rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedType === "all"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedType("income")}
              className={`flex-1 md:flex-none rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedType === "income"
                  ? "bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              Income (+)
            </button>
            <button
              onClick={() => setSelectedType("expense")}
              className={`flex-1 md:flex-none rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedType === "expense"
                  ? "bg-white text-rose-600 shadow-sm dark:bg-slate-900 dark:text-rose-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              Expenses (-)
            </button>
          </div>
        </div>

        {/* Dropdowns & Reset Strip */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Account:</span>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="all">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 font-medium"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          )}

          <div className="ml-auto text-xs font-semibold text-slate-500">
            Showing{" "}
            <span className="text-slate-900 dark:text-white font-bold">
              {filteredTransactions.length}
            </span>{" "}
            records
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px] dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="py-3.5 pl-6 pr-3">Description</th>
                <th className="px-3 py-3.5">Category</th>
                <th className="px-3 py-3.5">Account</th>
                <th className="px-3 py-3.5">Date</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="px-3 py-3.5 text-right">Amount</th>
                <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No transactions match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isIncome = tx.type === "income";

                  return (
                    <tr
                      key={tx.id}
                      className="group hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Description & Icon */}
                      <td className="py-3.5 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-xl flex-shrink-0 ${
                              isIncome
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {isIncome ? (
                              <ArrowDownLeft className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {tx.description}
                            </p>
                            {tx.note && (
                              <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                {tx.note}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-3 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {tx.category}
                        </span>
                      </td>

                      {/* Account */}
                      <td className="px-3 py-3.5 text-slate-600 dark:text-slate-300 font-medium">
                        {tx.account}
                      </td>

                      {/* Date */}
                      <td className="px-3 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3.5">
                        <Badge
                          variant={tx.status === "completed" ? "success" : "warning"}
                          className="capitalize text-[10px]"
                        >
                          {tx.status}
                        </Badge>
                      </td>

                      {/* Amount */}
                      <td className="px-3 py-3.5 text-right font-bold whitespace-nowrap">
                        <span
                          className={
                            isIncome
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-slate-900 dark:text-slate-100"
                          }
                        >
                          {isIncome ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="py-3.5 pl-3 pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(tx)}
                            title="Edit transaction"
                            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id, tx.description)}
                            title="Delete transaction"
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
