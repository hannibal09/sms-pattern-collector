/**
 * Rules for detecting and replacing Personally Identifiable Information (PII)
 */

export const ANONYMIZATION_RULES = [
    {
        name: 'Account Number',
        // Matches: A/c 1234, A/c no X1234, A/c ending 1234, etc.
        pattern: /(?:A\/c|Acc|Account|A\/C)\s*(?:no\.?|number|ending|ending with)?\s*[:.-]?\s*([X*x]*\d{3,})/gi,
        replace: (match, group) => {
            const digits = group.match(/\d+/);
            if (!digits) return match.replace(group, 'XX8888');

            // Generate random 4-digit number to replace real digits
            // Keeps the same string length if possible or just standard 4
            const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
            return match.replace(digits[0], randomDigits);
        }
    },

    {
        name: 'Amount',
        // Matches: Rs. 1,234.50, INR 500 etc. with improved regex to capture full number including commas
        pattern: /(?:Rs\.?|INR|₹)\s*[\d,]+\.?\d*/gi,
        replace: (match) => {
            // Remove non-numeric characters except dot
            // Note: This naive approach fails if there are multiple dots or weird formatting
            // But typical bank SMS is: "Rs. 1,234.50" -> "1234.50"
            const numStr = match.replace(/,/g, '').replace(/[^\d.]/g, '');
            let val = parseFloat(numStr);

            if (isNaN(val)) return match;

            // Ensure positive
            val = Math.abs(val);
            if (val === 0) val = 100; // fallback for zero to avoid 0.00 result if random multiplier is small

            // Generate amount within +/- 20% of original
            const randomFactor = 0.8 + Math.random() * 0.4;
            let newVal = (val * randomFactor).toFixed(2);

            // Re-add commas for display realism if original had them
            if (match.includes(',')) {
                const parts = newVal.split('.');
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                newVal = parts.join('.');
            }

            // Preserve original currency symbol
            const symbol = match.match(/Rs\.?|INR|₹/i)?.[0] || 'Rs.';
            return `${symbol} ${newVal}`;
        }
    },

    {
        name: 'UPI ID / VPA',
        // Matches: user@bank, anything looks like email in SMS context
        pattern: /\b[a-zA-Z0-9._-]+@[a-zA-Z]{3,}\b/gi,
        replace: (match) => {
            const [user, bank] = match.split('@');
            // Keep bank part, mask user part with realistic char count
            const maskedUser = user.substring(0, 1) + '***' + user.substring(user.length - 1);
            return `${maskedUser}@${bank}`;
        }
    },

    {
        name: 'Card Last 4',
        // Matches: Card ending 1234, Card XX1234
        pattern: /(?:card|Card)\s*(?:no\.?|number|ending|ending with)?\s*[:.-]?\s*(?:[xX*]*\s*)(\d{4})\b/gi,
        replace: (match, digits) => {
            // Replace with random 4 digits instead of XXXX to simulate real card number
            const randomCard = Math.floor(1000 + Math.random() * 9000).toString();
            return match.replace(digits, randomCard);
        }
    },

    {
        name: 'Mobile Number',
        // Conservative match for 10 digit numbers that look like phones
        // Avoid matching transaction IDs if possible
        pattern: /(?:\b|[^\d])([6-9]\d{9})(?:\b|[^\d])/g,
        replace: (match, number) => {
            return match.replace(number, '9XXXXX' + number.slice(-2));
        }
    },

    {
        name: 'Ref No / Txn ID',
        // Matches typical transaction references
        pattern: /(?:Ref|Txn|Reference|Id)\s*[:.-]?\s*([a-zA-Z0-9]+)/gi,
        replace: (match, id) => {
            if (id.length < 4) return match; // Too short to be sensitive
            return match.replace(id, 'REF' + Math.floor(Math.random() * 100000));
        }
    },

    {
        name: 'Date',
        // Shift dates slightly to prevent correlating with exact transactions
        pattern: /\b(\d{2}[-\/]\d{2}[-\/]\d{2,4})\b/g,
        replace: (match) => {
            const parts = match.split(/[-\/]/);
            // Simple swap to avoiding parsing complex date formats logic here
            // Just return a standard placeholder date to be safe
            return "01-01-202X";
        }
    }
];
