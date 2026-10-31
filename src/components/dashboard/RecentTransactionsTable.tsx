"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRight,
  Trash2,
  Edit2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useExpense } from "@/context/ExpenseContext";

interface RecentTransactionsTableProps {
  limit?: number;
  showViewAll?: boolean;
}

export function RecentTransactionsTable({
  limit = 7,
  showViewAll = true,
}: RecentTransactionsTableProps) {
  const { transactions, deleteTransaction, setTransactionToEdit, setIsAddModalOpen } = useExpense();
  const displayed = transactions.slice(0, limit);

  const handleEdit = (tx: (typeof transactions)[0]) => {
    setTransactionToEdit(tx);
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id: string, description: string) => {
    if (window.confirm(`Are you sure you want to delete "${description}"? Account balances will update automatically.`)) {
      await deleteTransaction(id);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
            Recent Transactions
          </CardTitle>
          <CardDescription>
            Live feed of your most recent financial movements
          </CardDescription>
        </div>
        {showViewAll && (
          <Link
            href="/transactions"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            <span>View all ({transactions.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-y border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px] dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="py-3 pl-6 pr-3">Description</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3 hidden sm:table-cell">Account</th>
                <th className="px-3 py-3 hidden md:table-cell">Date</th>
                <th className="px-3 py-3 hidden sm:table-cell">Status</th>
                <th className="px-3 py-3 text-right">Amount</th>
                <th className="py-3 pl-3 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No transactions recorded yet. Click &quot;Add Transaction&quot; to begin.
                  </td>
                </tr>
              ) : (
                displayed.map((tx) => {
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
                          <div className="truncate max-w-[180px] sm:max-w-[220px]">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {tx.description}
                            </p>
                            {tx.note && (
                              <p className="text-[11px] text-slate-400 truncate">
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
                      <td className="px-3 py-3.5 hidden sm:table-cell text-slate-500 dark:text-slate-400">
                        {tx.account}
                      </td>

                      {/* Date */}
                      <td className="px-3 py-3.5 hidden md:table-cell text-slate-500 dark:text-slate-400">
                        {formatDate(tx.date)}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3.5 hidden sm:table-cell">
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

                      {/* Edit & Delete Action Buttons */}
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
      </CardContent>
    </Card>
  );
}
