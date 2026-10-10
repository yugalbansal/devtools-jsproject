// Web Worker for diff computation
// Uses LCS (Longest Common Subsequence) so an inserted line
// does not mark every line after it as changed.
// LCS is O(n * m), which is why it runs in a separate thread.

self.onmessage = function(event) {
    const original = event.data.original;
    const updated = event.data.updated;

    const result = compareTexts(original, updated);

    // Send result back to main thread
    self.postMessage(result);
};

function compareTexts(original, updated) {
    // Split texts into arrays of lines
    const a = original.split('\n');
    const b = updated.split('\n');

    // Step 1: build the LCS table
    // dp[i][j] = number of matching lines between a[i..] and b[j..]
    const dp = [];
    for (let i = 0; i <= a.length; i++) {
        dp.push(new Array(b.length + 1).fill(0));
    }

    for (let i = a.length - 1; i >= 0; i--) {
        for (let j = b.length - 1; j >= 0; j--) {
            if (a[i] === b[j]) {
                dp[i][j] = dp[i + 1][j + 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
            }
        }
    }

    // Step 2: walk the table and label each line
    const steps = [];
    let i = 0;
    let j = 0;

    while (i < a.length || j < b.length) {
        if (i < a.length && j < b.length && a[i] === b[j]) {
            // Same line in both texts
            steps.push({ status: 'Unchanged', oldLine: i + 1, newLine: j + 1, content: a[i] });
            i++;
            j++;
        } else if (j < b.length && (i === a.length || dp[i][j + 1] > dp[i + 1][j])) {
            // Skipping a line of the new text keeps more matches: it was added
            // (on a tie we remove first, so step 3 can pair it as a change)
            steps.push({ status: 'Added', newLine: j + 1, content: b[j] });
            j++;
        } else {
            // Otherwise the line from the original text was removed
            steps.push({ status: 'Removed', oldLine: i + 1, content: a[i] });
            i++;
        }
    }

    // Step 3: a removed line followed by an added line is one changed line
    const lines = [];
    let added = 0;
    let removed = 0;
    let changed = 0;

    for (let k = 0; k < steps.length; k++) {
        const step = steps[k];
        const next = steps[k + 1];

        if (step.status === 'Removed' && next && next.status === 'Added') {
            lines.push({
                oldLine: step.oldLine,
                newLine: next.newLine,
                status: 'Changed',
                content: step.content + ' -> ' + next.content
            });
            changed++;
            k++; // skip the added line, it is part of this change
        } else {
            lines.push(step);

            if (step.status === 'Added') {
                added++;
            } else if (step.status === 'Removed') {
                removed++;
            }
        }
    }

    return {
        lines: lines,
        added: added,
        removed: removed,
        changed: changed
    };
}
