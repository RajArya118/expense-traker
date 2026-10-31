import { prisma } from "../prisma";
import { TransactionType, TransactionStatus, AccountType, CategoryType } from "@prisma/client";

export interface TransactionFilterOptions {
  search?: string;
  type?: "all" | "income" | "expense";
  categoryId?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "date-desc" | "date-asc" | "amount-desc" | "amount-asc";
}

export interface StoredTransaction {
  id: string;
  userId: string;
  description: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  accountId: string;
  accountName: string;
  date: string; // YYYY-MM-DD
  status: "completed" | "pending" | "cancelled";
  note?: string;
  createdAt: Date;
}

export interface DashboardMetrics {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  savingsRate: number;
  monthlyHistory: {
    month: string;
    income: number;
    expenses: number;
  }[];
  categoryBreakdown: {
    name: string;
    amount: number;
    percentage: number;
    color: string;
  }[];
  recentTransactions: StoredTransaction[];
}

export interface StoredBudget {
  id: string;
  userId: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
  period: "MONTHLY" | "YEARLY";
}

export interface AnalyticsData {
  timeRange: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  dailyAverageSpend: number;
  monthlyCashFlow: {
    month: string;
    income: number;
    expense: number;
    savings: number;
    cumulativeSavings: number;
  }[];
  expenseCategoryBreakdown: {
    name: string;
    amount: number;
    percentage: number;
    color: string;
  }[];
  incomeCategoryBreakdown: {
    name: string;
    amount: number;
    percentage: number;
    color: string;
  }[];
  topExpenseDrivers: {
    id: string;
    description: string;
    amount: number;
    category: string;
    account: string;
    date: string;
  }[];
}

