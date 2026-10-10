const originalText = document.getElementById('originalText');
const newText = document.getElementById('newText');
const originalBg = document.getElementById('originalBg');
const newBg = document.getElementById('newBg');
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
    highlightBoxes(result);
};

function displayResult(result) {
    let html = '';

    // Only show lines that differ, unchanged lines are just noise
    for (let i = 0; i < result.lines.length; i++) {
        const line = result.lines[i];

        if (line.status === 'Unchanged') {
            continue;
        }

        const lineClass = line.status.toLowerCase();
        const lineNum = line.status === 'Removed' ? line.oldLine : line.newLine;

        html += `<p class="diff-line ${lineClass}">`;
        html += `<span class="diff-label">${line.status}</span>`;
        html += `Line ${lineNum}: ${escapeHtml(line.content)}`;
        html += `</p>`;
    }

    if (html === '') {
        html = `<p class="diff-line unchanged">Both texts are identical.</p>`;
    }

    // Show summary
    html += `<div class="diff-summary">`;
    html += `<strong>Summary:</strong> `;
    html += `${result.added} added, ${result.removed} removed, ${result.changed} changed`;
    html += `</div>`;

    diffResult.innerHTML = html;
}

// Colour the lines inside the input boxes.
// A textarea cannot colour its own text, so a div with the same text
// sits behind it and gets the colours. The textarea itself is transparent.
function highlightBoxes(result) {
    // Line number -> status, for each box
    const oldMarks = {};
    const newMarks = {};

    for (let i = 0; i < result.lines.length; i++) {
        const line = result.lines[i];

        if (line.status === 'Removed' || line.status === 'Changed') {
            oldMarks[line.oldLine] = line.status.toLowerCase();
        }
        if (line.status === 'Added' || line.status === 'Changed') {
            newMarks[line.newLine] = line.status.toLowerCase();
        }
    }

    originalBg.innerHTML = buildBackground(originalText.value, oldMarks);
    newBg.innerHTML = buildBackground(newText.value, newMarks);
}

function buildBackground(text, marks) {
    const lines = text.split('\n');
    let html = '';

    for (let i = 0; i < lines.length; i++) {
        const mark = marks[i + 1] || '';
        // A space keeps empty lines at full height
        const content = lines[i] === '' ? ' ' : escapeHtml(lines[i]);
        html += `<div class="bg-line ${mark}">${content}</div>`;
    }

    return html;
}

// Old colours are wrong once the text is edited
originalText.addEventListener('input', function() {
    originalBg.innerHTML = '';
});

newText.addEventListener('input', function() {
    newBg.innerHTML = '';
});

// Keep the coloured background lined up when the box scrolls
originalText.addEventListener('scroll', function() {
    originalBg.scrollTop = originalText.scrollTop;
    originalBg.scrollLeft = originalText.scrollLeft;
});

newText.addEventListener('scroll', function() {
    newBg.scrollTop = newText.scrollTop;
    newBg.scrollLeft = newText.scrollLeft;
});

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
