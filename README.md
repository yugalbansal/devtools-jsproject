# DevTools

A collection of browser-based developer utilities built entirely with **HTML, CSS and vanilla JavaScript**. DevTools runs completely on the client side — no backend, no frameworks, no external libraries.

**Live deployment:** [tools.yugalbansal.in](https://tools.yugalbansal.in)

---

## 1. Project Description

DevTools is a multi-tool web application that bundles four commonly needed developer utilities into a single website:

| Tool | Purpose |
|------|---------|
| **Diff Checker** | Compares two blocks of text line by line and highlights added, removed and changed lines |
| **Hash Generator** | Produces a SHA-256 hash of any input text |
| **JWT Decoder** | Decodes the header and payload of a JSON Web Token |
| **Storage Manager** | Creates, views and deletes key-value pairs in localStorage and sessionStorage |

Each tool lives on its own page and shares a common visual theme, so the site behaves like one consistent application rather than four separate scripts.

---

## 2. Goals

- Build a **fully client-side** toolkit where every operation happens inside the browser.
- Demonstrate practical use of modern **browser platform APIs**:
  - **Web Crypto API** — secure SHA-256 hashing
  - **Web Workers** — background processing for the diff engine
  - **Web Storage API** — persistent and session-scoped key-value storage
  - **Clipboard API** — one-click copy of generated output
- Keep the architecture straightforward: static pages, plain JavaScript and readable code that can be walked through line by line.
- Ensure the project runs by simply opening `index.html` in a browser — no build step, no server, no dependencies to install.

---

## 3. Specifications

### 3.1 Diff Checker
- Two input areas: *Original Text* and *New Text*.
- Comparison is performed **line by line** using arrays, loops and conditional checks.
- Each line is classified as **Added**, **Removed**, **Changed** or **Unchanged**, with colour-coded output and a summary count.
- The comparison runs inside a dedicated **Web Worker** (`diffWorker.js`) so the UI stays responsive even for large inputs. The main script communicates with it through `postMessage()` / `onmessage`.

### 3.2 Hash Generator
- Accepts any text and computes its **SHA-256** digest using `crypto.subtle.digest()`.
- The resulting digest is converted to a hexadecimal string and displayed.
- A **Copy** button writes the hash to the clipboard via `navigator.clipboard.writeText()`.

### 3.3 JWT Decoder
- Splits the token on `.` into its three standard segments.
- Converts **Base64URL** encoding to standard Base64 (character replacement plus padding), decodes it with `atob()`, and parses the result with `JSON.parse()`.
- Displays the formatted **Header** and **Payload**; invalid or malformed tokens show an *Invalid JWT* message.
- The decoded payload can be copied with one click.

### 3.4 Storage Manager
- Supports both **localStorage** (persistent) and **sessionStorage** (per-tab session).
- Provides **Add / Update**, **Delete Key**, **Clear All** operations and a per-row delete button.
- Stored data is rendered as tables generated with JavaScript template literals.
- Exercises `setItem()`, `getItem()`, `removeItem()` and `clear()` for both storage objects.

---

## 4. Design

### 4.1 Architecture

```
DevTools/
├── index.html          Home page with navigation cards
├── diff.html           Diff Checker page
├── hash.html           Hash Generator page
├── jwt.html            JWT Decoder page
├── storage.html        Storage Manager page
├── css/
│   ├── style.css       Shared theme: layout, cards, buttons, tables, forms
│   ├── diff.css        Diff-specific result styling
│   ├── hash.css        Hash output styling
│   ├── jwt.css         JWT output styling
│   └── storage.css     Storage table styling
└── js/
    ├── diff.js         Diff UI + worker communication
    ├── diffWorker.js   Web Worker: line-by-line comparison logic
    ├── hash.js         SHA-256 generation + clipboard copy
    ├── jwt.js          Base64URL decoding + JSON parsing
    └── storage.js      Web Storage CRUD + table rendering
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
- **Storage Manager:** form inputs → Web Storage API → read both storage objects → HTML tables via template literals.

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
- Import and export of stored key-value pairs as a JSON backup.
- A dark mode toggle shared across all tool pages.
