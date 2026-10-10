# DevTools

A collection of browser-based developer utilities built entirely with **HTML, CSS and vanilla JavaScript**. DevTools runs completely on the client side — no backend, no frameworks, no external libraries.

**Live deployment:** [tools.yugalbansal.in](https://tools.yugalbansal.in)

---

## 1. Project Description

DevTools is a multi-tool web application that bundles four commonly needed developer utilities into a single website:

| Tool | Purpose |
|------|---------|
| **Diff Checker** | Compares two blocks of text line by line and highlights only the added, removed and changed lines, both in the result and inside the input boxes |
| **Hash Generator** | Produces a SHA-256 hash of text or a file, and verifies it against an expected hash |
| **JWT Decoder** | Decodes the header and payload of a JSON Web Token and shows whether it has expired |
| **API Tester** | Sends HTTP requests (GET, POST, PUT, PATCH, DELETE) and shows the status, response time, headers and formatted body |

Each tool lives on its own page and shares a common visual theme, so the site behaves like one consistent application rather than four separate scripts.

---

## 2. Goals

- Build a **fully client-side** toolkit where every operation happens inside the browser.
- Demonstrate practical use of modern **browser platform APIs**:
  - **Web Crypto API** — secure SHA-256 hashing
  - **Web Workers** — background processing for the diff engine
  - **Fetch API + AbortController** — sending HTTP requests and cancelling them
  - **Web Storage API** — request history and theme saved in localStorage
  - **Clipboard API** — one-click copy of generated output
- Keep the architecture straightforward: static pages, plain JavaScript and readable code that can be walked through line by line.
- Ensure the project runs by simply opening `index.html` in a browser — no build step, no server, no dependencies to install.

---

## 3. Specifications

### 3.1 Diff Checker
- Two input areas: *Original Text* and *New Text*.
- Comparison uses the **LCS (Longest Common Subsequence)** algorithm: a dynamic-programming table finds the most lines both texts share, so inserting one line does not mark every line after it as changed.
- A removed line directly followed by an added line is shown as one **Changed** line.
- Only differences are listed; unchanged lines are hidden.
- The changed lines are also coloured inside the input boxes. A textarea cannot colour its own text, so a background `div` with the same text and font sits behind a transparent textarea, and its scroll position follows the textarea.
- Each line is classified as **Added**, **Removed**, **Changed** or **Unchanged**, with colour-coded output and a summary count.
- The comparison runs inside a dedicated **Web Worker** (`diffWorker.js`) so the UI stays responsive even for large inputs, since LCS takes O(n × m) time. The main script communicates with it through `postMessage()` / `onmessage`.

### 3.2 Hash Generator
- Accepts text or **any file** and computes its **SHA-256** digest using `crypto.subtle.digest()`. Files are read as bytes with `file.arrayBuffer()`.
- An optional **Expected Hash** field verifies a downloaded file: *Match* means it is identical to the original, *No match* means it was changed or corrupted.
- The resulting digest is converted to a hexadecimal string and displayed.
- A **Copy** button writes the hash to the clipboard via `navigator.clipboard.writeText()`.

### 3.3 JWT Decoder
- Splits the token on `.` into its three standard segments.
- Converts **Base64URL** encoding to standard Base64 (character replacement plus padding), decodes it with `atob()`, rebuilds the bytes as **UTF-8** with `TextDecoder` (so non-English text decodes correctly), and parses the result with `JSON.parse()`.
- Displays the formatted **Header** and **Payload**; invalid or malformed tokens show an *Invalid JWT* message.
- Reads the `iat` and `exp` claims (Unix seconds) and shows the issue date and a **Valid until / Expired on** badge.
- Decoding does not verify the signature; the page says so, since anyone can read a JWT but only the secret key proves it is genuine.
- The decoded payload can be copied with one click.

### 3.4 API Tester
- Choose an HTTP method, enter a URL, optional headers (one `Key: Value` per line) and a JSON body.
- Sends the request with `fetch()` and measures the response time with `performance.now()`.
- Shows the status code and text (green for 2xx via `response.ok`, red otherwise), response headers and the body, pretty-printed when it is JSON.
- A **Cancel** button aborts a running request using `AbortController`.
- The last 10 requests (including failed ones) are saved in **localStorage**, so history survives a reload; clicking a history row loads it back into the form and shows a "Loaded from history" message.
- Requests come from the browser, so APIs that do not allow cross-origin requests (CORS) are blocked and reported as a failed request.

---

## 4. Design

### 4.1 Architecture

```
DevTools/
├── index.html          Home page with navigation cards
├── diff.html           Diff Checker page
├── hash.html           Hash Generator page
├── jwt.html            JWT Decoder page
├── api.html            API Tester page
├── css/
│   ├── style.css       Shared theme: layout, cards, buttons, tables, forms
│   ├── diff.css        Diff-specific result styling
│   ├── hash.css        Hash output styling
│   ├── jwt.css         JWT output styling
│   └── api.css         API Tester styling
└── js/
    ├── diff.js         Diff UI + worker communication
    ├── diffWorker.js   Web Worker: LCS diff logic
    ├── hash.js         SHA-256 of text/files, hash verification, copy
    ├── jwt.js          Base64URL decoding + JSON parsing
    └── api.js          Fetch requests, AbortController, localStorage history
```

### 4.2 Design Decisions

- **Separate page for every tool** — each utility is an independent HTML page with its own CSS and JS file, linked from a central home page. This keeps every feature isolated and easy to test.
- **Common theme, page-specific styling** — `style.css` defines the shared theme (header, cards, forms, buttons, tables) while each page adds a small page-specific stylesheet on top of it.
- **HTML for structure, JavaScript for behaviour** — page skeletons are written directly in HTML; JavaScript is used only to handle events and render dynamic results (diff output, tables, decoded JSON).
- **Comparison work off the main thread** — the diff algorithm lives in `diffWorker.js`, separated from the UI layer, so heavy comparison work never blocks user interaction.

### 4.3 Data Flow (per tool)

- **Diff Checker:** textareas → `diff.js` → `postMessage()` → `diffWorker.js` → result object → `onmessage` → colour-coded HTML output.
- **Hash Generator:** text → `TextEncoder` → `crypto.subtle.digest('SHA-256')` → hex string → display / clipboard.
- **JWT Decoder:** token string → split on `.` → Base64URL → Base64 → `atob()` → `JSON.parse()` → formatted header/payload.
- **API Tester:** form inputs → headers object → `fetch()` with an AbortController signal → status, headers, body → display + save to localStorage history.

---

## 5. How to Run

The project is deployed and available at **[tools.yugalbansal.in](https://tools.yugalbansal.in)** — every tool can be used directly from there.

To run it locally instead:

1. Clone or download this repository.
2. Open `index.html` in any modern browser (Chrome, Firefox, Edge).
3. Navigate to any tool from the home page.

No installation, build step or server is required.

---

## 6. Future Scope

- Support for additional hash algorithms such as SHA-1 and SHA-512, along with hashing of uploaded files instead of plain text.
- Optional JWT signature verification by accepting a secret or public key from the user.
- Ability to export diff results as a unified diff / patch file.
- Import a cURL command into the API Tester and export requests as cURL.
- A dark mode toggle shared across all tool pages.
