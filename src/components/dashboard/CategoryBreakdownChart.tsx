"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { SAMPLE_CATEGORY_BREAKDOWN } from "@/data/mockData";
import { formatCurrency } from "@/lib/utils";
import { useExpense } from "@/context/ExpenseContext";

export function CategoryBreakdownChart() {
  const { metrics } = useExpense();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const data = metrics?.categoryBreakdown && metrics.categoryBreakdown.length > 0
    ? metrics.categoryBreakdown.map((c) => ({
        category: c.name,
        amount: c.amount,
        percentage: c.percentage,
        color: c.color,
      }))
    : SAMPLE_CATEGORY_BREAKDOWN;

  const totalSpent = data.reduce((acc, curr) => acc + curr.amount, 0);

  // Calculate SVG donut stroke dash arrays
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercentage = 0;

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
            Category Breakdown
          </CardTitle>
          <CardDescription>
            Live database expense allocation
          </CardDescription>
        </div>
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-full">
          {data.length} Categories
        </span>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Donut Graphic & Center Total */}
        <div className="relative flex items-center justify-center my-3">
          <svg className="h-44 w-44 -rotate-90 transform" viewBox="0 0 160 160">
            {data.map((item) => {
              const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((cumulativePercentage / 100) * circumference);
              cumulativePercentage += item.percentage;
              const isSelected = activeCategory === item.category;

              return (
                <circle
                  key={item.category}
                  cx="80"
                  cy="80"
                  r={radius}
                  className="cursor-pointer transition-all duration-300"
                  stroke={item.color}
                  strokeWidth={isSelected ? "18" : "14"}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  fill="transparent"
                  strokeLinecap="round"
                  onMouseEnter={() => setActiveCategory(item.category)}
                  onMouseLeave={() => setActiveCategory(null)}
                />
              );
            })}
          </svg>

          {/* Center Callout */}
          <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total Spent
            </span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(totalSpent)}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              Live DB Outflows
            </span>
          </div>
        </div>

        {/* Categories List Legend */}
        <div className="mt-4 space-y-2.5 max-h-48 overflow-y-auto pr-1">
          {data.map((item) => {
            const isSelected = activeCategory === item.category;

            return (
              <div
                key={item.category}
                onMouseEnter={() => setActiveCategory(item.category)}
                onMouseLeave={() => setActiveCategory(null)}
                className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-slate-100 dark:bg-slate-800 font-bold"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate max-w-[130px] font-medium">
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(item.amount)}
                  </span>
                  <span className="text-[11px] text-slate-400 w-8 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
