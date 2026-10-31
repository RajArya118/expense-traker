"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Transaction, TransactionType } from "@/types";
import {
  getTransactionsAction,
  createTransactionAction,
  updateTransactionAction,
  deleteTransactionAction,
  getDashboardMetricsAction,
  getCategoriesAndAccountsAction,
  ActionResult,
} from "@/actions/transactions";
import { TransactionInput } from "@/lib/validations/transaction";
import { DashboardMetrics } from "@/lib/db/transaction-repository";

interface CategoryOption {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
}

interface AccountOption {
  id: string;
  name: string;
  type: string;
  balance: number;
  color: string;
}

interface ExpenseContextType {
  transactions: Transaction[];
  metrics: DashboardMetrics | null;
  categories: CategoryOption[];
  accounts: AccountOption[];
  loading: boolean;
  refreshData: () => Promise<void>;
  addTransaction: (tx: TransactionInput) => Promise<ActionResult<any>>;
  updateTransaction: (id: string, tx: TransactionInput) => Promise<ActionResult<any>>;
  deleteTransaction: (id: string) => Promise<ActionResult<any>>;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  transactionToEdit: Transaction | null;
  setTransactionToEdit: (tx: Transaction | null) => void;
  modalDefaultType: TransactionType;
  setModalDefaultType: (type: TransactionType) => void;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (open: boolean) => void;
  currency: string;
  setCurrency: (c: string) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal controls
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType>("expense");
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [currency, setCurrency] = useState("USD");

  const refreshData = useCallback(async () => {
    try {
      const [txRes, metricsRes, catAccRes] = await Promise.all([
        getTransactionsAction({ sortBy: "date-desc" }),
        getDashboardMetricsAction(),
        getCategoriesAndAccountsAction(),
      ]);

      if (txRes.success && txRes.data) {
        setTransactions(
          txRes.data.map((t) => ({
            id: t.id,
            description: t.description,
            amount: t.amount,
            type: t.type,
            category: t.categoryName,
            categoryId: t.categoryId,
            categoryColor: t.categoryColor,
            categoryIcon: t.categoryIcon,
            account: t.accountName,
            accountId: t.accountId,
            date: t.date,
            status: t.status,
            note: t.note,
          }))
        );
      }

      if (metricsRes.success && metricsRes.data) {
        setMetrics(metricsRes.data);
      }

      if (catAccRes.success) {
        setCategories(catAccRes.categories);
        setAccounts(catAccRes.accounts);
      }
    } catch (err) {
      console.error("Failed to refresh expense data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addTransaction = async (txData: TransactionInput): Promise<ActionResult<any>> => {
    const res = await createTransactionAction(txData);
    if (res.success) {
      await refreshData();
    }
    return res;
  };

  const updateTransaction = async (
    id: string,
    txData: TransactionInput
  ): Promise<ActionResult<any>> => {
    const res = await updateTransactionAction(id, txData);
    if (res.success) {
      await refreshData();
    }
    return res;
  };

  const deleteTransaction = async (id: string): Promise<ActionResult<any>> => {
    // Optimistic UI update
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    const res = await deleteTransactionAction(id);
    if (!res.success) {
      // Revert if failed
      await refreshData();
    } else {
      await refreshData();
    }
    return res;
  };

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        metrics,
        categories,
        accounts,
        loading,
        refreshData,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        isAddModalOpen,
        setIsAddModalOpen,
        transactionToEdit,
        setTransactionToEdit,
        modalDefaultType,
        setModalDefaultType,
        isMobileDrawerOpen,
        setIsMobileDrawerOpen,
        currency,
        setCurrency,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpense() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpense must be used within an ExpenseProvider");
  }
  return context;
}
