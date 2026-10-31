"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { SAMPLE_CASHFLOW } from "@/data/mockData";
import { formatCurrency } from "@/lib/utils";
import { useExpense } from "@/context/ExpenseContext";

export function IncomeExpenseChart() {
  const { metrics } = useExpense();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = metrics?.monthlyHistory && metrics.monthlyHistory.length > 0
    ? metrics.monthlyHistory.map((m) => ({
        month: m.month,
        income: m.income,
        expense: m.expenses,
        net: m.income - m.expenses,
      }))
    : SAMPLE_CASHFLOW;

  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense, 100))) * 1.15;
  const chartHeight = 220;

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
            Cash Flow & Trajectory
          </CardTitle>
          <CardDescription>
            Live database monthly income vs. expenses comparison
          </CardDescription>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md bg-emerald-500 shadow-sm" />
            <span className="text-slate-600 dark:text-slate-400">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md bg-indigo-500 shadow-sm" />
            <span className="text-slate-600 dark:text-slate-400">Expense</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Hover Tooltip display */}
        <div className="h-7 mb-2 flex items-center justify-between text-xs">
          {hoveredIndex !== null && data[hoveredIndex] ? (
            <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
              <span className="font-bold text-slate-800 dark:text-white">
                {data[hoveredIndex].month} 2026:
              </span>
              <span className="text-emerald-600 font-semibold">
                +{formatCurrency(data[hoveredIndex].income)}
              </span>
              <span className="text-indigo-600 font-semibold">
                -{formatCurrency(data[hoveredIndex].expense)}
              </span>
              <span className="text-slate-500 font-medium">
                Net: {formatCurrency(data[hoveredIndex].net)}
              </span>
            </div>
          ) : (
            <span className="text-slate-400 text-xs italic">
              Hover over bars to inspect detailed monthly figures
            </span>
          )}
        </div>

        {/* Visual Chart Bars */}
        <div className="relative flex items-end justify-between gap-3 pt-6 pb-2 h-56 border-b border-slate-100 dark:border-slate-800">
          {data.map((item, idx) => {
            const incomeHeight = Math.max(4, (item.income / maxVal) * chartHeight);
            const expenseHeight = Math.max(4, (item.expense / maxVal) * chartHeight);
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={item.month}
                className="flex flex-1 flex-col items-center justify-end h-full cursor-pointer group"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-end gap-1.5 sm:gap-2.5 w-full justify-center">
                  {/* Income Bar */}
                  <div
                    className={`w-3 sm:w-5 rounded-t-lg bg-emerald-500 transition-all duration-300 ${
                      isHovered ? "brightness-110 shadow-md shadow-emerald-500/30 scale-y-[1.02]" : "opacity-90"
                    }`}
                    style={{ height: `${incomeHeight}px` }}
                  />
                  {/* Expense Bar */}
                  <div
                    className={`w-3 sm:w-5 rounded-t-lg bg-indigo-500 transition-all duration-300 ${
                      isHovered ? "brightness-110 shadow-md shadow-indigo-500/30 scale-y-[1.02]" : "opacity-90"
                    }`}
                    style={{ height: `${expenseHeight}px` }}
                  />
                </div>
                {/* Month Label */}
                <span
                  className={`mt-3 text-xs font-semibold transition-colors ${
                    isHovered
                      ? "text-indigo-600 dark:text-indigo-400 font-bold"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
