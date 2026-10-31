/**
 * Automated Test Suite for ExpenseFlow Income & Expense CRUD Operations
 */

import { validateTransactionInput } from "../src/lib/validations/transaction";
import { TransactionRepository } from "../src/lib/db/transaction-repository";

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    testsFailed++;
  }
}

async function runTestSuite() {
  console.log("=================================================================");
  console.log("  EXPENSEFLOW CRUD & VALIDATION TEST SUITE");
  console.log("=================================================================\n");

  const TEST_USER = "test-user-uuid-123";

  // ---------------------------------------------------------------------------
  // TEST GROUP 1: Server-side Input Validation
  // ---------------------------------------------------------------------------
  console.log("TEST GROUP 1: Server-Side Input Validation");

  // Case 1.1: Missing description
  const res1 = validateTransactionInput({
    description: "",
    amount: 100,
    type: "expense",
    categoryId: "cat-food",
    accountId: "acc-checking",
  });
  assert(!res1.isValid && res1.errors.description !== undefined, "Rejects empty description");

  // Case 1.2: Negative or Zero amount
  const res2 = validateTransactionInput({
    description: "Invalid Purchase",
    amount: -50,
    type: "expense",
    categoryId: "cat-food",
    accountId: "acc-checking",
  });
  assert(!res2.isValid && res2.errors.amount !== undefined, "Rejects negative amounts");

  const res3 = validateTransactionInput({
    description: "Zero Amount",
    amount: 0,
    type: "expense",
    categoryId: "cat-food",
    accountId: "acc-checking",
  });
  assert(!res3.isValid && res3.errors.amount !== undefined, "Rejects zero amount");

  // Case 1.3: Invalid Transaction Type
  const res4 = validateTransactionInput({
    description: "Bad Type",
    amount: 50,
    type: "donation" as any,
    categoryId: "cat-food",
    accountId: "acc-checking",
  });
  assert(!res4.isValid && res4.errors.type !== undefined, "Rejects unsupported transaction type");

  // Case 1.4: Valid Input Normalization
  const res5 = validateTransactionInput({
    description: "  Specialty Espresso Beans  ",
    amount: "24.50",
    type: "expense",
    categoryId: "cat-food",
    accountId: "acc-credit",
    date: "2026-10-31",
  });
  assert(
    res5.isValid &&
      res5.sanitizedData?.description === "Specialty Espresso Beans" &&
      res5.sanitizedData?.amount === 24.5,
    "Sanitizes and trims description and parses numeric amount"
  );

  console.log();

  // ---------------------------------------------------------------------------
  // TEST GROUP 2: CREATE Transactions (Inflow & Outflow)
  // ---------------------------------------------------------------------------
  console.log("TEST GROUP 2: Create Transaction (CRUD: CREATE)");

  const initialAccounts = await TransactionRepository.getAccounts(TEST_USER);
  const checkingAcc = initialAccounts.find((a) => a.id === "acc-checking") || initialAccounts[0];
  const initialBalance = checkingAcc.balance;

  // 2.1 Create Income Transaction
  const incomeTx = await TransactionRepository.createTransaction(TEST_USER, {
    description: "Enterprise Security Audit Retainer",
    amount: 4500.0,
    type: "income",
    categoryId: "cat-salary",
    accountId: checkingAcc.id,
    date: new Date("2026-10-30"),
    note: "Q4 enterprise advisory contract",
  });

  assert(Boolean(incomeTx.id) && incomeTx.amount === 4500.0, "Income transaction created with unique ID");
  assert(incomeTx.type === "income", "Transaction type set to income");

  const accountsAfterIncome = await TransactionRepository.getAccounts(TEST_USER);
  const checkingAfterIncome = accountsAfterIncome.find((a) => a.id === checkingAcc.id);
  assert(
    checkingAfterIncome?.balance === initialBalance + 4500.0,
    `Account balance incremented by +$4,500.00 (from $${initialBalance} to $${checkingAfterIncome?.balance})`
  );

  // 2.2 Create Expense Transaction
  const expenseTx = await TransactionRepository.createTransaction(TEST_USER, {
    description: "Mechanical Keyboards & Desk Setup",
    amount: 350.0,
    type: "expense",
    categoryId: "cat-utilities",
    accountId: checkingAcc.id,
    date: new Date("2026-10-31"),
    note: "Office hardware procurement",
  });

  assert(Boolean(expenseTx.id) && expenseTx.amount === 350.0, "Expense transaction created with unique ID");

  const accountsAfterExpense = await TransactionRepository.getAccounts(TEST_USER);
  const checkingAfterExpense = accountsAfterExpense.find((a) => a.id === checkingAcc.id);
  assert(
    checkingAfterExpense?.balance === initialBalance + 4500.0 - 350.0,
    `Account balance decremented by -$350.00 (current: $${checkingAfterExpense?.balance})`
  );

  console.log();

  // ---------------------------------------------------------------------------
  // TEST GROUP 3: READ, Search, Filter & Sort (CRUD: READ)
  // ---------------------------------------------------------------------------
  console.log("TEST GROUP 3: Read, Search, Filter & Sort (CRUD: READ)");

  // 3.1 Fetch all transactions
  const allTxs = await TransactionRepository.getTransactions(TEST_USER);
  assert(allTxs.length >= 2, `Retrieved ${allTxs.length} transactions for user`);

  // 3.2 Search by keyword
  const searchResults = await TransactionRepository.getTransactions(TEST_USER, {
    search: "Keyboards",
  });
  assert(
    searchResults.length === 1 && searchResults[0].id === expenseTx.id,
    "Search keyword 'Keyboards' accurately matches targeted record"
  );

  // 3.3 Filter by type
  const incomeOnly = await TransactionRepository.getTransactions(TEST_USER, {
    type: "income",
  });
  assert(
    incomeOnly.every((t) => t.type === "income"),
    "Filter type='income' returns exclusively income records"
  );

  const expenseOnly = await TransactionRepository.getTransactions(TEST_USER, {
    type: "expense",
  });
  assert(
    expenseOnly.every((t) => t.type === "expense"),
    "Filter type='expense' returns exclusively expense records"
  );

  // 3.4 Sort by Amount Descending
  const sortedAmount = await TransactionRepository.getTransactions(TEST_USER, {
    sortBy: "amount-desc",
  });
  assert(
    sortedAmount[0].amount >= sortedAmount[sortedAmount.length - 1].amount,
    "Sort by amount-desc returns highest amount first"
  );

  console.log();

  // ---------------------------------------------------------------------------
  // TEST GROUP 4: UPDATE Transaction & Atomic Delta (CRUD: UPDATE)
  // ---------------------------------------------------------------------------
  console.log("TEST GROUP 4: Update Transaction & Delta Adjustment (CRUD: UPDATE)");

  // Modify expense: increase amount from 350.0 to 400.0 and update description
  const updatedExpense = await TransactionRepository.updateTransaction(TEST_USER, expenseTx.id, {
    description: "Mechanical Keyboards & Studio Monitors",
    amount: 400.0,
    type: "expense",
    categoryId: "cat-utilities",
    accountId: checkingAcc.id,
    date: new Date("2026-10-31"),
    note: "Added studio monitor order",
  });

  assert(
    updatedExpense?.description === "Mechanical Keyboards & Studio Monitors",
    "Description updated successfully"
  );
  assert(updatedExpense?.amount === 400.0, "Amount updated from $350 to $400");

  const accountsAfterUpdate = await TransactionRepository.getAccounts(TEST_USER);
  const checkingAfterUpdate = accountsAfterUpdate.find((a) => a.id === checkingAcc.id);
  assert(
    checkingAfterUpdate?.balance === initialBalance + 4500.0 - 400.0,
    `Account balance adjusted atomically by delta -$50 (now $${checkingAfterUpdate?.balance})`
  );

  console.log();

  // ---------------------------------------------------------------------------
  // TEST GROUP 5: Dashboard Live Calculations
  // ---------------------------------------------------------------------------
  console.log("TEST GROUP 5: Live Dashboard Calculations");

  const metrics = await TransactionRepository.getDashboardMetrics(TEST_USER);
  assert(metrics.totalBalance > 0, `Total balance computed: $${metrics.totalBalance}`);
  assert(metrics.monthlyIncome >= 4500.0, `Monthly income correctly includes new $4,500 inflow`);
  assert(metrics.monthlyExpense >= 400.0, `Monthly expense correctly includes new $400 outflow`);
  assert(
    metrics.savingsRate >= 0 && metrics.savingsRate <= 100,
    `Savings rate computed: ${metrics.savingsRate}%`
  );
  assert(metrics.monthlyHistory.length === 6, "Calculated monthly trajectory for 6 consecutive months");
  assert(metrics.categoryBreakdown.length > 0, "Category allocation breakdown generated");

  console.log();

  // ---------------------------------------------------------------------------
  // TEST GROUP 6: DELETE Transaction & Balance Reversal (CRUD: DELETE)
  // ---------------------------------------------------------------------------
  console.log("TEST GROUP 6: Delete Transaction & Reversal (CRUD: DELETE)");

  // 6.1 Delete Expense
  const deleteExpenseRes = await TransactionRepository.deleteTransaction(TEST_USER, expenseTx.id);
  assert(deleteExpenseRes === true, "Expense transaction deleted successfully");

  const accountsAfterExpenseDel = await TransactionRepository.getAccounts(TEST_USER);
  const checkingAfterExpDel = accountsAfterExpenseDel.find((a) => a.id === checkingAcc.id);
  assert(
    checkingAfterExpDel?.balance === initialBalance + 4500.0,
    `Account balance reversed: +$400 refunded after expense deletion (now $${checkingAfterExpDel?.balance})`
  );

  // Verify deletion from query
  const queryDeleted = await TransactionRepository.getTransactionById(TEST_USER, expenseTx.id);
  assert(queryDeleted === null, "Deleted transaction cannot be found in query");

  // 6.2 Delete Income
  const deleteIncomeRes = await TransactionRepository.deleteTransaction(TEST_USER, incomeTx.id);
  assert(deleteIncomeRes === true, "Income transaction deleted successfully");

  const accountsAfterAllDel = await TransactionRepository.getAccounts(TEST_USER);
  const checkingFinal = accountsAfterAllDel.find((a) => a.id === checkingAcc.id);
  assert(
    checkingFinal?.balance === initialBalance,
    `Account balance restored to exact initial balance $${initialBalance}`
  );

  console.log();
  console.log("=================================================================");
  console.log(`  TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log("=================================================================");

  if (testsFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
