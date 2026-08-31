# 🗄️ LinkVault

> **A smart, modern bookmark and resource manager built with React 19, Vite, and Tailwind CSS — organize URLs with rich notes, color-coded collections, instant search, pin favorites, and dual web / Chrome Extension (Manifest V3) support.**

---

## 📖 Overview

**LinkVault** solves digital clutter by turning standard browser bookmarks into a structured personal knowledge base. Instead of messy folders and lost links, LinkVault allows you to save URLs with rich context — including custom site names, descriptions/use cases, auto-generated high-resolution favicons, and pinned statuses.

Designed with versatility in mind, LinkVault runs both as a **standalone responsive web application** and as a **lightweight Chrome Extension (Manifest V3)** with shortcut-driven quick-saving.

- **What it does**: Organizes bookmarks into customizable, color-coded collections with emoji icons, provides instant multi-field searching, pins important resources to the top, and supports full vault backup/restore via JSON.
- **Target audience**: Developers, researchers, students, and power users who curate extensive collections of tools, documentation, articles, and media.
- **Key benefits**:
  - **Dual Environment Architecture**: Seamlessly operates in modern web browsers (via `localStorage`) and as a Chrome Extension popup (via `chrome.storage.local`).
  - **Zero-Latency Single-File Bundle**: Compiles down to an ultra-compact single HTML bundle using `vite-plugin-singlefile`.
  - **Rich Contextual Metadata**: Add specific use cases or notes to each link so you always remember *why* you saved it.
  - **Color-Coded Visual Collections**: 9 custom accent palettes and emoji icons for rapid visual scanning.
  - **Complete Data Ownership**: Export and import your entire vault anytime as human-readable JSON.

---

## ✨ Features

- [x] **Dual Deployment Ready** — Runs as a full web app or a packed Chrome Extension (Manifest V3 with `storage`, `activeTab`, `tabs` permissions).
- [x] **Quick Save Shortcut** — Use `Ctrl+Shift+S` (or `Cmd+Shift+S` on Mac) to quick-save active browser tabs into the extension.
- [x] **Custom Collections** — Create, edit, and organize collections with custom names, emoji icons, and 9 vibrant colors (Violet, Indigo, Blue, Cyan, Emerald, Amber, Rose, Pink, Slate).
- [x] **Rich Link Cards** — Store site title, URL, usage notes, pinned status, creation timestamp, and auto-fetched Google 64px favicons.
- [x] **Pinning System** — Pin high-frequency links to stay permanently at the top of your stream.
- [x] **Instant Real-Time Search** — Fast fuzzy search across site titles, URLs, usage notes, and collection names.
- [x] **Dark & Light Mode** — Built-in theme switcher with smooth UI transitions and persistent preference.
- [x] **JSON Import & Export** — Full backup and restore capabilities with automated schema validation and migration safeguards.
- [x] **Toast Notifications** — Contextual UI feedback for link creation, updates, deletes, and clipboard copies.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19.2+ |
| Build Tool | Vite 7.3+ with `vite-plugin-singlefile` |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Language & Types | JavaScript (ES6+ / JSX) & TypeScript Definitions |
| Extension Standard | Chrome Extension Manifest V3 |
| Storage Adapter | Unified Storage Layer (`chrome.storage.local` + `window.localStorage`) |
| Utilities | `clsx`, `tailwind-merge` |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **yarn** / **pnpm**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/jayansh16/linkedvault.git
cd linkedvault

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit `http://localhost:5173` to interact with the web version.

---

## 🧩 Building as a Chrome Extension

LinkVault can be loaded directly into any Chromium browser (Google Chrome, Brave, Edge, Arc, Opera):

### Step 1: Build the Extension

```bash
npm run build
```

This compiles your application and outputs the bundled files into the `dist/` directory.

### Step 2: Load into Chrome

1. Open Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** in the top right corner.
3. Click **Load unpacked**.
4. Select the `linkedvault/dist` (or project root containing `manifest.json` and built assets).
5. Pin the LinkVault icon in your browser toolbar!

