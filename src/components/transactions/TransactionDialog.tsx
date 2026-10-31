"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Transaction, TransactionType } from "@/types";
import { useExpense } from "@/context/ExpenseContext";
import { AlertCircle, Calendar, DollarSign, FileText, Tag, Wallet } from "lucide-react";

interface TransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
  defaultType?: TransactionType;
}

export function TransactionDialog({
  isOpen,
  onClose,
  transactionToEdit,
  defaultType = "expense",
}: TransactionDialogProps) {
  const { addTransaction, updateTransaction, categories, accounts } = useExpense();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isEditing = Boolean(transactionToEdit);

  // Pre-fill form when editing or resetting
  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setDescription(transactionToEdit.description);
      setAmount(transactionToEdit.amount.toString());
      setCategoryId(transactionToEdit.categoryId);
      setAccountId(transactionToEdit.accountId);
      setDate(transactionToEdit.date);
      setNote(transactionToEdit.note || "");
    } else {
      setType(defaultType);
      setDescription("");
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setNote("");
      // Pick first matching category and account
      const firstCat = categories.find((c) => c.type === defaultType);
      if (firstCat) setCategoryId(firstCat.id);
      if (accounts.length > 0) setAccountId(accounts[0].id);
    }
    setServerError(null);
    setFieldErrors({});
  }, [transactionToEdit, isOpen, defaultType, categories, accounts]);

  // When type toggles, adjust category if current selection does not match
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const matchingCat = categories.find((c) => c.type === newType);
    if (matchingCat) {
      setCategoryId(matchingCat.id);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    const numericAmount = parseFloat(amount);
    if (!description.trim()) {
      setFieldErrors((prev) => ({ ...prev, description: "Description is required." }));
      return;
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setFieldErrors((prev) => ({ ...prev, amount: "Please enter a valid amount greater than 0." }));
      return;
    }
    if (!categoryId) {
      setFieldErrors((prev) => ({ ...prev, categoryId: "Please select a category." }));
      return;
    }
    if (!accountId) {
      setFieldErrors((prev) => ({ ...prev, accountId: "Please select an account." }));
      return;
    }

    setLoading(true);

    try {
      if (isEditing && transactionToEdit) {
        const res = await updateTransaction(transactionToEdit.id, {
          description: description.trim(),
          amount: numericAmount,
          type,
          categoryId,
          accountId,
          date,
          note: note.trim() || undefined,
        });

        if (res.success) {
          onClose();
        } else {
          setServerError(res.error || "Failed to update transaction.");
          if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        }
      } else {
        const res = await addTransaction({
          description: description.trim(),
          amount: numericAmount,
          type,
          categoryId,
          accountId,
          date,
          note: note.trim() || undefined,
        });

        if (res.success) {
          onClose();
        } else {
          setServerError(res.error || "Failed to create transaction.");
          if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        }
      }
    } catch (err: any) {
      setServerError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Transaction" : "Record Transaction"}
      description={
        isEditing
          ? "Update details, category, or amount. Account balances will adjust automatically."
          : "Add an income or expense with immediate server-side validation and database sync."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Banner */}
        {serverError && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Type Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => handleTypeChange("expense")}
            className={`rounded-lg py-2 text-xs font-bold transition-all ${
              type === "expense"
                ? "bg-white text-rose-600 shadow-sm dark:bg-slate-900 dark:text-rose-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            Expense (-)
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("income")}
            className={`rounded-lg py-2 text-xs font-bold transition-all ${
              type === "income"
                ? "bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            Income (+)
          </button>
        </div>

        {/* Description Field */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Description
          </label>
          <Input
            required
            placeholder="e.g. AWS Cloud Hosting, Client Retainer"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full"
          />
          {fieldErrors.description && (
            <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
              {fieldErrors.description}
            </p>
          )}
        </div>

        {/* Amount & Date 2-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Amount ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-semibold text-slate-400">
                $
              </span>
              <Input
                required
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 w-full font-semibold"
              />
            </div>
            {fieldErrors.amount && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                {fieldErrors.amount}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Date
            </label>
            <Input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full"
            />
            {fieldErrors.date && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                {fieldErrors.date}
              </p>
            )}
          </div>
        </div>

        {/* Category & Account 2-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {fieldErrors.categoryId && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                {fieldErrors.categoryId}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Account / Wallet
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} (${Number(a.balance).toFixed(2)})
                </option>
              ))}
            </select>
            {fieldErrors.accountId && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                {fieldErrors.accountId}
              </p>
            )}
          </div>
        </div>

        {/* Note / Memo */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Note / Memo (Optional)
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Additional context or invoice ref..."
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={loading}
            className={type === "expense" ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </span>
            ) : isEditing ? (
              "Update Transaction"
            ) : type === "expense" ? (
              "Record Outflow"
            ) : (
              "Record Inflow"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
