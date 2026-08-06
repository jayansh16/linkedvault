import { useEffect, useMemo, useRef, useState } from "react";
import {
  getFavicon,
  loadData,
  nowIso,
  saveData,
  uid,
  exportVaultToJson,
  importVaultFromJson,
} from "./utils/storage.js";
import { CollectionPanel } from "./components/CollectionPanel.jsx";
import { LinkCard } from "./components/LinkCard.jsx";
import { AddLinkModal } from "./components/AddLinkModal.jsx";
import { CollectionModal } from "./components/CollectionModal.jsx";
import { ConfirmModal } from "./components/ConfirmModal.jsx";
import { useToast } from "./hooks/useToast.js";
import {
  Bookmarks,
  Download,
  Moon,
  Plus,
  Search,
  Sparkles,
  Sun,
  Upload,
} from "./components/Icons.jsx";

export default function App() {
  // vault = { version, theme, collections }
  const [vault, setVault] = useState({ version: 1, theme: "dark", collections: [] });
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);

  // Modals
  const [addLinkOpen, setAddLinkOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [collModal, setCollModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const { msg: toastMsg, show: showToast } = useToast();
  const fileInputRef = useRef(null);

  // ===== LOAD from localStorage (or chrome.storage.local) on mount =====
  useEffect(() => {
    (async () => {
      const stored = await loadData();
      setVault(stored);
      setLoaded(true);
    })();
  }, []);

  // ===== SAVE to localStorage (or chrome.storage.local) on every change =====
  useEffect(() => {
    if (!loaded) return;
    saveData(vault);
  }, [vault, loaded]);

  // Apply theme class to body
  useEffect(() => {
    document.body.classList.toggle("light", vault.theme === "light");
  }, [vault.theme]);

  function toggleTheme() {
    setVault((v) => ({
      ...v,
      theme: v.theme === "dark" ? "light" : "dark",
    }));
  }

  // ===== Derived data for right panel =====
  const visibleLinks = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = [];

    if (active === "all") {
      for (const c of vault.collections) {
        for (const l of c.links) all.push({ link: l, collectionId: c.id });
      }
    } else if (active === "pinned") {
      for (const c of vault.collections) {
        for (const l of c.links)
          if (l.pinned) all.push({ link: l, collectionId: c.id });
      }
    } else {
      const c = vault.collections.find((x) => x.id === active);
      if (c)
        for (const l of c.links) all.push({ link: l, collectionId: c.id });
    }

    const filtered = q
      ? all.filter(
          ({ link }) =>
            (link.siteName || "").toLowerCase().includes(q) ||
            (link.url || "").toLowerCase().includes(q) ||
            (link.use || "").toLowerCase().includes(q)
        )
      : all;

    // Pinned first, then newest first
    filtered.sort((a, b) => {
      if (!!b.link.pinned !== !!a.link.pinned) return b.link.pinned ? 1 : -1;
      return (b.link.savedAt || "").localeCompare(a.link.savedAt || "");
    });
    return filtered;
  }, [vault, active, query]);

  const activeCollection =
    active !== "all" && active !== "pinned"
      ? vault.collections.find((c) => c.id === active)
      : null;

  // ===== CRUD: Collections =====
  function addCollection(name, color, icon) {
    const newColl = {
      id: uid("col"),
      name,
      color,
      icon,
      createdAt: nowIso(),
      links: [],
    };
    setVault((v) => ({ ...v, collections: [...v.collections, newColl] }));
    setActive(newColl.id);
    showToast(`Created "${name}"`);
  }

  function renameCollection(id, name, color, icon) {
    setVault((v) => ({
      ...v,
      collections: v.collections.map((c) =>
        c.id === id ? { ...c, name, color, icon } : c
      ),
    }));
    showToast("Collection updated");
  }

  function deleteCollection(id) {
    const coll = vault.collections.find((c) => c.id === id);
    if (!coll) return;
    setConfirm({
      title: `Delete "${coll.name}"?`,
      message: `This will permanently delete the collection and its ${coll.links.length} saved link(s). This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: () => {
        setVault((v) => ({
          ...v,
          collections: v.collections.filter((c) => c.id !== id),
        }));
        if (active === id) setActive("all");
        setConfirm(null);
        showToast("Collection deleted");
      },
    });
  }

  // ===== CRUD: Links =====
  function saveLink(draft, targetCollectionId) {
    // Auto-create "Unsorted" collection if none exist
    if (!targetCollectionId) {
      const colId = uid("col");
      const col = {
        id: colId,
        name: "Unsorted",
        color: "#7C3AED",
        icon: "🔖",
        createdAt: nowIso(),
        links: [],
      };
      setVault((v) => ({ ...v, collections: [...v.collections, col] }));
      targetCollectionId = colId;
    }

    if (draft.id) {
      // Editing existing link
      const existing = findLinkById(draft.id);
      if (!existing) return;
      const { link, collectionId: fromId } = existing;
      const updated = {
        ...link,
        siteName: draft.siteName,
        url: draft.url,
        use: draft.use,
        favicon: getFavicon(draft.url),
      };

      setVault((v) => {
        let collections = v.collections.map((c) =>
          c.id === fromId
            ? { ...c, links: c.links.filter((l) => l.id !== updated.id) }
            : c
        );
        collections = collections.map((c) =>
          c.id === targetCollectionId
            ? {
                ...c,
                links: c.links.some((l) => l.id === updated.id)
                  ? c.links.map((l) => (l.id === updated.id ? updated : l))
                  : [updated, ...c.links],
              }
            : c
        );
        return { ...v, collections };
      });
      setEditingLink(null);
      showToast("Link updated");
    } else {
      // New link
      const newLink = {
        id: uid("link"),
        siteName: draft.siteName,
        url: draft.url,
        use: draft.use,
        favicon: getFavicon(draft.url),
        savedAt: nowIso(),
        pinned: false,
      };
      setVault((v) => ({
        ...v,
        collections: v.collections.map((c) =>
          c.id === targetCollectionId
            ? { ...c, links: [newLink, ...c.links] }
            : c
        ),
      }));
      setAddLinkOpen(false);
      setActive(targetCollectionId);
      showToast("Link saved to vault");
    }
  }

  function deleteLink(linkId, collectionId) {
    const coll = vault.collections.find((c) => c.id === collectionId);
    const link = coll?.links.find((l) => l.id === linkId);
    setConfirm({
      title: "Delete this link?",
      message: link
        ? `"${link.siteName}" will be removed from your vault. This cannot be undone.`
        : "This link will be permanently removed.",
      confirmLabel: "Delete",
      danger: true,
      onConfirm: () => {
        setVault((v) => ({
          ...v,
          collections: v.collections.map((c) =>
            c.id === collectionId
              ? { ...c, links: c.links.filter((l) => l.id !== linkId) }
              : c
          ),
        }));
        setConfirm(null);
        showToast("Link deleted");
      },
    });
  }

  function togglePin(linkId, collectionId) {
    setVault((v) => ({
      ...v,
      collections: v.collections.map((c) =>
        c.id === collectionId
          ? {
              ...c,
              links: c.links.map((l) =>
                l.id === linkId ? { ...l, pinned: !l.pinned } : l
              ),
            }
          : c
      ),
    }));
  }

  function moveLink(linkId, fromId, toId) {
    if (fromId === toId) return;
    setVault((v) => {
      const fromCol = v.collections.find((c) => c.id === fromId);
      const link = fromCol?.links.find((l) => l.id === linkId);
      if (!fromCol || !link) return v;
      return {
        ...v,
        collections: v.collections.map((c) => {
          if (c.id === fromId)
            return { ...c, links: c.links.filter((l) => l.id !== linkId) };
          if (c.id === toId)
            return {
              ...c,
              links: [link, ...c.links.filter((l) => l.id !== linkId)],
            };
          return c;
        }),
      };
    });
    const toCol = vault.collections.find((c) => c.id === toId);
    if (toCol) showToast(`Moved to "${toCol.name}"`);
  }

  function findLinkById(linkId) {
    for (const c of vault.collections) {
      const link = c.links.find((l) => l.id === linkId);
      if (link) return { link, collectionId: c.id };
    }
    return undefined;
  }

  // ===== EXPORT: downloads vault as .json file =====
  function handleExport() {
    const jsonStr = exportVaultToJson(vault);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `linkvault-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported as JSON");
  }

  // ===== IMPORT: reads .json file, validates, replaces vault =====
  function handleImport(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = importVaultFromJson(String(reader.result));
        setVault(imported);
        showToast(`Imported ${imported.collections.length} collection(s)`);
      } catch {
        showToast("Import failed — invalid JSON file");
      }
    };
    reader.readAsText(file);
  }

  // ===== Keyboard shortcuts =====
  useEffect(() => {
    function onKey(e) {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "s"
      ) {
        e.preventDefault();
        setAddLinkOpen(true);
      }
      if (e.key === "Escape") {
        if (confirm) setConfirm(null);
        else if (collModal) setCollModal(null);
        else if (editingLink) setEditingLink(null);
        else if (addLinkOpen) setAddLinkOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addLinkOpen, editingLink, collModal, confirm]);

  const totalLinks = vault.collections.reduce((s, c) => s + c.links.length, 0);

  // ===== Loading state =====
  if (!loaded) {
    return (
      <div className="app-shell bg-aurora flex items-center justify-center">
        <div className="text-white/70 text-sm flex items-center gap-2">
          <Sparkles className="animate-spin-slow" /> Loading vault…
        </div>
      </div>
    );
  }

  // ===== Main render =====
  return (
    <div className="app-shell bg-aurora text-white">
      {/* Top Bar */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/5">
        <button
          className="icon-btn"
          onClick={() => setCollapsedSidebar((v) => !v)}
          title="Toggle sidebar"
        >
          <Bookmarks className="h-4 w-4 text-violet-400" />
        </button>
        <div className="flex h-8 items-center gap-1.5 rounded-lg bg-white/5 px-2 flex-1 border border-white/5">
          <Search className="text-white/40" />
          <input
            className="h-full flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-white/35"
            placeholder="Search links, URLs, notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              className="icon-btn !h-6 !w-6"
              onClick={() => setQuery("")}
              title="Clear"
            >
              ×
            </button>
          )}
        </div>
        <button
          className="icon-btn"
          onClick={toggleTheme}
          title="Toggle theme"
        >
          {vault.theme === "dark" ? <Sun /> : <Moon />}
        </button>
        <button
          className="btn-primary !px-2.5 !py-1.5"
          onClick={() => setAddLinkOpen(true)}
          title="New link (Ctrl+Shift+S)"
        >
          <Plus />
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>

      {/* Secondary toolbar */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-white/5 text-[11px] text-white/50">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white/70">
            {activeCollection
              ? `${activeCollection.icon} ${activeCollection.name}`
              : active === "pinned"
              ? "⭐ Pinned"
              : "🔗 All Links"}
          </span>
          <span className="rounded-md bg-white/5 px-1.5 py-0.5">
            {visibleLinks.length} / {totalLinks}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="icon-btn !h-7 !w-7"
            onClick={() => setCollModal({ mode: "create" })}
            title="New collection"
          >
            <Plus />
          </button>
          <button
            className="icon-btn !h-7 !w-7"
            onClick={handleExport}
            title="Export JSON"
          >
            <Download />
          </button>
          <button
            className="icon-btn !h-7 !w-7"
            onClick={() => fileInputRef.current?.click()}
            title="Import JSON"
          >
            <Upload />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        {!collapsedSidebar && (
          <aside className="w-[160px] shrink-0 border-r border-white/5 dark-scroll overflow-y-auto">
            <CollectionPanel
              collections={vault.collections}
              activeId={active}
              onSelect={setActive}
              onAddCollection={() => setCollModal({ mode: "create" })}
              onRename={(id) => setCollModal({ mode: "rename", id })}
              onDelete={(id) => deleteCollection(id)}
              onDropLink={(linkId, toId) => {
                const found = findLinkById(linkId);
                if (found) moveLink(linkId, found.collectionId, toId);
              }}
            />
          </aside>
        )}

        {/* Right panel */}
        <main className="flex-1 min-w-0 overflow-y-auto p-3 dark-scroll">
          {visibleLinks.length === 0 ? (
            <EmptyState
              query={query}
              onAddLink={() => setAddLinkOpen(true)}
              onAddCollection={() => setCollModal({ mode: "create" })}
              theme={vault.theme}
            />
          ) : (
            <div className="space-y-2">
              {visibleLinks.map(({ link, collectionId }) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  collectionId={collectionId}
                  onEdit={() => setEditingLink({ link, collectionId })}
                  onDelete={() => deleteLink(link.id, collectionId)}
                  onTogglePin={() => togglePin(link.id, collectionId)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/5 px-3 py-1.5 text-[10.5px] text-white/40">
        <span className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> LinkVault
        </span>
        <span>
          {vault.collections.length} collection
          {vault.collections.length === 1 ? "" : "s"} · stored in{" "}
          {typeof chrome !== "undefined" && chrome.runtime?.id
            ? "chrome.storage"
            : "localStorage"}
        </span>
      </div>

      {/* ===== Modals ===== */}
      {addLinkOpen && (
        <AddLinkModal
          mode="add"
          collections={vault.collections}
          initialCollectionId={
            active === "all" || active === "pinned" ? "" : active
          }
          onClose={() => setAddLinkOpen(false)}
          onSave={saveLink}
        />
      )}

      {editingLink && (
        <AddLinkModal
          mode="edit"
          collections={vault.collections}
          initialCollectionId={editingLink.collectionId}
          initialDraft={{
            id: editingLink.link.id,
            siteName: editingLink.link.siteName,
            url: editingLink.link.url,
            use: editingLink.link.use,
          }}
          onClose={() => setEditingLink(null)}
          onSave={saveLink}
        />
      )}

      {collModal?.mode === "create" && (
        <CollectionModal
          mode="create"
          onClose={() => setCollModal(null)}
          onSave={(name, color, icon) => {
            addCollection(name, color, icon);
            setCollModal(null);
          }}
        />
      )}
      {collModal?.mode === "rename" && (
        <CollectionModal
          mode="rename"
          initial={vault.collections.find((c) => c.id === collModal.id)}
          onClose={() => setCollModal(null)}
          onSave={(name, color, icon) => {
            renameCollection(collModal.id, name, color, icon);
            setCollModal(null);
          }}
        />
      )}

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          danger={confirm.danger}
          onCancel={() => setConfirm(null)}
          onConfirm={confirm.onConfirm}
        />
      )}

      {/* Toast */}
      {toastMsg && <div className="toast animate-pop">{toastMsg}</div>}
    </div>
  );
}

// ===== Empty state component =====
function EmptyState({ query, onAddLink, onAddCollection, theme }) {
  if (query) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center animate-fade">
        <div className="mb-2 text-3xl">🔍</div>
        <p className="text-[13px] font-medium">No matches for "{query}"</p>
        <p className="mt-1 text-[11.5px] text-white/50">
          Try a different search term.
        </p>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col items-center justify-center text-center px-4 animate-fade">
      <div
        className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background:
            theme === "dark"
              ? "rgba(124,58,237,0.15)"
              : "rgba(124,58,237,0.12)",
          border: "1px solid rgba(124,58,237,0.35)",
        }}
      >
        <Bookmarks className="h-6 w-6 text-violet-400" />
      </div>
      <p className="text-[13px] font-semibold">Your vault is empty</p>
      <p className="mt-1 text-[11.5px] leading-relaxed text-white/55 max-w-[240px]">
        Save the current tab with one click, or create a collection to organize
        your links.
      </p>
      <div className="mt-4 flex items-center gap-2">
        <button className="btn-primary" onClick={onAddLink}>
          <Plus /> Save current page
        </button>
        <button className="btn-ghost" onClick={onAddCollection}>
          New collection
        </button>
      </div>
      <p className="mt-4 text-[10.5px] text-white/40">
        Tip: press{" "}
        <kbd className="rounded bg-white/10 px-1 py-0.5 text-[10px]">
          Ctrl
        </kbd>
        +
        <kbd className="rounded bg-white/10 px-1 py-0.5 text-[10px]">
          Shift
        </kbd>
        +
        <kbd className="rounded bg-white/10 px-1 py-0.5 text-[10px]">S</kbd>{" "}
        to quick-save
      </p>
    </div>
  );
}
