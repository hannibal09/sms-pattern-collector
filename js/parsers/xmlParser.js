/**
 * Parser for Android SMS Backup & Restore XML files
 */
export function parseXML(fileContent) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(fileContent, 'text/xml');

    const messages = [];
    const smsElements = xmlDoc.querySelectorAll('sms');

    // Also check for MMS which sometimes contain bank info (though rare)
    // For now focusing on SMS

    smsElements.forEach(sms => {
        // Android backup XML structure:
        // <sms protocol="0" address="HDFCBK" date="1672531200000" type="1" body="..." ... />

        try {
            messages.push({
                sender: sms.getAttribute('address') || 'UNKNOWN',
                body: sms.getAttribute('body') || '',
                timestamp: parseInt(sms.getAttribute('date') || '0', 10),
                type: sms.getAttribute('type'), // 1=received, 2=sent by user
            });
        } catch (e) {
            console.warn('Failed to parse SMS entry', e);
        }
    });

    return messages;
}
