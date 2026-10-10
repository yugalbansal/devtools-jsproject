const apiMethod = document.getElementById('apiMethod');
const apiUrl = document.getElementById('apiUrl');
const apiHeaders = document.getElementById('apiHeaders');
const apiBody = document.getElementById('apiBody');
const sendBtn = document.getElementById('sendBtn');
const cancelBtn = document.getElementById('cancelBtn');
const copyBtn = document.getElementById('copyBtn');
const apiStatus = document.getElementById('apiStatus');
const apiResponse = document.getElementById('apiResponse');
const apiResHeaders = document.getElementById('apiResHeaders');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

const HISTORY_KEY = 'devtools-api-history';
const MAX_HISTORY = 10;

// Used to cancel the request that is currently running
let controller = null;

sendBtn.addEventListener('click', sendRequest);
cancelBtn.addEventListener('click', cancelRequest);
clearHistoryBtn.addEventListener('click', clearHistory);

async function sendRequest() {
    const method = apiMethod.value;
    const url = apiUrl.value.trim();

    if (url === '') {
        showStatus('Please enter a URL first.', 'error');
        return;
    }

    let headers;
    try {
        headers = parseHeaders(apiHeaders.value);
    } catch (error) {
        showStatus(error.message, 'error');
        return;
    }

    const options = {
        method: method,
        headers: headers
    };

    // GET requests cannot have a body
    const body = apiBody.value.trim();
    if (method !== 'GET' && body !== '') {
        options.body = body;
    }

    // AbortController lets the Cancel button stop the fetch
    controller = new AbortController();
    options.signal = controller.signal;

    sendBtn.disabled = true;
    cancelBtn.disabled = false;
    showStatus('Sending...', '');
    apiResponse.textContent = '';
    apiResHeaders.textContent = '';

    const startTime = performance.now();

    try {
        const response = await fetch(url, options);
        const text = await response.text();
        const timeTaken = Math.round(performance.now() - startTime);

        // response.ok is true only for status 200-299
        const type = response.ok ? 'success' : 'error';
        showStatus(`${response.status} ${response.statusText} · ${timeTaken} ms · ${text.length} chars`, type);

        apiResponse.textContent = formatBody(text);
        apiResHeaders.textContent = formatHeaders(response.headers);

        saveToHistory(method, url, apiHeaders.value, body, response.status);
    } catch (error) {
        if (error.name === 'AbortError') {
            showStatus('Request cancelled.', 'error');
        } else {
            // fetch only rejects on network errors, CORS blocks or a bad URL
            showStatus('Request failed: network error, CORS block or invalid URL.', 'error');
        }

        // Save failed requests too, so they can be fixed and sent again
        saveToHistory(method, url, apiHeaders.value, body, 'ERR');
    }

    sendBtn.disabled = false;
    cancelBtn.disabled = true;
    controller = null;
}

function cancelRequest() {
    if (controller !== null) {
        controller.abort();
    }
}

// "Key: Value" lines -> headers object
function parseHeaders(text) {
    const headers = {};
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line === '') {
            continue;
        }

        const colonIndex = line.indexOf(':');
        if (colonIndex <= 0) {
            throw new Error(`Invalid header on line ${i + 1}. Use Key: Value`);
        }

        const key = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 1).trim();
        headers[key] = value;
    }

    return headers;
}

// Pretty print JSON, otherwise show the raw text
function formatBody(text) {
    if (text === '') {
        return '(empty body)';
    }

    try {
        return JSON.stringify(JSON.parse(text), null, 2);
    } catch (error) {
        return text;
    }
}

function formatHeaders(headers) {
    let result = '';

    headers.forEach(function(value, key) {
        result += `${key}: ${value}\n`;
    });

    return result === '' ? '(no headers visible)' : result;
}

function showStatus(message, type) {
    apiStatus.textContent = message;
    apiStatus.classList.remove('success', 'error');

    if (type !== '') {
        apiStatus.classList.add(type);
    }
}

// History is kept in localStorage so it survives a page reload
function getHistory() {
    const saved = localStorage.getItem(HISTORY_KEY);

    if (saved === null) {
        return [];
    }

    try {
        return JSON.parse(saved);
    } catch (error) {
        return [];
    }
}

function saveToHistory(method, url, headers, body, status) {
    const history = getHistory();

    // Newest request goes on top
    history.unshift({
        method: method,
        url: url,
        headers: headers,
        body: body,
        status: status
    });

    // Keep only the last MAX_HISTORY requests
    if (history.length > MAX_HISTORY) {
        history.length = MAX_HISTORY;
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    displayHistory();
}

function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
    displayHistory();
}

// Use template literals to build the history list
function displayHistory() {
    const history = getHistory();

    if (history.length === 0) {
        historyList.innerHTML = `<p class="empty-msg">No requests yet.</p>`;
        return;
    }

    let html = '';

    for (let i = 0; i < history.length; i++) {
        const item = history[i];

        html += `<div class="history-item" data-index="${i}">`;
        html += `<span class="method-tag">${item.method}</span>`;
        html += `<span class="history-url">${escapeHtml(item.url)}</span>`;
        html += `<span class="history-status">${item.status}</span>`;
        html += `</div>`;
    }

    historyList.innerHTML = html;
}

// Clicking a history row loads that request back into the form
historyList.addEventListener('click', function(event) {
    const row = event.target.closest('.history-item');

    if (row === null) {
        return;
    }

    const item = getHistory()[row.dataset.index];

    apiMethod.value = item.method;
    apiUrl.value = item.url;
    apiHeaders.value = item.headers;
    apiBody.value = item.body;

    // Show the user that the request was loaded, then scroll up to the form
    showStatus(`Loaded from history: ${item.method} ${item.url}. Press Send Request to run it again.`, '');
    apiResponse.textContent = '';
    apiResHeaders.textContent = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    apiUrl.focus();
});

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Copy response body to clipboard
copyBtn.addEventListener('click', function() {
    const text = apiResponse.textContent;

    if (text === '') {
        return;
    }

    navigator.clipboard.writeText(text).then(function() {
        copyBtn.textContent = 'Copied!';
        setTimeout(function() {
            copyBtn.textContent = 'Copy';
        }, 1500);
    });
});

// Show saved history when the page loads
displayHistory();
