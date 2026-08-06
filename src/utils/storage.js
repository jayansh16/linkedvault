/**
 * LinkVault Storage Layer
 * 
 * JSON Data Schema (stored in localStorage or chrome.storage.local):
 * {
 *   "version": 1,
 *   "theme": "dark" | "light",
 *   "collections": [
 *     {
 *       "id": "col_xxx",
 *       "name": "Dev Resources",
 *       "color": "#7C3AED",
 *       "icon": "💻",
 *       "createdAt": "2024-01-01T00:00:00.000Z",
 *       "links": [
 *         {
 *           "id": "link_xxx",
 *           "siteName": "MDN Web Docs",
 *           "url": "https://developer.mozilla.org",
 *           "use": "Look up JS array methods",
 *           "favicon": "https://www.google.com/s2/favicons?domain=developer.mozilla.org&sz=64",
 *           "savedAt": "2024-01-01T10:00:00.000Z",
 *           "pinned": false
 *         }
 *       ]
 *     }
 *   ]
 * }
 * 
 * Both environments store/retrieve the SAME JSON string format.
 * - Web/preview: window.localStorage  (JSON.stringify on write, JSON.parse on read)
 * - Chrome ext:  chrome.storage.local  (JSON.stringify on write, JSON.parse on read)
 */

const STORAGE_KEY = "linkvault_data_v1";

// ---------- Default empty vault ----------
function defaultVault() {
  return {
    version: 1,
    theme: "dark",
    collections: [],
  };
}

// ---------- Environment detection ----------
function isChromeExtension() {
  try {
    return !!(
      typeof chrome !== "undefined" &&
      chrome.runtime &&
      chrome.runtime.id &&
      chrome.storage &&
      chrome.storage.local
    );
  } catch {
    return false;
  }
}

// ---------- LOAD ----------
export async function loadData() {
  if (isChromeExtension()) {
    return new Promise((resolve) => {
      chrome.storage.local.get(STORAGE_KEY, (result) => {
        const raw = result[STORAGE_KEY];
        if (!raw) {
          resolve(defaultVault());
          return;
        }
        try {
          // chrome.storage may store as string or object depending on how it was saved
          const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
          resolve(validateVault(parsed));
        } catch {
          resolve(defaultVault());
        }
      });
    });
  }

  // Web / localStorage fallback
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultVault();
    const parsed = JSON.parse(raw);
    return validateVault(parsed);
  } catch {
    return defaultVault();
  }
}

// ---------- SAVE ----------
export async function saveData(data) {
  const json = JSON.stringify(data);

  if (isChromeExtension()) {
    return new Promise((resolve) => {
      // Store as JSON string so both environments are identical
      chrome.storage.local.set({ [STORAGE_KEY]: json }, () => resolve());
    });
  }

  // Web / localStorage fallback
  window.localStorage.setItem(STORAGE_KEY, json);
}

// ---------- Validate & migrate ----------
function validateVault(obj) {
  if (!obj || typeof obj !== "object") return defaultVault();
  if (!Array.isArray(obj.collections)) obj.collections = [];
  if (!obj.version) obj.version = 1;
  if (!obj.theme) obj.theme = "dark";

  // Validate each collection
  obj.collections = obj.collections.filter(
    (c) => c && typeof c === "object" && c.id && c.name
  );
  obj.collections.forEach((c) => {
    if (!Array.isArray(c.links)) c.links = [];
    if (!c.color) c.color = "#7C3AED";
    if (!c.icon) c.icon = "📁";
    if (!c.createdAt) c.createdAt = new Date().toISOString();
    // Validate each link
    c.links = c.links.filter(
      (l) => l && typeof l === "object" && l.id && l.url
    );
    c.links.forEach((l) => {
      if (!l.siteName) l.siteName = "";
      if (!l.use) l.use = "";
      if (!l.favicon) l.favicon = getFavicon(l.url);
      if (!l.savedAt) l.savedAt = new Date().toISOString();
      if (typeof l.pinned !== "boolean") l.pinned = false;
    });
  });

  return obj;
}

// ---------- Export full vault as JSON string ----------
export function exportVaultToJson(data) {
  return JSON.stringify(data, null, 2);
}

// ---------- Import vault from JSON string ----------
export function importVaultFromJson(jsonString) {
  const parsed = JSON.parse(jsonString);
  return validateVault(parsed);
}

// ---------- Helpers ----------
export function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function getFavicon(url) {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
  } catch {
    return `https://www.google.com/s2/favicons?domain=&sz=64`;
  }
}

export function hostnameOf(url) {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function truncate(str, len) {
  if (!str) return "";
  if (str.length <= len) return str;
  return str.slice(0, len - 1) + "…";
}

export function normalizeUrl(url) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function nowIso() {
  return new Date().toISOString();
}
