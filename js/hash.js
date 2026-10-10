const hashInput = document.getElementById('hashInput');
const hashFile = document.getElementById('hashFile');
const expectedHash = document.getElementById('expectedHash');
const generateBtn = document.getElementById('generateBtn');
const hashValue = document.getElementById('hashOutput');
const hashMatch = document.getElementById('hashMatch');
const copyBtn = document.getElementById('copyBtn');

generateBtn.addEventListener('click', async function() {
    hashMatch.textContent = '';
    hashMatch.className = 'hash-match';

    let data;

    if (hashFile.files.length > 0) {
        // A file is read as raw bytes, so any file type works (zip, iso, pdf...)
        const file = hashFile.files[0];
        hashValue.textContent = 'Hashing ' + file.name + '...';
        data = await file.arrayBuffer();
    } else {
        const text = hashInput.value;

        if (text === '') {
            hashValue.textContent = 'Please enter some text or choose a file first.';
            return;
        }

        // Text has to be turned into bytes first
        data = new TextEncoder().encode(text);
    }

    const hashHex = await generateHash(data);
    hashValue.textContent = hashHex;

    checkExpected(hashHex);
});

// Typing new text means the user wants to hash text, not the old file
hashInput.addEventListener('input', function() {
    hashFile.value = '';
});

// SHA-256 hash using the browser Web Crypto API
async function generateHash(data) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // Convert each byte to two hex digits
    return hashArray.map(function(byte) {
        return byte.toString(16).padStart(2, '0');
    }).join('');
}

// Compare with the hash given by the website the file came from
function checkExpected(hashHex) {
    const expected = expectedHash.value.trim().toLowerCase();

    if (expected === '') {
        return;
    }

    if (expected === hashHex) {
        hashMatch.textContent = 'Match: the data is exactly the same as the original.';
        hashMatch.classList.add('match');
    } else {
        hashMatch.textContent = 'No match: the data was changed or got corrupted.';
        hashMatch.classList.add('no-match');
    }
}

// Copy hash to clipboard using the Clipboard API
copyBtn.addEventListener('click', function() {
    const text = hashValue.textContent;

    navigator.clipboard.writeText(text).then(function() {
        copyBtn.textContent = 'Copied!';
        setTimeout(function() {
            copyBtn.textContent = 'Copy';
        }, 1500);
    });
});
