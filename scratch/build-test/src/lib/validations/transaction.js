"use strict";
/**
 * Server-side validation for ExpenseFlow Transaction operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTransactionInput = validateTransactionInput;
function validateTransactionInput(input) {
    const errors = {};
    // 1. Description validation
    const description = (input.description || "").trim();
    if (!description) {
        errors.description = "Transaction description is required.";
    }
    else if (description.length < 2) {
        errors.description = "Description must be at least 2 characters long.";
    }
    else if (description.length > 255) {
        errors.description = "Description cannot exceed 255 characters.";
    }
    // 2. Amount validation
    let numericAmount = 0;
    if (typeof input.amount === "number") {
        numericAmount = input.amount;
    }
    else if (typeof input.amount === "string") {
        numericAmount = parseFloat(input.amount.replace(/[^0-9.-]/g, ""));
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
        errors.amount = "Amount must be a valid positive number greater than 0.";
    }
    else if (numericAmount > 999999999.99) {
        errors.amount = "Amount exceeds the maximum allowed value ($999,999,999.99).";
    }
    else {
        // Check decimal precision (max 2 decimal places)
        const decimalParts = numericAmount.toString().split(".");
        if (decimalParts[1] && decimalParts[1].length > 2) {
            errors.amount = "Amount cannot have more than 2 decimal places.";
        }
    }
    // 3. Type validation
    const validTypes = ["income", "expense", "transfer"];
    if (!input.type || !validTypes.includes(input.type)) {
        errors.type = "Transaction type must be 'income', 'expense', or 'transfer'.";
    }
    // 4. Category validation
    const categoryId = (input.categoryId || "").trim();
    if (!categoryId) {
        errors.categoryId = "A category must be selected.";
    }
    // 5. Account validation
    const accountId = (input.accountId || "").trim();
    if (!accountId) {
        errors.accountId = "An account/wallet must be selected.";
    }
    // 6. Date validation
    let parsedDate = new Date();
    if (input.date) {
        const d = new Date(input.date);
        if (isNaN(d.getTime())) {
            errors.date = "Provided date is invalid.";
        }
        else {
            parsedDate = d;
        }
    }
    // 7. Note validation (optional)
    const note = (input.note || "").trim();
    if (note.length > 1000) {
        errors.note = "Note cannot exceed 1000 characters.";
    }
    const isValid = Object.keys(errors).length === 0;
    return {
        isValid,
        errors,
        sanitizedData: isValid
            ? {
                description,
                amount: Math.round(numericAmount * 100) / 100, // Normalized to 2 decimal places
                type: input.type,
                categoryId,
                accountId,
                date: parsedDate,
                note: note || undefined,
            }
            : undefined,
    };
}
