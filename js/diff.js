const originalText = document.getElementById('originalText');
const newText = document.getElementById('newText');
const compareBtn = document.getElementById('compareBtn');
const diffResult = document.getElementById('diffResult');

// Create Web Worker for diff computation
const worker = new Worker('js/diffWorker.js');

compareBtn.addEventListener('click', function() {
    const original = originalText.value;
    const updated = newText.value;

    // Send texts to worker for comparison
    worker.postMessage({
        original: original,
        updated: updated
    });
});

// Receive result from worker
worker.onmessage = function(event) {
    const result = event.data;
    displayResult(result);
};

function displayResult(result) {
    let html = '';

    // Show each line with its status
    for (let i = 0; i < result.lines.length; i++) {
        const line = result.lines[i];
        const lineClass = line.status.replace(' ', '-').toLowerCase();
        html += `<p class="diff-line ${lineClass}">`;
        html += `<span class="diff-label">${line.status}</span>`;
        html += `Line ${line.lineNum}: ${escapeHtml(line.content)}`;
        html += `</p>`;
    }

    // Show summary
    html += `<div class="diff-summary">`;
    html += `<strong>Summary:</strong> `;
    html += `${result.added} added, ${result.removed} removed, ${result.changed} changed`;
    html += `</div>`;

    diffResult.innerHTML = html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
