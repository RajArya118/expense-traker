export type TransactionType = "income" | "expense" | "transfer";

export type TransactionStatus = "completed" | "pending" | "recurring" | "cancelled";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  categoryId: string;
  categoryColor?: string;
  categoryIcon?: string;
  account: string;
  accountId: string;
  date: string;
  status: TransactionStatus;
  note?: string;
}

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  monthlyBudget: number;
  spent: number;
  transactionCount: number;
}

export interface Account {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit" | "investment" | "cash";
  balance: number;
  accountNumber: string;
  institution: string;
  color: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  limit: number;
  spent: number;
  period: "monthly" | "yearly";
}

export interface CashFlowMonth {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  count: number;
}

export interface MetricCardData {
  title: string;
  value: number;
  changePercentage: number;
  isPositive: boolean;
  trendText: string;
  iconName: string;
  accentColor: string;
}
