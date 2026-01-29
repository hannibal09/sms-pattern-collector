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

function randomizePreservingFormat(original) {
    let firstNonZeroSeen = false;
    return original.split('').map(char => {
        if (!/\d/.test(char)) return char; // Keep format chars

        // If we haven't seen a non-zero digit yet
        if (!firstNonZeroSeen) {
            if (char === '0') {
                // Leading zero (e.g. 0.50). Keep it 0 to preserve magnitude < 1
                return '0';
            } else {
                // First non-zero digit. Randomize 1-9 to preserve magnitude >= 1
                firstNonZeroSeen = true;
                return Math.floor(1 + Math.random() * 9).toString();
            }
        }

        // Subsequent digits can be 0-9
        return Math.floor(Math.random() * 10).toString();
    }).join('');
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
            // Capture the number part including commas/dots
            const numberMatch = match.match(/[\d,]+\.?\d*/);
            if (!numberMatch) return match;

            const originalNumber = numberMatch[0];
            const newNumber = randomizePreservingFormat(originalNumber);

            // Replace only the number part in the original string (keeping currency symbol)
            return match.replace(originalNumber, newNumber);
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
