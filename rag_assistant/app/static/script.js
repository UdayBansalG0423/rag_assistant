// ===== DOM References =====
const dropZone = document.getElementById('dropZone');
const pdfFileInput = document.getElementById('pdfFile');
const filePreview = document.getElementById('filePreview');
const fileNameSpan = document.getElementById('fileName');
const removeFileBtn = document.getElementById('removeFileBtn');
const uploadBtn = document.getElementById('uploadBtn');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const uploadStatus = document.getElementById('uploadStatus');
const chatMessages = document.getElementById('chatMessages');
const emptyState = document.getElementById('emptyState');
const questionInput = document.getElementById('question');
const askBtn = document.getElementById('askBtn');
const charCount = document.getElementById('charCount');
const sidebar = document.getElementById('sidebar');
const indexedDocsSection = document.getElementById('indexedDocsSection');
const indexedFileList = document.getElementById('indexedFileList');

let selectedFile = null;
let documentsIndexed = false;

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    checkIndexingStatus();
    fetchAndRenderFileList();
});

async function checkIndexingStatus() {
    try {
        const res = await fetch('/status');
        const data = await res.json();
        documentsIndexed = data.documents_indexed;
    } catch (err) {
        console.error('Failed to fetch status:', err);
    }
}

async function fetchAndRenderFileList() {
    try {
        const res = await fetch('/documents');
        const data = await res.json();
        const files = data.documents || [];

        if (files.length > 0) {
            indexedDocsSection.style.display = 'block';
            indexedFileList.innerHTML = files.map(file => `
                <div class="indexed-file-item" title="${escapeHTML(file)}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <span class="file-name">${escapeHTML(file)}</span>
                </div>
            `).join('');
        } else {
            indexedDocsSection.style.display = 'none';
        }
    } catch (err) {
        console.error('Failed to fetch file list:', err);
    }
}

// ===== Sidebar Toggle (Mobile) =====
function toggleSidebar() {
    sidebar.classList.toggle('open');
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 &&
        sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        !e.target.closest('.sidebar-toggle')) {
        sidebar.classList.remove('open');
    }
});

// ===== Drag & Drop =====
dropZone.addEventListener('click', () => pdfFileInput.click());

dropZone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelection(file);
});

pdfFileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) handleFileSelection(e.target.files[0]);
});

removeFileBtn.addEventListener('click', clearFileSelection);

// ===== File Handling =====
function handleFileSelection(file) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
        showStatus('Only PDF files are supported.', 'error');
        return;
    }
    selectedFile = file;
    fileNameSpan.textContent = file.name;
    filePreview.style.display = 'flex';
    dropZone.style.display = 'none';
    showStatus('', '');
}

function clearFileSelection() {
    selectedFile = null;
    pdfFileInput.value = '';
    filePreview.style.display = 'none';
    dropZone.style.display = 'block';
}

function showStatus(text, type) {
    uploadStatus.textContent = text;
    uploadStatus.className = 'status-msg' + (type ? ' ' + type : '');
    uploadStatus.style.opacity = '1';

    // Auto-clear after 5 seconds
    setTimeout(() => {
        uploadStatus.style.opacity = '0';
        setTimeout(() => {
            uploadStatus.textContent = '';
            uploadStatus.className = 'status-msg'; // Reset to base class
        }, 500); // Wait for fade transition
    }, 5000);
}

