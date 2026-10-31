/**
 * Automated Verification Suite for Budgets & Financial Analytics
 */

import { TransactionRepository } from "../src/lib/db/transaction-repository";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runBudgetAnalyticsTests() {
  console.log("=================================================================");
  console.log("  BUDGETS & ANALYTICS VERIFICATION TEST SUITE");
  console.log("=================================================================\n");

  const TEST_USER = "test-user-budget-analytics";

  // Ensure user has initial test accounts, categories and records
  await TransactionRepository.ensureUserProvisioned(TEST_USER);

  // ---------------------------------------------------------------------------
  // TEST GROUP 1: Category-wise Budget Calculations from Transactions
  // ---------------------------------------------------------------------------
  console.log("TEST GROUP 1: Category Budget Calculations From Real Transactions");

  const budgets = await TransactionRepository.getBudgets(TEST_USER);
  assert(budgets.length > 0, `Retrieved ${budgets.length} category budgets`);

  // Verify Housing budget calculation
  const housingBudget = budgets.find((b) => b.categoryId === "cat-housing");
  assert(Boolean(housingBudget), "Housing category budget exists");
  if (housingBudget) {
    assert(housingBudget.limit > 0, `Housing limit defined: $${housingBudget.limit}`);
    assert(housingBudget.spent >= 0, `Housing spent calculated from transactions: $${housingBudget.spent}`);
    assert(
      housingBudget.remaining === Math.max(0, Math.round((housingBudget.limit - housingBudget.spent) * 100) / 100),
      `Remaining buffer correctly computed: $${housingBudget.remaining}`
    );
    assert(
      housingBudget.percentage === Math.round((housingBudget.spent / housingBudget.limit) * 100),
      `Spending percentage accurately calculated: ${housingBudget.percentage}%`
    );
  }

  // ---------------------------------------------------------------------------
  // TEST GROUP 2: Threshold Warnings (Near Limit and Over Budget)
  // ---------------------------------------------------------------------------
  console.log("\nTEST GROUP 2: Budget Threshold Warnings");

  // Create a tight budget of $100 on Utilities where spend is already $145.20
  const overBudget = await TransactionRepository.setBudget(TEST_USER, "cat-utilities", 100.0, "MONTHLY");
  assert(overBudget.isOverBudget === true, "Accurately flags isOverBudget=true when spending ($145.20) > limit ($100)");
  assert(overBudget.percentage > 100, `Percentage reflects excess: ${overBudget.percentage}%`);

  // Create a budget of $160 on Utilities (spend $145.20 is ~90.75% -> near limit)
  const nearLimitBudget = await TransactionRepository.setBudget(TEST_USER, "cat-utilities", 160.0, "MONTHLY");
  assert(nearLimitBudget.isNearLimit === true, "Accurately flags isNearLimit=true when spending is between 80% and 100%");
  assert(nearLimitBudget.isOverBudget === false, "isOverBudget remains false when under limit");

  // Reset to comfortable limit $500
  const normalBudget = await TransactionRepository.setBudget(TEST_USER, "cat-utilities", 500.0, "MONTHLY");
  assert(normalBudget.isOverBudget === false && normalBudget.isNearLimit === false, "Status is on-track under 80%");

  // ---------------------------------------------------------------------------
  // TEST GROUP 3: Analytics Financial Intelligence Aggregates
  // ---------------------------------------------------------------------------
  console.log("\nTEST GROUP 3: Real Database Analytics & Reporting");

  const analytics = await TransactionRepository.getAnalytics(TEST_USER, "6m");

  assert(analytics.totalIncome > 0, `Total gross income aggregated: $${analytics.totalIncome}`);
  assert(analytics.totalExpense > 0, `Total gross expense aggregated: $${analytics.totalExpense}`);
  assert(
    analytics.netSavings === Math.round((analytics.totalIncome - analytics.totalExpense) * 100) / 100,
    `Net savings matches Income - Expense: $${analytics.netSavings}`
  );
  assert(
    analytics.savingsRate === Math.round((analytics.netSavings / analytics.totalIncome) * 100),
    `Effective savings rate calculated: ${analytics.savingsRate}%`
  );
  assert(analytics.dailyAverageSpend > 0, `Daily average velocity computed: $${analytics.dailyAverageSpend}/day`);

  // ---------------------------------------------------------------------------
  // TEST GROUP 4: Monthly Cash Flow & Category Allocations
  // ---------------------------------------------------------------------------
  console.log("\nTEST GROUP 4: Monthly Trajectory & Category Breakdowns");

  assert(analytics.monthlyCashFlow.length > 0, `Generated ${analytics.monthlyCashFlow.length} monthly cash flow buckets`);
  assert(
    analytics.monthlyCashFlow.some((m) => m.income > 0 || m.expense > 0),
    "Monthly buckets contain non-zero financial figures"
  );

  assert(analytics.expenseCategoryBreakdown.length > 0, "Expense category allocations computed");
  const totalExpensePct = analytics.expenseCategoryBreakdown.reduce((s, c) => s + c.percentage, 0);
  assert(
    totalExpensePct >= 98 && totalExpensePct <= 102,
    `Expense category percentages sum to ~100% (calculated: ${totalExpensePct}%)`
  );

  assert(analytics.topExpenseDrivers.length > 0, `Extracted ${analytics.topExpenseDrivers.length} top outflow drivers`);
  if (analytics.topExpenseDrivers.length >= 2) {
    assert(
      analytics.topExpenseDrivers[0].amount >= analytics.topExpenseDrivers[1].amount,
      "Top expense drivers sorted by magnitude descending"
    );
  }

  console.log();
  console.log("=================================================================");
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runBudgetAnalyticsTests().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
