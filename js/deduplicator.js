/**
 * Logic to filter down to a representative sample set
 */

export function deduplicate(messages, maxPerCategory = 5) {
    const grouped = {};

    // Group by sender + category
    messages.forEach(msg => {
        const key = `${msg.sender}_${msg.category}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(msg);
    });

    const keptMessages = [];

    Object.keys(grouped).forEach(key => {
        const group = grouped[key];

        // Sort by "richness" - longer messages often capture more edge cases
        // Also prioritize messages that successfully triggered rules (more PII = better test case)

        group.sort((a, b) => {
            const lenScore = (b.body || '').length - (a.body || '').length;
            return lenScore;
        });

        // Take top N
        // We could add logic here to ensure diversity in templates if needed
        const accepted = group.slice(0, maxPerCategory);

        keptMessages.push(...accepted);
    });

    return keptMessages;
}
