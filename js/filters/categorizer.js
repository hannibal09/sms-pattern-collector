/**
 * Categorize SMS to identify transaction types
 * Useful for intelligent deduplication
 */

export function categorizeMessage(body) {
    if (!body) return 'UNKNOWN';
    const lowerBody = body.toLowerCase();

    // Exclude OTPs strictly
    if (/otp|verification code|one time pwd|one time password|auth code/i.test(body) && !/debited|credited/i.test(body)) {
        return 'OTP';
    }

    // UPI Transactions
    if (/upi/i.test(body)) {
        if (/debited|paid|sent/i.test(body)) return 'UPI_DEBIT';
        if (/credited|received/i.test(body)) return 'UPI_CREDIT';
        if (/request/i.test(body)) return 'UPI_REQUEST';
        return 'UPI_OTHER';
    }

    // Card Transactions
    if (/atm/i.test(body) && /withdraw/i.test(body)) return 'ATM_WITHDRAWAL';
    if (/spent|purchase|txn|transaction|charge/i.test(body) && /card/i.test(body)) return 'CARD_POS';

    // General Account Activity
    if (/credited/i.test(body)) return 'ACCOUNT_CREDIT';
    if (/debited/i.test(body)) return 'ACCOUNT_DEBIT';

    // Specific events
    if (/refund/i.test(body)) return 'REFUND';
    if (/declined|failed/i.test(body)) return 'FAILED_TXN';
    if (/bill/i.test(body) && /due/i.test(body)) return 'BILL_DUE';

    return 'OTHER';
}
