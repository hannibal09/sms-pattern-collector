/**
 * Rules for detecting and replacing Personally Identifiable Information (PII)
 */

function randomDigits(length) {
    let out = '';
    for (let i = 0; i < length; i++) {
        out += Math.floor(Math.random() * 10);
    }
    return out;
}

function randomAmountFromOriginal(original) {
    const digitsOnly = original.replace(/\D/g, '');
    const len = digitsOnly.length;

    if (len <= 2) return '100';

    const min = Math.pow(10, len - 1);
    const max = Math.pow(10, len) - 1;

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shiftDayMonthKeepYear(dateStr) {
    const parts = dateStr.split(/[-\/]/);
    if (parts.length !== 3) return dateStr;

    const year = parts[2];
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const sep = dateStr.includes('/') ? '/' : '-';

    return `${day}${sep}${month}${sep}${year}`;
}

export const ANONYMIZATION_RULES = [

    {
        name: 'Account Number',
        pattern: /(?:A\/c|Acc|Account|A\/C)\s*(?:no\.?|number|ending|ending with)?\s*[:.-]?\s*([X*x]*\d{3,})/gi,
        replace: (match, group) => {
            const digits = group.match(/\d+/);
            if (!digits) return match.replace(group, 'XX8888');

            const random = randomDigits(digits[0].length);
            return match.replace(digits[0], random);
        }
    },

    {
        name: 'Amount',
        pattern: /(?:Rs\.?|INR|₹)\s*[\d,]+\.?\d*/gi,
        replace: (match) => {
            const numeric = match.replace(/,/g, '').replace(/[^\d]/g, '');
            if (!numeric) return match;

            const newAmount = randomAmountFromOriginal(numeric);
            const symbol = match.match(/Rs\.?|INR|₹/i)?.[0] || 'Rs.';

            return `${symbol} ${newAmount}`;
        }
    },

    {
        name: 'UPI ID / VPA',
        pattern: /\b[a-zA-Z0-9._-]+@[a-zA-Z]{3,}\b/gi,
        replace: (match) => {
            const [user, bank] = match.split('@');
            const maskedUser =
                user.substring(0, 1) + '***' + user.substring(user.length - 1);
            return `${maskedUser}@${bank}`;
        }
    },

    {
        name: 'Card Last 4',
        pattern: /(?:card|Card)\s*(?:no\.?|number|ending|ending with)?\s*[:.-]?\s*(?:[xX*]*\s*)(\d{4})\b/gi,
        replace: (match, digits) => {
            return match.replace(digits, randomDigits(4));
        }
    },

    {
        name: 'Mobile Number',
        pattern: /(?:\b|[^\d])([6-9]\d{9})(?:\b|[^\d])/g,
        replace: (match, number) => {
            return match.replace(number, '9XXXXX' + number.slice(-2));
        }
    },

    {
        name: 'Ref No / Txn ID',
        pattern: /(?:Ref|Txn|Reference|Id)\s*[:.-]?\s*([a-zA-Z0-9]+)/gi,
        replace: (match, id) => {
            if (id.length < 4) return match;
            return match.replace(id, 'REF' + randomDigits(6));
        }
    },

    {
        name: 'Date',
        pattern: /\b\d{2}[-\/]\d{2}[-\/]\d{4}\b/g,
        replace: (match) => shiftDayMonthKeepYear(match)
    }
];