---

## 🗃️ Data Schema

The vault state is serialized and persisted under the key `linkvault_data_v1`:

```json
{
  "version": 1,
  "theme": "dark",
  "collections": [
    {
      "id": "col_1740000000_abc123",
      "name": "Dev Resources",
      "color": "#7C3AED",
      "icon": "💻",
      "createdAt": "2026-08-31T10:00:00.000Z",
      "links": [
        {
          "id": "link_1740000000_xyz789",
          "siteName": "MDN Web Docs",
          "url": "https://developer.mozilla.org",
          "use": "Standard JavaScript and Web API reference",
          "favicon": "https://www.google.com/s2/favicons?domain=developer.mozilla.org&sz=64",
          "savedAt": "2026-08-31T10:05:00.000Z",
          "pinned": true
        }
      ]
    }
  ]
}
```

---

## 📁 Project Structure

```text
linkedvault/
├── public/
│   └── manifest.json          # Chrome Extension Manifest V3 configuration
├── src/
│   ├── components/
│   │   ├── AddLinkModal.jsx    # Modal dialog for creating and editing links
│   │   ├── CollectionModal.jsx # Modal dialog for creating/editing collections
│   │   ├── CollectionPanel.jsx # Sidebar with collection stats, badges & filters
│   │   ├── ConfirmModal.jsx    # Action confirmation modal for deletions
│   │   ├── Icons.jsx           # SVG icon components library
│   │   └── LinkCard.jsx        # Interactive bookmark card component
│   ├── hooks/
│   │   └── useToast.js         # Custom toast notification hook
│   ├── utils/
│   │   ├── constants.js        # Color palette & default icon definitions
│   │   ├── currentUrl.js       # Active tab URL reader for Chrome Extension
│   │   └── storage.js          # Unified storage engine (Web & Chrome Storage)
│   ├── App.jsx                 # Top-level state orchestrator & layout
│   ├── index.css               # Tailwind CSS v4 directives & theme styles
│   └── main.jsx                # React DOM entry point
├── index.html                  # HTML entry shell & extension popup viewport
├── package.json                # Project dependencies & scripts
├── vite.config.ts              # Vite & Tailwind configuration
└── README.md
```

### Code Map

| Module / Component | Responsibility |
|---|---|
| `src/utils/storage.js` | Unified persistence bridge: auto-detects browser vs Chrome extension environment, validates schema, generates UIDs, and handles JSON import/export. |
| `src/App.jsx` | Orchestrates global vault state, search queries, active collection filters, dark/light theme classes, and modal triggers. |
| `src/components/CollectionPanel.jsx` | Renders the sidebar navigation, collection pills with item counters, and triggers collection creation modals. |
| `src/components/LinkCard.jsx` | Renders individual bookmark cards with favicons, domains, quick-copy, pin toggles, and deletion prompts. |
| `src/components/AddLinkModal.jsx` | Form for saving/editing bookmarks, URL validation/normalization, title auto-population, and notes. |
| `src/hooks/useToast.js` | Provides floating feedback messages for user interactions. |

---

## 🗺️ Roadmap

- [ ] Automatic page metadata scraping (OpenGraph titles and descriptions)
- [ ] Nested sub-collections / tag filtering
- [ ] Browser bookmark import (HTML / Netscape bookmark format)
- [ ] Cloud sync option (Supabase / Firebase backend)
- [ ] Broken link checker utility

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👤 Contact & Support

- **Author**: [jayansh16](https://github.com/jayansh16)
- **Repository**: [https://github.com/jayansh16/linkedvault](https://github.com/jayansh16/linkedvault)
- **Issues**: [GitHub Issues](https://github.com/jayansh16/linkedvault/issues)

---

## 🙏 Acknowledgments

- Built with React 19, Tailwind CSS v4, and Vite.
- Favicon resolution powered by Google's S2 service.

---

**Made with ❤️ by [jayansh16](https://github.com/jayansh16)**
