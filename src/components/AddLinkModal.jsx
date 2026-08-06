import { useEffect, useRef, useState } from "react";
import { getFavicon, normalizeUrl, hostnameOf } from "../utils/storage.js";
import { getCurrentTabInfo } from "../utils/currentUrl.js";
import { X } from "./Icons.jsx";

export function AddLinkModal({
  mode,
  collections,
  initialCollectionId,
  initialDraft,
  onClose,
  onSave,
}) {
  const [draft, setDraft] = useState(
    initialDraft || { siteName: "", url: "", use: "" }
  );
  const [collectionId, setCollectionId] = useState(
    initialCollectionId === "all" || initialCollectionId === "pinned"
      ? (collections[0]?.id || "")
      : (initialCollectionId || collections[0]?.id || "")
  );
  const [autoFilled, setAutoFilled] = useState(false);
  const firstInput = useRef(null);

  // Auto-capture current tab URL when adding (only once)
  useEffect(() => {
    if (mode === "add" && !autoFilled) {
      let cancelled = false;
      (async () => {
        const info = await getCurrentTabInfo();
        if (cancelled) return;
        setDraft((d) => ({
          siteName:
            d.siteName ||
            (info.title ? info.title : hostnameOf(info.url || "")),
          url: d.url || info.url || "",
          use: d.use || "",
          id: d.id,
        }));
        setAutoFilled(true);
      })();
      return () => {
        cancelled = true;
      };
    }
  }, [mode, autoFilled]);

  useEffect(() => {
    firstInput.current?.focus();
    firstInput.current?.select();
  }, []);

  // When URL changes, update siteName if it's empty
  useEffect(() => {
    if (!draft.siteName && draft.url) {
      setDraft((d) => ({ ...d, siteName: hostnameOf(d.url) }));
    }
  }, [draft.url, draft.siteName]);

  function handleSubmit(e) {
    e.preventDefault();
    const cleanedUrl = normalizeUrl(draft.url);
    if (!cleanedUrl) return;
    onSave(
      {
        ...draft,
        url: cleanedUrl,
        siteName: draft.siteName.trim() || hostnameOf(cleanedUrl),
        use: draft.use.trim(),
      },
      collectionId
    );
  }

  const previewFavicon = draft.url ? getFavicon(draft.url) : "";

  return (
    <div className="modal-backdrop animate-fade" onClick={onClose}>
      <div
        className="w-full max-w-[340px] rounded-2xl border border-white/10 bg-[#12121d] p-4 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="favicon">
              {previewFavicon ? (
                <img src={previewFavicon} alt="" />
              ) : (
                <span className="text-[14px]">🔗</span>
              )}
            </div>
            <h2 className="text-[14px] font-semibold">
              {mode === "add" ? "Save link to Vault" : "Edit link"}
            </h2>
          </div>
          <button className="icon-btn" onClick={onClose} title="Close">
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-white/60">
              Site Name
            </label>
            <input
              ref={firstInput}
              className="input-base"
              placeholder="Best CSS Reference"
              value={draft.siteName}
              onChange={(e) =>
                setDraft({ ...draft, siteName: e.target.value })
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-white/60">
              URL
            </label>
            <input
              className="input-base"
              placeholder="https://example.com"
              value={draft.url}
              onChange={(e) => setDraft({ ...draft, url: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-white/60">
              Use / Notes
            </label>
            <textarea
              className="input-base min-h-[60px] resize-none"
              placeholder="What's this for? (e.g. flexbox reference)"
              value={draft.use}
              onChange={(e) => setDraft({ ...draft, use: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-white/60">
              Collection
            </label>
            <select
              className="input-base"
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
            >
              {collections.length === 0 && (
                <option value="">(no collections yet — Unsorted)</option>
              )}
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              className="btn-ghost"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!draft.url.trim() || (collections.length > 0 && !collectionId)}
            >
              {mode === "add" ? "Save Link" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
