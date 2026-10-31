import { PrismaClient, CategoryType, AccountType, TransactionType, TransactionStatus, BudgetPeriod } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting ExpenseFlow database seed...");

  // 1. Seed Global / System Categories
  const defaultCategories = [
    // Expenses
    { name: "Housing & Rent", type: CategoryType.EXPENSE, icon: "Home", color: "#6366f1", isSystem: true },
    { name: "Food & Dining", type: CategoryType.EXPENSE, icon: "Utensils", color: "#f59e0b", isSystem: true },
    { name: "SaaS & Cloud Tools", type: CategoryType.EXPENSE, icon: "Cpu", color: "#3b82f6", isSystem: true },
    { name: "Transport & Fuel", type: CategoryType.EXPENSE, icon: "Car", color: "#06b6d4", isSystem: true },
    { name: "Health & Fitness", type: CategoryType.EXPENSE, icon: "HeartPulse", color: "#ec4899", isSystem: true },
    { name: "Entertainment", type: CategoryType.EXPENSE, icon: "Film", color: "#8b5cf6", isSystem: true },
    // Income
    { name: "Client Contracts", type: CategoryType.INCOME, icon: "Briefcase", color: "#10b981", isSystem: true },
    { name: "Dividends & Returns", type: CategoryType.INCOME, icon: "TrendingUp", color: "#14b8a6", isSystem: true },
    { name: "Consulting", type: CategoryType.INCOME, icon: "Code", color: "#84cc16", isSystem: true },
  ];

  for (const cat of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, isSystem: true },
    });

    if (!existing) {
      await prisma.category.create({
        data: cat,
      });
    }
  }

  console.log("✅ System categories populated.");

  // 2. Seed Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: "alex@expenseflow.io" },
    update: {},
    create: {
      email: "alex@expenseflow.io",
      name: "Alex Morgan",
      currency: "USD",
    },
  });

  console.log(`✅ Demo user seeded: ${demoUser.email} (${demoUser.id})`);

  // 3. Seed Accounts
  const demoAccounts = [
    {
      userId: demoUser.id,
      name: "Mercury Main Checking",
      type: AccountType.CHECKING,
      balance: 24850.5,
      accountNumber: "•••• 4821",
      institution: "Mercury Bank",
      color: "#6366f1",
    },
    {
      userId: demoUser.id,
      name: "High-Yield Savings",
      type: AccountType.SAVINGS,
      balance: 14200.0,
      accountNumber: "•••• 9104",
      institution: "Marcus by Goldman",
      color: "#10b981",
    },
    {
      userId: demoUser.id,
      name: "Corporate Card",
      type: AccountType.CREDIT_CARD,
      balance: -1680.75,
      accountNumber: "•••• 3390",
      institution: "Brex",
      color: "#f59e0b",
    },
    {
      userId: demoUser.id,
      name: "Petty Cash",
      type: AccountType.CASH,
      balance: 480.0,
      accountNumber: "Cash Vault",
      institution: "Physical Wallet",
      color: "#8b5cf6",
    },
  ];

  for (const acc of demoAccounts) {
    const existing = await prisma.account.findFirst({
      where: { userId: demoUser.id, name: acc.name },
    });

    if (!existing) {
      await prisma.account.create({ data: acc });
    }
  }

  console.log("✅ Demo accounts seeded.");
  console.log("🚀 Database seed finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
