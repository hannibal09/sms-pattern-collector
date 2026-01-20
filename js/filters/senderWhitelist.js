/**
 * Whitelist of known financial senders (Banks, Fintechs, etc.)
 */
export const TRUSTED_SENDERS = [
    // Major Banks
    'HDFCBK', 'ICICIB', 'SBIPSG', 'SBIINB', 'SBITZN', 'KOTAK', 'KOTAKB', 'AXISBK', 'AXISBN',
    'PNBSMS', 'BOISMS', 'CBSSBI', 'UNIONB', 'IDBIBK', 'YESBNK', 'YESBK', 'INDBNK',
    'RBLBNK', 'RBLCRD', 'BOBMob', 'IOBCHE', 'CANBNK', 'FEDBNK',

    // Fintech / Wallets
    'PAYTM', 'PAYTMB', 'GPAY', 'GPAYIN', 'BHARPE', 'PHONEP', 'AMAZON',
    'CRED', 'CREDPY', 'SLICE', 'JUPITR', 'FI', 'NIYO', 'ONECRD', 'UNI',

    // Credit Cards (Specific)
    'HDFCCC', 'ICICIC', 'SBCARD', 'AMEX', 'AMEXIN', 'CITI', 'CITIBK', 'SCBL', 'SCBANK',

    // Utilities & Govt
    'FASTAG', 'IDFCFB', 'HPCL', 'BPCL', 'IOCL', 'EPFOHO'
];

export function isWhitelistedSender(sender) {
    if (!sender) return false;

    // Normalize: Remove non-alphanumeric, uppercased
    // Many senders are like "BZ-HDFCBK", "VK-ICICIB"
    // We look for the trusted key inside the sender string

    const normalized = sender.toUpperCase();

    return TRUSTED_SENDERS.some(trusted => {
        // Check if the trusted ID is contained in the sender string
        // e.g. "AXISBK" in "JM-AXISBK"
        return normalized.includes(trusted);
    });
}
