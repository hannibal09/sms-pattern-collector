import { parseXML } from './parsers/xmlParser.js';
import { isWhitelistedSender } from './filters/senderWhitelist.js';
import { categorizeMessage } from './filters/categorizer.js';
import { anonymize } from './anonymizer/anonymizer.js';
import { deduplicate } from './deduplicator.js';

// DOM Elements
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');
const uploadSection = document.getElementById('upload-section');
const statusSection = document.getElementById('status-section');
const previewSection = document.getElementById('preview-section');
const progressBar = document.getElementById('progress-bar');
const statusPercent = document.getElementById('status-percent');
const previewContainer = document.getElementById('preview-container');
const exportBtn = document.getElementById('export-btn');

// State
let processedMessages = [];

// Event Listeners
dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('border-indigo-500', 'bg-slate-50');
});
dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('border-indigo-500', 'bg-slate-50');
});
dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-indigo-500', 'bg-slate-50');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleFile(e.target.files[0]);
});

exportBtn.addEventListener('click', exportData);

/**
 * Main Processing Pipeline
 */
async function handleFile(file) {
    if (!file) return;

    // UI Reset
    previewContainer.innerHTML = '';
    statusSection.classList.remove('hidden');
    updateProgress(10);

    // 1. Read File
    const text = await readFileAsText(file);
    updateProgress(30);

    // 2. Parse (detect format based on extension or content)
    let rawMessages = [];
    if (file.name.endsWith('.xml') || text.trim().startsWith('<?xml') || text.includes('<sms')) {
        rawMessages = parseXML(text);
    } else {
        alert('Currently only XML format is supported for main processing.');
        return;
    }

    document.getElementById('stat-total').textContent = rawMessages.length;
    updateProgress(50);

    try {
        // 3. Filter Whitelist & Remove Sent Messages
        const whitelisted = rawMessages.filter(msg => {
            // Type 1 is received, Type 2 is sent. Only keep received.
            if (msg.type && msg.type !== '1') return false;
            return isWhitelistedSender(msg.sender);
        });

        document.getElementById('stat-whitelisted').textContent = whitelisted.length;
        updateProgress(60);

        // 4. Categorize
        whitelisted.forEach(msg => {
            msg.category = categorizeMessage(msg.body);
        });

        // Filter out OTPs and Unknowns
        const relevant = whitelisted.filter(msg => msg.category !== 'OTP' && msg.category !== 'UNKNOWN');

        // 5. Deduplicate (Pick top 5 per sender per category)
        // We dedup BEFORE anonymization to save performance, using original body
        // We treat messages as objects here, passing them through
        const kept = deduplicate(relevant, 5); // 5 max per category

        document.getElementById('stat-kept').textContent = kept.length;
        updateProgress(75);

        // 6. Anonymize
        processedMessages = kept.map(msg => anonymize(msg));

        const anonymizedCount = processedMessages.filter(m => m.isAnonymized).length;
        document.getElementById('stat-anonymized').textContent = anonymizedCount;

        updateProgress(90);

        // 7. Render Preview
        renderPreview(processedMessages);

        updateProgress(100);
        previewSection.classList.remove('hidden');
        // Scroll to preview
        previewSection.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Processing Error:', error);
        alert(`Error processing SMS: ${error.message}\nPlease check console for details.`);
        progressBar.classList.add('bg-red-500');
        statusPercent.textContent = 'Error';
    }
}

function readFileAsText(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsText(file);
    });
}

function updateProgress(percent) {
    progressBar.style.width = `${percent}%`;
    statusPercent.textContent = `${percent}%`;
}

function renderPreview(messages) {
    previewContainer.innerHTML = '';

    if (messages.length === 0) {
        previewContainer.innerHTML = '<div class="text-center p-8 text-slate-500">No relevant financial messages found or all filtered out.</div>';
        return;
    }

    messages.forEach((msg, index) => {
        const el = document.createElement('div');
        el.className = 'bg-white border rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow';
        el.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div>
                    <span class="font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded text-sm">${msg.sender}</span>
                    <span class="ml-2 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">${msg.category}</span>
                </div>
                <button class="text-slate-400 hover:text-red-500" onclick="removeMessage(${index})">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono mt-3">
                <div class="p-3 bg-slate-50 rounded border border-slate-200 opacity-70">
                    <div class="text-xs text-slate-400 mb-1 uppercase tracking-wider">Original (Not Saved)</div>
                    <div class="break-words">${highlightDiff(msg.originalBody, msg.body, 'orig')}</div>
                </div>
                <div class="p-3 bg-emerald-50 rounded border border-emerald-200">
                    <div class="text-xs text-emerald-600 mb-1 uppercase tracking-wider font-bold">Anonymized Output</div>
                    <div class="break-words text-slate-800">${highlightDiff(msg.originalBody, msg.body, 'new')}</div>
                </div>
            </div>
            
            ${msg.anonymizationChanges.length > 0 ? `
                <div class="mt-2 text-xs text-slate-500">
                    Changes: ${msg.anonymizationChanges.map(c => c.type).join(', ')}
                </div>
            ` : ''}
        `;
        previewContainer.appendChild(el);
    });

    // Attach window scope function for the inline onclick handler
    // In a real app we'd use event delegation
    window.removeMessage = (index) => {
        // Not implemented in this simple script for the array splicing 
        // to avoid complexity with re-rendering entire list. 
        // For prototype, we just remove the visual element and mark as deleted.
        messages[index].deleted = true;
        const button = event.currentTarget;
        const card = button.closest('div.bg-white');
        card.style.opacity = '0.5';
        card.style.pointerEvents = 'none';
        button.innerHTML = 'Removed';
    };
}

/**
 * A rudimentary diff highlighter
 */
function highlightDiff(original, modified, mode) {
    // This is a placeholder. 
    // In reality, achieving character-perfect range highlighting needs a library like diff-match-patch.
    // Given we replaced regex matches, we can highlight the *modified* parts easily if we stored indices.
    // For now, return plain text to keep it working without complex deps.
    return mode === 'orig' ? original : modified;
}

function exportData() {
    const validMessages = processedMessages.filter(m => !m.deleted);

    const exportPayload = {
        metadata: {
            generatedAt: new Date().toISOString(),
            totalSamples: validMessages.length,
            version: '1.0.0',
            source: 'SMS Pattern Collector'
        },
        samples: validMessages.map(m => ({
            sender: m.sender,
            body: m.body, // Only the anonymized body!
            category: m.category,
            timestamp: m.timestamp
        }))
    };

    const maxDate = new Date().toISOString().split('T')[0];
    const fileName = `sms_samples_${maxDate}.json`;

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
