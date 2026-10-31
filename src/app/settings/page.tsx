"use client";

import React, { useState } from "react";
import {
  User,
  Bell,
  DollarSign,
  Shield,
  Download,
  Trash2,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useExpense } from "@/context/ExpenseContext";

export default function SettingsPage() {
  const { currency, setCurrency } = useExpense();
  const [name, setName] = useState("Alex Morgan");
  const [email, setEmail] = useState("alex@expenseflow.io");
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Preferences & Workspace Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Configure personal details, display currency, alert triggers, and security.
        </p>
      </div>

      {savedSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" />
          Settings updated successfully!
        </div>
      )}

      {/* 1. Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile Information</CardTitle>
          <CardDescription>
            Update your account identity and communication email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex items-center gap-4 pb-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 text-white font-bold text-xl shadow-md">
                AM
              </div>
              <div>
                <Button type="button" size="sm" variant="outline">
                  Change Photo
                </Button>
                <p className="text-[11px] text-slate-400 mt-1">
                  JPG, PNG or GIF. Max 2MB.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" size="sm">
                Save Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 2. Localization & Currency */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Currency & Format</CardTitle>
          <CardDescription>
            Choose your preferred display currency and number formatting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Primary Currency
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg">
            {[
              { code: "USD", symbol: "$", label: "US Dollar" },
              { code: "EUR", symbol: "€", label: "Euro" },
              { code: "GBP", symbol: "£", label: "British Pound" },
              { code: "INR", symbol: "₹", label: "Indian Rupee" },
            ].map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setCurrency(c.code)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  currency === c.code
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 font-bold"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="text-base font-extrabold text-slate-900 dark:text-white">
                  {c.symbol} {c.code}
                </div>
                <div className="text-[11px] text-slate-400 font-normal">{c.label}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 3. Notification Triggers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification Triggers</CardTitle>
          <CardDescription>
            Manage when and how ExpenseFlow warns you about threshold limits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Budget Overage Warnings
              </p>
              <p className="text-[11px] text-slate-400">
                Trigger push alert when any category surpasses 85% of monthly limit.
              </p>
            </div>
            <input
              type="checkbox"
              checked={budgetAlerts}
              onChange={(e) => setBudgetAlerts(e.target.checked)}
              className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Weekly Cash Flow Digest
              </p>
              <p className="text-[11px] text-slate-400">
                Receive weekly summary email every Monday at 9:00 AM.
              </p>
            </div>
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={(e) => setWeeklyDigest(e.target.checked)}
              className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. Data Export & Danger Zone */}
      <Card className="border-rose-100 dark:border-rose-950">
        <CardHeader>
          <CardTitle className="text-base text-rose-600 dark:text-rose-400">
            Export & Data Management
          </CardTitle>
          <CardDescription>
            Download an encrypted archive of your financial ledger.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Download JSON / CSV Backup
            </p>
            <p className="text-[11px] text-slate-400">
              Contains all accounts, transactions, and categories in standard format.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("Full archive downloaded successfully!")}
          >
            <Download className="h-4 w-4 mr-1.5" />
            Download Archive
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