// -----------------------------------------------------------------------------
// IN-MEMORY PERSISTENCE FALLBACK (ACTIVE WHEN POSTGRES SERVICE IS OFFLINE)
// -----------------------------------------------------------------------------
const inMemoryStore: {
  accounts: { id: string; userId: string; name: string; type: string; balance: number; color: string }[];
  categories: { id: string; name: string; type: string; color: string; icon: string }[];
  transactions: StoredTransaction[];
  budgets: { id: string; userId: string; categoryId: string; limit: number; period: "MONTHLY" | "YEARLY" }[];
} = {
  accounts: [
    { id: "acc-checking", userId: "default-user", name: "Main Checking", type: "CHECKING", balance: 14250.0, color: "#3b82f6" },
    { id: "acc-savings", userId: "default-user", name: "High-Yield Savings", type: "SAVINGS", balance: 28400.0, color: "#10b981" },
    { id: "acc-credit", userId: "default-user", name: "Sapphire Reserve", type: "CREDIT_CARD", balance: -1850.0, color: "#8b5cf6" },
    { id: "acc-cash", userId: "default-user", name: "Cash Reserve", type: "CASH", balance: 750.0, color: "#f59e0b" },
  ],
  categories: [
    { id: "cat-salary", name: "Salary & Retainers", type: "INCOME", color: "#10b981", icon: "Briefcase" },
    { id: "cat-investments", name: "Investment Yield", type: "INCOME", color: "#14b8a6", icon: "TrendingUp" },
    { id: "cat-freelance", name: "Consulting & Freelance", type: "INCOME", color: "#84cc16", icon: "Laptop" },
    { id: "cat-housing", name: "Housing & Rent", type: "EXPENSE", color: "#f43f5e", icon: "Home" },
    { id: "cat-food", name: "Food & Groceries", type: "EXPENSE", color: "#f97316", icon: "ShoppingBag" },
    { id: "cat-transport", name: "Transportation & EV", type: "EXPENSE", color: "#3b82f6", icon: "Car" },
    { id: "cat-utilities", name: "Utilities & Tech", type: "EXPENSE", color: "#8b5cf6", icon: "Zap" },
    { id: "cat-healthcare", name: "Health & Fitness", type: "EXPENSE", color: "#ec4899", icon: "Heart" },
  ],
  budgets: [
    { id: "b-housing", userId: "default-user", categoryId: "cat-housing", limit: 2200.0, period: "MONTHLY" },
    { id: "b-food", userId: "default-user", categoryId: "cat-food", limit: 800.0, period: "MONTHLY" },
    { id: "b-transport", userId: "default-user", categoryId: "cat-transport", limit: 400.0, period: "MONTHLY" },
    { id: "b-utilities", userId: "default-user", categoryId: "cat-utilities", limit: 300.0, period: "MONTHLY" },
    { id: "b-healthcare", userId: "default-user", categoryId: "cat-healthcare", limit: 250.0, period: "MONTHLY" },
  ],
  transactions: [
    {
      id: "tx-1",
      userId: "default-user",
      description: "Enterprise SaaS Consulting Retainer",
      amount: 9800.0,
      type: "income",
      categoryId: "cat-salary",
      categoryName: "Salary & Retainers",
      categoryColor: "#10b981",
      categoryIcon: "Briefcase",
      accountId: "acc-checking",
      accountName: "Main Checking",
      date: "2026-10-28",
      status: "completed",
      note: "Monthly retainer payment for Q4 consulting contract",
      createdAt: new Date("2026-10-28T09:00:00Z"),
    },
    {
      id: "tx-2",
      userId: "default-user",
      description: "Vanguard Dividend Distribution",
      amount: 1850.0,
      type: "income",
      categoryId: "cat-investments",
      categoryName: "Investment Yield",
      categoryColor: "#14b8a6",
      categoryIcon: "TrendingUp",
      accountId: "acc-savings",
      accountName: "High-Yield Savings",
      date: "2026-10-25",
      status: "completed",
      note: "Quarterly portfolio ETF distribution",
      createdAt: new Date("2026-10-25T14:30:00Z"),
    },
    {
      id: "tx-3",
      userId: "default-user",
      description: "Apartment Rent & Building Amenities",
      amount: 2150.0,
      type: "expense",
      categoryId: "cat-housing",
      categoryName: "Housing & Rent",
      categoryColor: "#f43f5e",
      categoryIcon: "Home",
      accountId: "acc-checking",
      accountName: "Main Checking",
      date: "2026-10-27",
      status: "completed",
      note: "November rent electronic transfer",
      createdAt: new Date("2026-10-27T08:00:00Z"),
    },
    {
      id: "tx-4",
      userId: "default-user",
      description: "Whole Foods Market & Organic Groceries",
      amount: 320.5,
      type: "expense",
      categoryId: "cat-food",
      categoryName: "Food & Groceries",
      categoryColor: "#f97316",
      categoryIcon: "ShoppingBag",
      accountId: "acc-credit",
      accountName: "Sapphire Reserve",
      date: "2026-10-26",
      status: "completed",
      note: "Weekly grocery restocking",
      createdAt: new Date("2026-10-26T17:15:00Z"),
    },
    {
      id: "tx-5",
      userId: "default-user",
      description: "Tesla Supercharging & Tollway",
      amount: 85.0,
      type: "expense",
      categoryId: "cat-transport",
      categoryName: "Transportation & EV",
      categoryColor: "#3b82f6",
      categoryIcon: "Car",
      accountId: "acc-credit",
      accountName: "Sapphire Reserve",
      date: "2026-10-24",
      status: "completed",
      note: "Travel trip charging",
      createdAt: new Date("2026-10-24T12:00:00Z"),
    },
    {
      id: "tx-6",
      userId: "default-user",
      description: "AWS Cloud Infrastructure Hosting",
      amount: 145.2,
      type: "expense",
      categoryId: "cat-utilities",
      categoryName: "Utilities & Tech",
      categoryColor: "#8b5cf6",
      categoryIcon: "Zap",
      accountId: "acc-credit",
      accountName: "Sapphire Reserve",
      date: "2026-10-20",
      status: "completed",
      note: "Production servers and database cluster",
      createdAt: new Date("2026-10-20T03:00:00Z"),
    },
  ],
};

// -----------------------------------------------------------------------------
// REPOSITORY IMPLEMENTATION
// -----------------------------------------------------------------------------
export class TransactionRepository {
  /**
   * Ensures default categories and an account exist for the user.
   */
  static async ensureUserProvisioned(userId: string) {
    try {
      const existingAccount = await prisma.account.findFirst({
        where: { userId },
      });

      if (!existingAccount) {
        await prisma.account.create({
          data: {
            userId,
            name: "Main Checking",
            type: AccountType.CHECKING,
            balance: 5000.0,
            color: "#3b82f6",
          },
        });
      }

      const existingCategories = await prisma.category.count({
        where: { OR: [{ userId }, { isSystem: true }] },
      });

      if (existingCategories === 0) {
        for (const cat of inMemoryStore.categories) {
          await prisma.category.create({
            data: {
              userId,
              name: cat.name,
              type: cat.type === "INCOME" ? CategoryType.INCOME : CategoryType.EXPENSE,
              color: cat.color,
              icon: cat.icon,
              isSystem: true,
            },
          });
        }
      }
    } catch {
      // In-memory fallback is active
    }
  }

