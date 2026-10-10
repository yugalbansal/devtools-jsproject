const jwtInput = document.getElementById('jwtInput');
const decodeBtn = document.getElementById('decodeBtn');
const copyBtn = document.getElementById('copyBtn');
const jwtHeader = document.getElementById('jwtHeader');
const jwtPayload = document.getElementById('jwtPayload');
const jwtStatus = document.getElementById('jwtStatus');

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

        showExpiry(payload);
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

    // atob gives one character per byte, so non-English text (like "José")
    // would come out broken. TextDecoder joins the bytes back as UTF-8.
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return new TextDecoder('utf-8').decode(bytes);
}

// exp and iat are Unix timestamps in seconds, not milliseconds
function showExpiry(payload) {
    jwtStatus.className = 'jwt-status';

    if (payload.exp === undefined) {
        jwtStatus.textContent = 'No expiry (exp) in this token.';
        return;
    }

    const expDate = new Date(payload.exp * 1000);
    let text = '';

    if (payload.iat !== undefined) {
        text += 'Issued: ' + new Date(payload.iat * 1000).toLocaleString() + '  |  ';
    }

    if (Date.now() > expDate.getTime()) {
        text += 'Expired on ' + expDate.toLocaleString();
        jwtStatus.classList.add('expired');
    } else {
        text += 'Valid until ' + expDate.toLocaleString();
        jwtStatus.classList.add('valid');
    }

    // Decoding only reads the token, it does not prove it is genuine
    jwtStatus.textContent = text + '  (signature not verified)';
}

function showError(message) {
    jwtHeader.textContent = message;
    jwtHeader.classList.add('error');
    jwtPayload.textContent = '';
    jwtPayload.classList.remove('error');
    jwtStatus.textContent = '';
    jwtStatus.className = 'jwt-status';
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
