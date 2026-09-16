const hashInput = document.getElementById('hashInput');
const generateBtn = document.getElementById('generateBtn');
const hashValue = document.getElementById('hashValue');
const copyBtn = document.getElementById('copyBtn');

generateBtn.addEventListener('click', function() {
    const text = hashInput.value;

    if (text === '') {
        hashValue.textContent = 'Please enter some text first.';
        return;
    }

    generateHash(text);
});

// SHA-256 hash using the browser Web Crypto API
async function generateHash(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // Convert each byte to two hex digits
    const hashHex = hashArray.map(function(byte) {
        return byte.toString(16).padStart(2, '0');
    }).join('');

    hashValue.textContent = hashHex;
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
