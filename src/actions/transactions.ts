"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/session";
import { validateTransactionInput, TransactionInput } from "@/lib/validations/transaction";
import {
  TransactionRepository,
  TransactionFilterOptions,
  StoredTransaction,
  DashboardMetrics,
  StoredBudget,
  AnalyticsData,
} from "@/lib/db/transaction-repository";

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Server Action: Fetches transactions for the authenticated user with filters, sorting, and search.
 */
export async function getTransactionsAction(
  filters?: TransactionFilterOptions
): Promise<ActionResult<StoredTransaction[]>> {
  try {
    const session = await requireAuth();
    await TransactionRepository.ensureUserProvisioned(session.userId);

    const transactions = await TransactionRepository.getTransactions(session.userId, filters);

    return {
      success: true,
      data: transactions,
    };
  } catch (err: any) {
    console.error("Error fetching transactions:", err);
    return {
      success: false,
      error: err.message || "Failed to retrieve transactions.",
      data: [],
    };
  }
}

/**
 * Server Action: Retrieves a single transaction by ID.
 */
export async function getTransactionAction(
  transactionId: string
): Promise<ActionResult<StoredTransaction | null>> {
  try {
    const session = await requireAuth();
    const tx = await TransactionRepository.getTransactionById(session.userId, transactionId);

    if (!tx) {
      return { success: false, error: "Transaction not found." };
    }

    return { success: true, data: tx };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch transaction." };
  }
}

/**
 * Server Action: Validates and creates a new transaction connected to PostgreSQL.
 */
export async function createTransactionAction(
  input: TransactionInput
): Promise<ActionResult<StoredTransaction>> {
  try {
    const session = await requireAuth();

    // 1. Server-side validation
    const validation = validateTransactionInput(input);
    if (!validation.isValid || !validation.sanitizedData) {
      return {
        success: false,
        error: "Please correct the errors in the form.",
        fieldErrors: validation.errors,
      };
    }

    // 2. Persist in database
    const newTx = await TransactionRepository.createTransaction(
      session.userId,
      validation.sanitizedData
    );

    // 3. Cache revalidation across all relevant routes
    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/income");
    revalidatePath("/expenses");
    revalidatePath("/analytics");
    revalidatePath("/budgets");

    return {
      success: true,
      data: newTx,
    };
  } catch (err: any) {
    console.error("Error creating transaction:", err);
    return {
      success: false,
      error: err.message || "Failed to record transaction.",
    };
  }
}

/**
 * Server Action: Validates and updates an existing transaction with atomic balance adjustment.
 */
export async function updateTransactionAction(
  transactionId: string,
  input: TransactionInput
): Promise<ActionResult<StoredTransaction>> {
  try {
    const session = await requireAuth();

    if (!transactionId) {
      return { success: false, error: "Transaction ID is required for update." };
    }

    // 1. Server-side validation
    const validation = validateTransactionInput(input);
    if (!validation.isValid || !validation.sanitizedData) {
      return {
        success: false,
        error: "Please correct the errors in the form.",
        fieldErrors: validation.errors,
      };
    }

    // 2. Execute update in repository
    const updated = await TransactionRepository.updateTransaction(
      session.userId,
      transactionId,
      validation.sanitizedData
    );

    if (!updated) {
      return {
        success: false,
        error: "Transaction could not be found or you do not have permission to edit it.",
      };
    }

    // 3. Revalidate paths
    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/income");
    revalidatePath("/expenses");
    revalidatePath("/analytics");
    revalidatePath("/budgets");

    return {
      success: true,
      data: updated,
    };
  } catch (err: any) {
    console.error("Error updating transaction:", err);
    return {
      success: false,
      error: err.message || "Failed to update transaction.",
    };
  }
}

/**
 * Server Action: Deletes a transaction and reverses its account balance impact.
 */
export async function deleteTransactionAction(
  transactionId: string
): Promise<ActionResult<{ deletedId: string }>> {
  try {
    const session = await requireAuth();

    if (!transactionId) {
      return { success: false, error: "Transaction ID is required for deletion." };
    }

    const success = await TransactionRepository.deleteTransaction(session.userId, transactionId);

    if (!success) {
      return {
        success: false,
        error: "Transaction not found or you lack permission to delete it.",
      };
    }

    // Revalidate paths
    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/income");
    revalidatePath("/expenses");
    revalidatePath("/analytics");
    revalidatePath("/budgets");

    return {
      success: true,
      data: { deletedId: transactionId },
    };
  } catch (err: any) {
    console.error("Error deleting transaction:", err);
    return {
      success: false,
      error: err.message || "Failed to delete transaction.",
    };
  }
}

