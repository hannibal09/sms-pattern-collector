import { ANONYMIZATION_RULES } from './rules.js';

export function anonymize(message) {
    let anonymizedBody = message.body;
    const changes = [];

    // Apply all rules
    ANONYMIZATION_RULES.forEach(rule => {
        // We use a loop to handle multiple occurrences of the same PII type
        // and recreate regex to reset state

        let currentBody = anonymizedBody;
        let newBody = currentBody;

        // We iterate match by match
        const matches = [...currentBody.matchAll(rule.pattern)];

        if (matches.length > 0) {
            // Reverse iterate to replace without messing up indices if we were using indices
            // But since we use replace() on string, we can just replace. 
            // Caution: global replace might replace identical non-PII values.
            // For safer replacement, we should use the specific match location if we were building substantial logic.
            // For this lightweight tool, replace function in regex is safer.

            newBody = currentBody.replace(rule.pattern, (...args) => {
                const match = args[0];
                // Call the rule's replacer
                const replaced = rule.replace(...args);

                if (match !== replaced) {
                    changes.push({
                        type: rule.name,
                        original: match,
                        replaced: replaced
                    });
                }
                return replaced;
            });
        }

        anonymizedBody = newBody;
    });

    return {
        ...message,
        originalBody: message.body,
        body: anonymizedBody,
        anonymizationChanges: changes,
        isAnonymized: changes.length > 0
    };
}
