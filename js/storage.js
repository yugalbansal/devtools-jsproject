const storageKey = document.getElementById('storageKey');
const storageValue = document.getElementById('storageValue');
const storageType = document.getElementById('storageType');
const addBtn = document.getElementById('addBtn');
const deleteBtn = document.getElementById('deleteBtn');
const clearBtn = document.getElementById('clearBtn');
const storageDisplay = document.getElementById('storageDisplay');

addBtn.addEventListener('click', addKeyValue);
deleteBtn.addEventListener('click', deleteKey);
clearBtn.addEventListener('click', clearAll);

function addKeyValue() {
    const key = storageKey.value.trim();
    const value = storageValue.value.trim();

    if (key === '' || value === '') {
        alert('Please enter both a key and a value.');
        return;
    }

    if (storageType.value === 'local') {
        localStorage.setItem(key, value);
    } else {
        sessionStorage.setItem(key, value);
    }

    // Clear inputs and refresh display
    storageKey.value = '';
    storageValue.value = '';
    displayStorage();
}

function deleteKey() {
    const key = storageKey.value.trim();

    if (key === '') {
        alert('Please enter the key to delete.');
        return;
    }

    if (storageType.value === 'local') {
        localStorage.removeItem(key);
    } else {
        sessionStorage.removeItem(key);
    }

    storageKey.value = '';
    storageValue.value = '';
    displayStorage();
}

function clearAll() {
    if (storageType.value === 'local') {
        localStorage.clear();
    } else {
        sessionStorage.clear();
    }

    displayStorage();
}

// Show both localStorage and sessionStorage data in tables
function displayStorage() {
    let html = '';

    html += buildTable('localStorage', localStorage);
    html += buildTable('sessionStorage', sessionStorage);

    storageDisplay.innerHTML = html;
}

// Use template literals to build the table HTML
function buildTable(name, storageObj) {
    let html = `<p class="storage-type">${name}</p>`;

    const keys = Object.keys(storageObj);

    if (keys.length === 0) {
        html += `<p class="empty-msg">No data stored.</p>`;
        return html;
    }

    html += `<table class="storage-table">`;
    html += `<tr><th>Key</th><th>Value</th><th>Action</th></tr>`;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = storageObj.getItem(key);

        html += `<tr>`;
        html += `<td>${escapeHtml(key)}</td>`;
        html += `<td>${escapeHtml(value)}</td>`;
        html += `<td><button class="action-btn btn-danger" onclick="deleteOne('${name}', '${escapeHtml(key)}')">Delete</button></td>`;
        html += `</tr>`;
    }

    html += `</table>`;
    return html;
}

// Delete a single key by storage name (used by inline onclick)
function deleteOne(storageName, key) {
    if (storageName === 'localStorage') {
        localStorage.removeItem(key);
    } else {
        sessionStorage.removeItem(key);
    }

    displayStorage();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Display stored data when the page loads
displayStorage();