/**
 * Server Action: Computes real-time dashboard calculations from database transactions.
 */
export async function getDashboardMetricsAction(): Promise<ActionResult<DashboardMetrics>> {
  try {
    const session = await requireAuth();
    await TransactionRepository.ensureUserProvisioned(session.userId);

    const metrics = await TransactionRepository.getDashboardMetrics(session.userId);

    return {
      success: true,
      data: metrics,
    };
  } catch (err: any) {
    console.error("Error computing dashboard metrics:", err);
    return {
      success: false,
      error: err.message || "Failed to compute financial metrics.",
    };
  }
}

/**
 * Server Action: Retrieves available categories and accounts for the transaction dialogs.
 */
export async function getCategoriesAndAccountsAction() {
  try {
    const session = await requireAuth();
    await TransactionRepository.ensureUserProvisioned(session.userId);

    const [categories, accounts] = await Promise.all([
      TransactionRepository.getCategories(session.userId),
      TransactionRepository.getAccounts(session.userId),
    ]);

    return {
      success: true,
      categories,
      accounts,
    };
  } catch (err: any) {
    return {
      success: false,
      categories: [],
      accounts: [],
    };
  }
}

/**
 * Server Action: Retrieves budgets with spending calculated from database transactions.
 */
export async function getBudgetsAction(
  targetMonth?: number,
  targetYear?: number
): Promise<ActionResult<StoredBudget[]>> {
  try {
    const session = await requireAuth();
    await TransactionRepository.ensureUserProvisioned(session.userId);

    const budgets = await TransactionRepository.getBudgets(session.userId, targetMonth, targetYear);
    return { success: true, data: budgets };
  } catch (err: any) {
    console.error("Error retrieving budgets:", err);
    return { success: false, error: err.message || "Failed to load budgets.", data: [] };
  }
}

/**
 * Server Action: Sets or updates a category budget limit.
 */
export async function setBudgetAction(
  categoryId: string,
  limit: number,
  period: "MONTHLY" | "YEARLY" = "MONTHLY"
): Promise<ActionResult<StoredBudget>> {
  try {
    const session = await requireAuth();

    if (!categoryId) {
      return { success: false, error: "Category is required." };
    }
    if (isNaN(limit) || limit <= 0) {
      return { success: false, error: "Limit must be a positive number greater than 0." };
    }

    const budget = await TransactionRepository.setBudget(session.userId, categoryId, limit, period);
    revalidatePath("/budgets");
    revalidatePath("/analytics");
    return { success: true, data: budget };
  } catch (err: any) {
    console.error("Error setting budget:", err);
    return { success: false, error: err.message || "Failed to set budget." };
  }
}

/**
 * Server Action: Deletes a category budget limit.
 */
export async function deleteBudgetAction(
  budgetId: string
): Promise<ActionResult<{ deletedId: string }>> {
  try {
    const session = await requireAuth();

    const success = await TransactionRepository.deleteBudget(session.userId, budgetId);
    if (!success) {
      return { success: false, error: "Budget not found or access denied." };
    }

    revalidatePath("/budgets");
    return { success: true, data: { deletedId: budgetId } };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete budget." };
  }
}

/**
 * Server Action: Generates comprehensive financial analytics and reports from database transactions.
 */
export async function getAnalyticsAction(
  timeRange: "1m" | "3m" | "6m" | "1y" | "all" = "6m",
  customStart?: string,
  customEnd?: string
): Promise<ActionResult<AnalyticsData>> {
  try {
    const session = await requireAuth();
    await TransactionRepository.ensureUserProvisioned(session.userId);

    const analytics = await TransactionRepository.getAnalytics(
      session.userId,
      timeRange,
      customStart,
      customEnd
    );
    return { success: true, data: analytics };
  } catch (err: any) {
    console.error("Error computing analytics:", err);
    return { success: false, error: err.message || "Failed to compute financial analytics." };
  }
}
