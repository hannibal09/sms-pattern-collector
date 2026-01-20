# SMS Pattern Collector

A privacy-first, client-side tool to help users contribute anonymized SMS samples to improve financial parsers.

## 🔒 Privacy Guarantee

This tool runs **entirely in your browser**. No data is uploaded to any server until you explicitly click "Download JSON" and share that file manually.

- **Client-Side Processing:** All parsing and anonymization happens via JavaScript on your device.
- **PII Stripping:** We automatically remove account numbers, UPI IDs, mobile numbers, and randomize amounts.
- **Trusted Senders Only:** We only process SMS from known banks and financial institutions (whitelist based).

## 🚀 Quick Start

### Option 1: Live Demo
(Link to hosted version will go here)

### Option 2: Run Locally

1. Clone this repository
2. Because this uses ES Modules, you need a local web server (browsers block `file://` for modules).
3. Run with `npx`:
   ```bash
   cd sms-collector-tool
   npx serve .
   ```
4. Open `http://localhost:3000`

## 📝 How to Use

1. **Export SMS**: Use "SMS Backup & Restore" app on Android to create an XML backup.
2. **Upload**: Drop the XML file into the tool.
3. **Review**: Check the preview to see what data is being kept and how it was anonymized.
4. **Export**: Download the `sms_samples_date.json` file.
5. **Share**: Send the JSON file to the developer.

## 🛠️ Development

- `js/parsers/`: Logic for parsing XML/CSV
- `js/anonymizer/`: Privacy rules and regex patterns
- `js/filters/`: Whitelists and categorization logic

## License

MIT
