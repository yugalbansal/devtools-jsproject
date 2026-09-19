const jwtInput = document.getElementById('jwtInput');
const decodeBtn = document.getElementById('decodeBtn');
const copyBtn = document.getElementById('copyBtn');
const jwtHeader = document.getElementById('jwtHeader');
const jwtPayload = document.getElementById('jwtPayload');

decodeBtn.addEventListener('click', function() {
    const token = jwtInput.value.trim();

    if (token === '') {
        showError('Please paste a JWT token first.');
        return;
    }

    try {
        // JWT has 3 parts separated by dots
        const parts = token.split('.');

        if (parts.length !== 3) {
            throw new Error('not 3 parts');
        }

        const headerJson = decodeBase64Url(parts[0]);
        const payloadJson = decodeBase64Url(parts[1]);

        const header = JSON.parse(headerJson);
        const payload = JSON.parse(payloadJson);

        jwtHeader.classList.remove('error');
        jwtPayload.classList.remove('error');

        jwtHeader.textContent = JSON.stringify(header, null, 2);
        jwtPayload.textContent = JSON.stringify(payload, null, 2);
    } catch (error) {
        showError('Invalid JWT');
    }
});

// Base64URL uses - instead of +, _ instead of / and no padding
function decodeBase64Url(str) {
    // Replace URL-safe characters with standard Base64 characters
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding back if needed
    while (base64.length % 4 !== 0) {
        base64 += '=';
    }

    return atob(base64);
}

function showError(message) {
    jwtHeader.textContent = message;
    jwtHeader.classList.add('error');
    jwtPayload.textContent = '';
    jwtPayload.classList.remove('error');
}

// Copy payload to clipboard
copyBtn.addEventListener('click', function() {
    const text = jwtPayload.textContent;

    if (text === '') {
        return;
    }

    navigator.clipboard.writeText(text).then(function() {
        copyBtn.textContent = 'Copied!';
        setTimeout(function() {
            copyBtn.textContent = 'Copy Payload';
        }, 1500);
    });
});