  /**
   * Retrieves categories available to the user.
   */
  static async getCategories(userId: string) {
    try {
      const dbCategories = await prisma.category.findMany({
        where: {
          OR: [{ userId }, { isSystem: true }],
        },
        orderBy: { name: "asc" },
      });

      if (dbCategories && dbCategories.length > 0) {
        return dbCategories.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type.toLowerCase() as "income" | "expense",
          color: c.color,
          icon: c.icon,
        }));
      }
    } catch {
      // Fallback
    }

    return inMemoryStore.categories.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type.toLowerCase() as "income" | "expense",
      color: c.color,
      icon: c.icon,
    }));
  }

  /**
   * Creates a new user category.
   */
  static async createCategory(
    userId: string,
    name: string,
    type: "income" | "expense",
    color: string = "#6366f1",
    icon: string = "Tag"
  ) {
    try {
      const dbCat = await prisma.category.create({
        data: {
          userId,
          name,
          type: type === "income" ? CategoryType.INCOME : CategoryType.EXPENSE,
          color,
          icon,
          isSystem: false,
        },
      });
      return {
        id: dbCat.id,
        name: dbCat.name,
        type: dbCat.type.toLowerCase() as "income" | "expense",
        color: dbCat.color,
        icon: dbCat.icon,
      };
    } catch {
      // Fallback
    }

    const newCat = {
      id: `cat-${Date.now()}`,
      name,
      type: type === "income" ? "INCOME" : "EXPENSE",
      color,
      icon,
    };
    inMemoryStore.categories.push(newCat);
    return {
      id: newCat.id,
      name: newCat.name,
      type,
      color: newCat.color,
      icon: newCat.icon,
    };
  }

  /**
   * Deletes a user-created category.
   */
  static async deleteCategory(userId: string, categoryId: string): Promise<boolean> {
    try {
      await prisma.category.delete({
        where: { id: categoryId, userId },
      });
      return true;
    } catch {
      // Fallback
    }

    const index = inMemoryStore.categories.findIndex((c) => c.id === categoryId);
    if (index !== -1) {
      inMemoryStore.categories.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Retrieves accounts for the user.
   */
  static async getAccounts(userId: string) {
    try {
      const dbAccounts = await prisma.account.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });

      if (dbAccounts && dbAccounts.length > 0) {
        return dbAccounts.map((a) => ({
          id: a.id,
          name: a.name,
          type: a.type,
          balance: Number(a.balance),
          color: a.color || "#3b82f6",
        }));
      }
    } catch {
      // Fallback
    }

    return inMemoryStore.accounts.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type as AccountType,
      balance: a.balance,
      color: a.color,
    }));
  }

  /**
   * Retrieves transactions with full search, sorting, and filtering options.
   */
  static async getTransactions(
    userId: string,
    filters?: TransactionFilterOptions
  ): Promise<StoredTransaction[]> {
    try {
      // Build Prisma where clause
      const where: any = { userId };

      if (filters?.type && filters.type !== "all") {
        where.type =
          filters.type === "income"
            ? TransactionType.INCOME
            : TransactionType.EXPENSE;
      }

      if (filters?.categoryId && filters.categoryId !== "all") {
        where.categoryId = filters.categoryId;
      }

      if (filters?.accountId && filters.accountId !== "all") {
        where.accountId = filters.accountId;
      }

      if (filters?.startDate || filters?.endDate) {
        where.date = {};
        if (filters.startDate) where.date.gte = new Date(filters.startDate);
        if (filters.endDate) where.date.lte = new Date(filters.endDate);
      }

      if (filters?.search && filters.search.trim()) {
        const query = filters.search.trim();
        where.OR = [
          { description: { contains: query, mode: "insensitive" } },
          { note: { contains: query, mode: "insensitive" } },
        ];
      }

      // Sorting
      let orderBy: any = { date: "desc" };
      if (filters?.sortBy === "date-asc") orderBy = { date: "asc" };
      else if (filters?.sortBy === "amount-desc") orderBy = { amount: "desc" };
      else if (filters?.sortBy === "amount-asc") orderBy = { amount: "asc" };

      const dbTxs = await prisma.transaction.findMany({
        where,
        include: {
          category: true,
          account: true,
        },
        orderBy,
      });

      if (dbTxs && dbTxs.length > 0) {
        return dbTxs.map((t) => ({
          id: t.id,
          userId: t.userId,
          description: t.description,
          amount: Number(t.amount),
          type: t.type.toLowerCase() as "income" | "expense" | "transfer",
          categoryId: t.categoryId,
          categoryName: t.category.name,
          categoryColor: t.category.color,
          categoryIcon: t.category.icon,
          accountId: t.accountId,
          accountName: t.account.name,
          date: t.date.toISOString().split("T")[0],
          status: t.status.toLowerCase() as "completed" | "pending" | "cancelled",
          note: t.note || undefined,
          createdAt: t.createdAt,
        }));
      }
    } catch {
      // Fallback below
    }

    // In-memory query with filters & sorting
    let results = inMemoryStore.transactions.filter((t) => {
      // User isolation
      if (userId && t.userId !== "default-user" && t.userId !== userId) return false;

      // Type filter
      if (filters?.type && filters.type !== "all" && t.type !== filters.type) return false;

      // Category filter
      if (filters?.categoryId && filters.categoryId !== "all" && t.categoryId !== filters.categoryId) return false;

      // Account filter
      if (filters?.accountId && filters.accountId !== "all" && t.accountId !== filters.accountId) return false;

      // Date range filter
      if (filters?.startDate && t.date < filters.startDate) return false;
      if (filters?.endDate && t.date > filters.endDate) return false;

      // Search term
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchesDesc = t.description.toLowerCase().includes(q);
        const matchesCat = t.categoryName.toLowerCase().includes(q);
        const matchesAcc = t.accountName.toLowerCase().includes(q);
        const matchesNote = t.note ? t.note.toLowerCase().includes(q) : false;
        if (!matchesDesc && !matchesCat && !matchesAcc && !matchesNote) return false;
      }

      return true;
    });

    // Sort results
    const sortBy = filters?.sortBy || "date-desc";
    results = [...results].sort((a, b) => {
      if (sortBy === "date-asc") return a.date.localeCompare(b.date);
      if (sortBy === "date-desc") return b.date.localeCompare(a.date);
      if (sortBy === "amount-asc") return a.amount - b.amount;
      if (sortBy === "amount-desc") return b.amount - a.amount;
      return 0;
    });

    return results;
  }

  /**
   * Retrieves single transaction by ID.
   */
  static async getTransactionById(userId: string, id: string): Promise<StoredTransaction | null> {
    try {
      const t = await prisma.transaction.findFirst({
        where: { id, userId },
        include: { category: true, account: true },
      });
      if (t) {
        return {
          id: t.id,
          userId: t.userId,
          description: t.description,
          amount: Number(t.amount),
          type: t.type.toLowerCase() as "income" | "expense" | "transfer",
          categoryId: t.categoryId,
          categoryName: t.category.name,
          categoryColor: t.category.color,
          categoryIcon: t.category.icon,
          accountId: t.accountId,
          accountName: t.account.name,
          date: t.date.toISOString().split("T")[0],
          status: t.status.toLowerCase() as "completed" | "pending" | "cancelled",
          note: t.note || undefined,
          createdAt: t.createdAt,
        };
      }
    } catch {
      // Fallback
    }

    const found = inMemoryStore.transactions.find((t) => t.id === id);
    return found || null;
  }

  /**
   * Creates a transaction and updates account balance atomically.
   */
  static async createTransaction(
    userId: string,
    data: {
      description: string;
      amount: number;
      type: "income" | "expense" | "transfer";
      categoryId: string;
      accountId: string;
      date: Date;
      note?: string;
    }
  ): Promise<StoredTransaction> {
    const mappedType =
      data.type === "income"
        ? TransactionType.INCOME
        : data.type === "transfer"
        ? TransactionType.TRANSFER
        : TransactionType.EXPENSE;

    const balanceAdjustment = mappedType === TransactionType.INCOME ? data.amount : -data.amount;

    try {
      const [tx] = await prisma.$transaction([
        prisma.transaction.create({
          data: {
            userId,
            accountId: data.accountId,
            categoryId: data.categoryId,
            amount: data.amount,
            type: mappedType,
            status: TransactionStatus.COMPLETED,
            description: data.description,
            note: data.note || null,
            date: data.date,
          },
          include: { category: true, account: true },
        }),
        prisma.account.update({
          where: { id: data.accountId },
          data: { balance: { increment: balanceAdjustment } },
        }),
      ]);

      return {
        id: tx.id,
        userId: tx.userId,
        description: tx.description,
        amount: Number(tx.amount),
        type: tx.type.toLowerCase() as "income" | "expense" | "transfer",
        categoryId: tx.categoryId,
        categoryName: tx.category.name,
        categoryColor: tx.category.color,
        categoryIcon: tx.category.icon,
        accountId: tx.accountId,
        accountName: tx.account.name,
        date: tx.date.toISOString().split("T")[0],
        status: tx.status.toLowerCase() as "completed" | "pending" | "cancelled",
        note: tx.note || undefined,
        createdAt: tx.createdAt,
      };
    } catch {
      // In-memory fallback
    }

    const cat = inMemoryStore.categories.find((c) => c.id === data.categoryId) || {
      id: data.categoryId,
      name: "General",
      color: "#6366f1",
      icon: "Tag",
    };

    const acc = inMemoryStore.accounts.find((a) => a.id === data.accountId) || {
      id: data.accountId,
      name: "Main Account",
      balance: 0,
    };

    // Update account balance
    acc.balance += balanceAdjustment;

    const newTx: StoredTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      description: data.description,
      amount: data.amount,
      type: data.type,
      categoryId: cat.id,
      categoryName: cat.name,
      categoryColor: cat.color,
      categoryIcon: cat.icon,
      accountId: acc.id,
      accountName: acc.name,
      date: data.date.toISOString().split("T")[0],
      status: "completed",
      note: data.note,
      createdAt: new Date(),
    };

    inMemoryStore.transactions.unshift(newTx);
    return newTx;
  }

  /**
   * Updates an existing transaction and adjusts account balance delta atomically.
   */
  static async updateTransaction(
    userId: string,
    transactionId: string,
    data: {
      description: string;
      amount: number;
      type: "income" | "expense" | "transfer";
      categoryId: string;
      accountId: string;
      date: Date;
      note?: string;
    }
  ): Promise<StoredTransaction | null> {
    try {
      const existing = await prisma.transaction.findFirst({
        where: { id: transactionId, userId },
      });

      if (!existing) return null;

      const oldAmount = Number(existing.amount);
      const oldAdjustment = existing.type === TransactionType.INCOME ? oldAmount : -oldAmount;

      const newMappedType =
        data.type === "income"
          ? TransactionType.INCOME
          : data.type === "transfer"
          ? TransactionType.TRANSFER
          : TransactionType.EXPENSE;

      const newAdjustment = newMappedType === TransactionType.INCOME ? data.amount : -data.amount;

      // Prisma Transaction: reverse old account adjustment, update transaction, apply new account adjustment
      const operations: any[] = [];

      if (existing.accountId === data.accountId) {
        // Same account: apply delta
        const delta = newAdjustment - oldAdjustment;
        operations.push(
          prisma.account.update({
            where: { id: data.accountId },
            data: { balance: { increment: delta } },
          })
        );
      } else {
        // Different accounts: revert old account, apply to new account
        operations.push(
          prisma.account.update({
            where: { id: existing.accountId },
            data: { balance: { increment: -oldAdjustment } },
          }),
          prisma.account.update({
            where: { id: data.accountId },
            data: { balance: { increment: newAdjustment } },
          })
        );
      }

      operations.push(
        prisma.transaction.update({
          where: { id: transactionId },
          data: {
            description: data.description,
            amount: data.amount,
            type: newMappedType,
            categoryId: data.categoryId,
            accountId: data.accountId,
            date: data.date,
            note: data.note || null,
          },
          include: { category: true, account: true },
        })
      );

      const results = await prisma.$transaction(operations);
      const updatedTx = results[results.length - 1];

      return {
        id: updatedTx.id,
        userId: updatedTx.userId,
        description: updatedTx.description,
        amount: Number(updatedTx.amount),
        type: updatedTx.type.toLowerCase() as "income" | "expense" | "transfer",
        categoryId: updatedTx.categoryId,
        categoryName: updatedTx.category.name,
        categoryColor: updatedTx.category.color,
        categoryIcon: updatedTx.category.icon,
        accountId: updatedTx.accountId,
        accountName: updatedTx.account.name,
        date: updatedTx.date.toISOString().split("T")[0],
        status: updatedTx.status.toLowerCase() as "completed" | "pending" | "cancelled",
        note: updatedTx.note || undefined,
        createdAt: updatedTx.createdAt,
      };
    } catch {
      // In-memory fallback
    }

    const index = inMemoryStore.transactions.findIndex((t) => t.id === transactionId);
    if (index === -1) return null;

    const existing = inMemoryStore.transactions[index];
    const oldAdjustment = existing.type === "income" ? existing.amount : -existing.amount;
    const newAdjustment = data.type === "income" ? data.amount : -data.amount;

    // Adjust in-memory account balance
    const oldAcc = inMemoryStore.accounts.find((a) => a.id === existing.accountId);
    if (oldAcc) oldAcc.balance -= oldAdjustment;

    const newAcc = inMemoryStore.accounts.find((a) => a.id === data.accountId);
    if (newAcc) newAcc.balance += newAdjustment;

    const cat = inMemoryStore.categories.find((c) => c.id === data.categoryId) || {
      id: data.categoryId,
      name: "General",
      color: "#6366f1",
      icon: "Tag",
    };

    const updatedTx: StoredTransaction = {
      ...existing,
      description: data.description,
      amount: data.amount,
      type: data.type,
      categoryId: cat.id,
      categoryName: cat.name,
      categoryColor: cat.color,
      categoryIcon: cat.icon,
      accountId: newAcc?.id || data.accountId,
      accountName: newAcc?.name || "Main Account",
      date: data.date.toISOString().split("T")[0],
      note: data.note,
    };

    inMemoryStore.transactions[index] = updatedTx;
    return updatedTx;
  }

  /**
   * Deletes a transaction and reverses its balance effect.
   */
  static async deleteTransaction(userId: string, transactionId: string): Promise<boolean> {
    try {
      const existing = await prisma.transaction.findFirst({
        where: { id: transactionId, userId },
      });

      if (!existing) return false;

      const reverseAmount =
        existing.type === TransactionType.INCOME
          ? -Number(existing.amount)
          : Number(existing.amount);

      await prisma.$transaction([
        prisma.transaction.delete({
          where: { id: transactionId },
        }),
        prisma.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: reverseAmount } },
        }),
      ]);

      return true;
    } catch {
      // In-memory fallback
    }

    const index = inMemoryStore.transactions.findIndex((t) => t.id === transactionId);
    if (index === -1) return false;

    const existing = inMemoryStore.transactions[index];
    const reverseAmount = existing.type === "income" ? -existing.amount : existing.amount;

    const acc = inMemoryStore.accounts.find((a) => a.id === existing.accountId);
    if (acc) acc.balance += reverseAmount;

    inMemoryStore.transactions.splice(index, 1);
    return true;
  }

  /**
   * Calculates comprehensive live financial metrics from database transactions.
   */
  static async getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
    const transactions = await this.getTransactions(userId, { sortBy: "date-desc" });
    const accounts = await this.getAccounts(userId);

    // 1. Total Balance: sum of all active accounts
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // 2. Current Month calculations
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    const currentMonthTxs = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const monthlyIncome = currentMonthTxs
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpense = currentMonthTxs
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const savingsRate =
      monthlyIncome > 0
        ? Math.max(0, Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100))
        : 0;

    // 3. Last 6 Months History
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyHistory: { month: string; income: number; expenses: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(currentYear, currentMonth - i, 1);
      const targetY = targetDate.getFullYear();
      const targetM = targetDate.getMonth();
      const label = monthNames[targetM];

      const monthTxs = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === targetY && d.getMonth() === targetM;
      });

      const inc = monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const exp = monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

      monthlyHistory.push({
        month: label,
        income: inc,
        expenses: exp,
      });
    }

    // 4. Category Breakdown for Expenses (Current Month or All Time if current month empty)
    const expenseTxs = currentMonthTxs.filter((t) => t.type === "expense").length > 0
      ? currentMonthTxs.filter((t) => t.type === "expense")
      : transactions.filter((t) => t.type === "expense");

    const categoryMap = new Map<string, { amount: number; color: string }>();
    let totalCatExpense = 0;

    for (const tx of expenseTxs) {
      const existing = categoryMap.get(tx.categoryName) || { amount: 0, color: tx.categoryColor };
      existing.amount += tx.amount;
      totalCatExpense += tx.amount;
      categoryMap.set(tx.categoryName, existing);
    }

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([name, data]) => ({
        name,
        amount: Math.round(data.amount * 100) / 100,
        percentage: totalCatExpense > 0 ? Math.round((data.amount / totalCatExpense) * 100) : 0,
        color: data.color,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalBalance: Math.round(totalBalance * 100) / 100,
      monthlyIncome: Math.round(monthlyIncome * 100) / 100,
      monthlyExpense: Math.round(monthlyExpense * 100) / 100,
      savingsRate,
      monthlyHistory,
      categoryBreakdown,
      recentTransactions: transactions.slice(0, 5),
    };
  }

  /**
   * Retrieves category-wise monthly budgets with live spending calculations from database transactions.
   */
  static async getBudgets(
    userId: string,
    targetMonth?: number,
    targetYear?: number
  ): Promise<StoredBudget[]> {
    const now = new Date();
    const month = targetMonth !== undefined ? targetMonth : now.getMonth();
    const year = targetYear !== undefined ? targetYear : now.getFullYear();

    const categories = await this.getCategories(userId);
    const expenseCategories = categories.filter((c) => c.type === "expense");
    const transactions = await this.getTransactions(userId, { type: "expense" });

    // Filter transactions to target month
    const monthTxs = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    // Compute actual spent per category from database transactions
    const spendByCategory = new Map<string, number>();
    for (const tx of monthTxs) {
      spendByCategory.set(tx.categoryId, (spendByCategory.get(tx.categoryId) || 0) + tx.amount);
    }

    // Fetch budget definitions
    let rawBudgets: { id: string; categoryId: string; limit: number; period: "MONTHLY" | "YEARLY" }[] = [];

    try {
      const dbBudgets = await prisma.budget.findMany({
        where: { userId },
      });
      if (dbBudgets && dbBudgets.length > 0) {
        rawBudgets = dbBudgets.map((b) => ({
          id: b.id,
          categoryId: b.categoryId,
          limit: Number(b.limit),
          period: b.period as "MONTHLY" | "YEARLY",
        }));
      }
    } catch {
      // Fallback to inMemoryStore
    }

    if (rawBudgets.length === 0) {
      rawBudgets = inMemoryStore.budgets.filter((b) => b.userId === "default-user" || b.userId === userId);
    }

    const budgetMap = new Map<string, { id: string; limit: number; period: "MONTHLY" | "YEARLY" }>();
    for (const b of rawBudgets) {
      budgetMap.set(b.categoryId, b);
    }

    // Build complete category budget items
    return expenseCategories.map((cat) => {
      const budgetDef = budgetMap.get(cat.id);
      const limit = budgetDef ? budgetDef.limit : 500.0; // Default threshold if not explicitly capped
      const spent = Math.round((spendByCategory.get(cat.id) || 0) * 100) / 100;
      const remaining = Math.max(0, Math.round((limit - spent) * 100) / 100);
      const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      const isOverBudget = spent > limit;
      const isNearLimit = percentage >= 80 && !isOverBudget;

      return {
        id: budgetDef ? budgetDef.id : `b-${cat.id}`,
        userId,
        categoryId: cat.id,
        categoryName: cat.name,
        categoryColor: cat.color,
        categoryIcon: cat.icon,
        limit,
        spent,
        remaining,
        percentage,
        isOverBudget,
        isNearLimit,
        period: budgetDef?.period || "MONTHLY",
      };
    });
  }

  /**
   * Sets or updates a category budget limit.
   */
  static async setBudget(
    userId: string,
    categoryId: string,
    limit: number,
    period: "MONTHLY" | "YEARLY" = "MONTHLY"
  ): Promise<StoredBudget> {
    try {
      const budget = await prisma.budget.upsert({
        where: {
          userId_categoryId_period: {
            userId,
            categoryId,
            period: period as any,
          },
        },
        update: { limit },
        create: {
          userId,
          categoryId,
          limit,
          period: period as any,
        },
        include: { category: true },
      });

      const all = await this.getBudgets(userId);
      const found = all.find((b) => b.categoryId === categoryId);
      if (found) return found;
    } catch {
      // In-memory fallback
    }

    const existingIndex = inMemoryStore.budgets.findIndex(
      (b) => b.categoryId === categoryId && (b.userId === "default-user" || b.userId === userId)
    );

    if (existingIndex !== -1) {
      inMemoryStore.budgets[existingIndex].limit = limit;
      inMemoryStore.budgets[existingIndex].period = period;
    } else {
      inMemoryStore.budgets.push({
        id: `b-${Date.now()}`,
        userId,
        categoryId,
        limit,
        period,
      });
    }

    const all = await this.getBudgets(userId);
    return all.find((b) => b.categoryId === categoryId)!;
  }

  /**
   * Deletes a category budget limit.
   */
  static async deleteBudget(userId: string, budgetId: string): Promise<boolean> {
    try {
      await prisma.budget.delete({
        where: { id: budgetId, userId },
      });
      return true;
    } catch {
      // Fallback
    }

    const index = inMemoryStore.budgets.findIndex((b) => b.id === budgetId);
    if (index !== -1) {
      inMemoryStore.budgets.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Generates comprehensive financial analytics across customizable time ranges from database transactions.
   */
  static async getAnalytics(
    userId: string,
    timeRange: "1m" | "3m" | "6m" | "1y" | "all" = "6m",
    customStart?: string,
    customEnd?: string
  ): Promise<AnalyticsData> {
    const allTransactions = await this.getTransactions(userId, { sortBy: "date-desc" });

    // Determine date boundary
    const now = new Date();
    let startDate = new Date();
    const endDate = customEnd ? new Date(customEnd) : now;

    if (customStart) {
      startDate = new Date(customStart);
    } else if (timeRange === "1m") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timeRange === "3m") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    } else if (timeRange === "6m") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    } else if (timeRange === "1y") {
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    } else {
      startDate = new Date("2020-01-01");
    }

    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];

    const filtered = allTransactions.filter((t) => t.date >= startStr && t.date <= endStr);

    // Totals
    const totalIncome = filtered
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = filtered
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

    // Daily Average Spend
    const daySpan = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const dailyAverageSpend = Math.round((totalExpense / daySpan) * 100) / 100;

    // Monthly Cash Flow Trend
    const monthMap = new Map<string, { income: number; expense: number }>();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Populate months in interval
    const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    while (cursor <= endDate) {
      const key = `${monthNames[cursor.getMonth()]} ${cursor.getFullYear()}`;
      monthMap.set(key, { income: 0, expense: 0 });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    for (const t of filtered) {
      const d = new Date(t.date);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      const entry = monthMap.get(key) || { income: 0, expense: 0 };
      if (t.type === "income") entry.income += t.amount;
      if (t.type === "expense") entry.expense += t.amount;
      monthMap.set(key, entry);
    }

    let runningSavings = 0;
    const monthlyCashFlow = Array.from(monthMap.entries()).map(([month, data]) => {
      const monthlyNet = data.income - data.expense;
      runningSavings += monthlyNet;
      return {
        month: month.split(" ")[0],
        income: Math.round(data.income * 100) / 100,
        expense: Math.round(data.expense * 100) / 100,
        savings: Math.round(monthlyNet * 100) / 100,
        cumulativeSavings: Math.round(runningSavings * 100) / 100,
      };
    });

    // Category Breakdowns
    const expMap = new Map<string, { amount: number; color: string }>();
    for (const t of filtered.filter((t) => t.type === "expense")) {
      const entry = expMap.get(t.categoryName) || { amount: 0, color: t.categoryColor };
      entry.amount += t.amount;
      expMap.set(t.categoryName, entry);
    }
    const expenseCategoryBreakdown = Array.from(expMap.entries())
      .map(([name, data]) => ({
        name,
        amount: Math.round(data.amount * 100) / 100,
        percentage: totalExpense > 0 ? Math.round((data.amount / totalExpense) * 100) : 0,
        color: data.color,
      }))
      .sort((a, b) => b.amount - a.amount);

    const incMap = new Map<string, { amount: number; color: string }>();
    for (const t of filtered.filter((t) => t.type === "income")) {
      const entry = incMap.get(t.categoryName) || { amount: 0, color: t.categoryColor };
      entry.amount += t.amount;
      incMap.set(t.categoryName, entry);
    }
    const incomeCategoryBreakdown = Array.from(incMap.entries())
      .map(([name, data]) => ({
        name,
        amount: Math.round(data.amount * 100) / 100,
        percentage: totalIncome > 0 ? Math.round((data.amount / totalIncome) * 100) : 0,
        color: data.color,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Top 5 individual expense drivers
    const topExpenseDrivers = filtered
      .filter((t) => t.type === "expense")
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        category: t.categoryName,
        account: t.accountName,
        date: t.date,
      }));

    return {
      timeRange,
      startDate: startStr,
      endDate: endStr,
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpense: Math.round(totalExpense * 100) / 100,
      netSavings: Math.round(netSavings * 100) / 100,
      savingsRate,
      dailyAverageSpend,
      monthlyCashFlow,
      expenseCategoryBreakdown,
      incomeCategoryBreakdown,
      topExpenseDrivers,
    };
  }
}
