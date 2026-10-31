"use client";

import React from "react";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import { useExpense } from "@/context/ExpenseContext";

export function QuickAddModal() {
  const {
    isAddModalOpen,
    setIsAddModalOpen,
    transactionToEdit,
    setTransactionToEdit,
    modalDefaultType,
  } = useExpense();

  return (
    <TransactionDialog
      isOpen={isAddModalOpen}
      onClose={() => {
        setIsAddModalOpen(false);
        setTransactionToEdit(null);
      }}
      transactionToEdit={transactionToEdit}
      defaultType={modalDefaultType}
    />
  );
}
