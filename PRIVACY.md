# Privacy Policy & Data Handling

## 1. Zero-Server Architecture
This tool is designed as a "Static Web Application". When you load the page, the JavaScript code is downloaded to your browser. When you upload a file, **it is processed locally within your browser's memory**. No data is sent to any backend server for processing.

## 2. What Data is Collected?
We only extract SMS messages that:
1. Come from whitelisted Sender IDs (e.g., `HDFCBK`, `SBIINB`, `PAYTM`).
2. Contain transaction keywords (e.g., "debited", "credited", "spent").

Personal or private SMS (from +91 numbers or unknown senders) are immediately discarded and never displayed or saved.

## 3. Anonymization Process
Before any data is prepared for export, it goes through a sanitization pipeline:

| Information | Action | Example Output |
|-------------|--------|----------------|
| **Account Numbers** | Masked & randomized | `XX9876` |
| **Amounts** | Randomized (preserving magnitude) | `Rs. 4,532.00` |
| **UPI IDs** | Username masked | `u***r@oksbi` |
| **Phone Numbers** | Masked | `9XXXXX12` |
| **Dates** | Shifted to generic placeholders | `01-01-202X` |

## 4. Consent
By exporting the JSON file and sharing it, you agree that:
- You have reviewed the samples in the preview window.
- You understand that while we strive for perfect anonymization, some edge cases might exist.
- You grant permission for these anonymous text patterns to be used for improving open-source parsing logic.
