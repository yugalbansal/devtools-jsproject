// Web Worker for diff computation
// Performs line-by-line comparison in a separate thread

self.onmessage = function(event) {
    const original = event.data.original;
    const updated = event.data.updated;

    const result = compareTexts(original, updated);

    // Send result back to main thread
    self.postMessage(result);
};

function compareTexts(original, updated) {
    // Split texts into arrays of lines
    const originalLines = original.split('\n');
    const updatedLines = updated.split('\n');

    const lines = [];
    let added = 0;
    let removed = 0;
    let changed = 0;

    // Get the maximum number of lines
    const maxLines = Math.max(originalLines.length, updatedLines.length);

    // Compare each line
    for (let i = 0; i < maxLines; i++) {
        const origLine = originalLines[i];
        const newLine = updatedLines[i];

        if (i >= originalLines.length) {
            // Line was added
            lines.push({
                lineNum: i + 1,
                status: 'Added',
                content: newLine
            });
            added++;
        } else if (i >= updatedLines.length) {
            // Line was removed
            lines.push({
                lineNum: i + 1,
                status: 'Removed',
                content: origLine
            });
            removed++;
        } else if (origLine === newLine) {
            // Lines are the same
            lines.push({
                lineNum: i + 1,
                status: 'Unchanged',
                content: origLine
            });
        } else {
            // Lines are different (changed)
            lines.push({
                lineNum: i + 1,
                status: 'Changed',
                content: origLine + ' -> ' + newLine
            });
            changed++;
        }
    }

    return {
        lines: lines,
        added: added,
        removed: removed,
        changed: changed
    };
}