// ===== Upload =====
async function uploadPDF() {
    if (!selectedFile) {
        showStatus('Select a PDF file first.', 'error');
        return;
    }

    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<span class="spinner"></span> Indexing...';
    progressContainer.style.display = 'block';
    showStatus('', '');

    let progress = 0;
    const ticker = setInterval(() => {
        progress += Math.random() * 18;
        if (progress > 92) progress = 92;
        progressBar.style.width = progress + '%';
    }, 250);

    try {
        const fd = new FormData();
        fd.append('file', selectedFile);

        const res = await fetch('/upload', { method: 'POST', body: fd });
        const data = await res.json();

        clearInterval(ticker);
        progressBar.style.width = '100%';

        if (data.error) {
            showStatus(data.error, 'error');
        } else {
            showStatus('✓ ' + (data.status || 'Indexed successfully'), 'success');
            documentsIndexed = true;
            fetchAndRenderFileList(); // Refresh list after upload
        }

        setTimeout(() => {
            progressContainer.style.display = 'none';
            progressBar.style.width = '0%';
        }, 1200);

        clearFileSelection();
    } catch (err) {
        clearInterval(ticker);
        progressContainer.style.display = 'none';
        showStatus('Upload failed. Try again.', 'error');
    }

    uploadBtn.disabled = false;
    uploadBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        </svg>
        Upload & Index
    `;
}

// ===== Character Count =====
questionInput.addEventListener('input', () => {
    const len = questionInput.value.length;
    charCount.textContent = len > 0 ? len : '';
});

// ===== Enter to Send =====
questionInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        askQuestion();
    }
});

// ===== Suggestion Chips =====
function useSuggestion(btn) {
    const text = btn.textContent.replace(/^[^\w]+/, '').trim();
    questionInput.value = text;
    questionInput.focus();
    charCount.textContent = text.length;
}

// ===== Chat Logic =====
function hideEmptyState() {
    if (emptyState) emptyState.style.display = 'none';
}

function clearChat() {
    chatMessages.innerHTML = '';
    if (emptyState) {
        chatMessages.appendChild(emptyState);
        emptyState.style.display = 'flex';
    }
}

function createAvatar(type) {
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar ' + (type === 'user' ? 'user-avatar' : 'ai-avatar');

    if (type === 'user') {
        avatar.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>`;
    } else {
        avatar.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>`;
    }
    return avatar;
}

function addMessage(content, type) {
    hideEmptyState();

    const row = document.createElement('div');
    row.className = 'message-row ' + type;

    const avatar = createAvatar(type);

    const body = document.createElement('div');
    body.className = 'msg-body';

    const bubble = document.createElement('div');
    bubble.className = 'msg-content';
    bubble.innerHTML = content;

    body.appendChild(bubble);
    row.appendChild(avatar);
    row.appendChild(body);
    chatMessages.appendChild(row);
    scrollToBottom();

    return bubble;
}

function addTypingIndicator() {
    hideEmptyState();
    const row = document.createElement('div');
    row.className = 'typing-row';
    row.id = 'typingIndicator';

    const avatar = createAvatar('assistant');
    const bubble = document.createElement('div');
    bubble.className = 'typing-bubble';
    bubble.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

    row.appendChild(avatar);
    row.appendChild(bubble);
    chatMessages.appendChild(row);
    scrollToBottom();
}

function removeTypingIndicator() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
}

function scrollToBottom() {
    chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
}

async function askQuestion() {
    if (!documentsIndexed) {
        addMessage('Please upload and index a document first.', 'assistant');
        return;
    }

    const q = questionInput.value.trim();
    if (!q) return;

    // User message
    addMessage(escapeHTML(q), 'user');
    questionInput.value = '';
    charCount.textContent = '';
    questionInput.focus();

    // Typing indicator
    addTypingIndicator();
    askBtn.disabled = true;

    try {
        const res = await fetch(`/ask?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        removeTypingIndicator();

        // Build answer
        let html = '<div class="answer-text"></div>';

        // Meta (sources + latency)
        let meta = '';
        if ((data.sources && data.sources.length > 0) || data.latency !== undefined) {
            meta = '<div class="msg-meta">';
            if (data.sources) {
                data.sources.forEach(s => {
                    meta += `<span class="source-pill">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        ${escapeHTML(s)}
                    </span>`;
                });
            }
            if (data.latency !== undefined) {
                const latency = parseFloat(data.latency);
                const perfInfo = latency < 3 ? { class: 'perf-fast', label: 'Fast' } :
                    (latency < 8 ? { class: 'perf-avg', label: 'Average' } :
                        { class: 'perf-slow', label: 'Slow' });

                meta += `<span class="latency-badge ${perfInfo.class}" title="Response Performance: ${perfInfo.label}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    ${latency.toFixed(2)}s
                </span>`;
            }
            meta += '</div>';
        }

        const bubble = addMessage(html + meta, 'assistant');
        typewriter(bubble.querySelector('.answer-text'), data.answer);

    } catch (err) {
        removeTypingIndicator();
        addMessage('Something went wrong. Please try again.', 'error');
    }

    askBtn.disabled = false;
}

// ===== Typewriter Effect =====
function typewriter(el, text) {
    el.textContent = '';
    let i = 0;
    const speed = 10;
    function tick() {
        if (i < text.length) {
            el.textContent += text.charAt(i);
            i++;
            scrollToBottom();
            requestAnimationFrame(() => setTimeout(tick, speed));
        }
    }
    tick();
}

// ===== Utility =====
function escapeHTML(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}