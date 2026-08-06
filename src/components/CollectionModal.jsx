import { useEffect, useRef, useState } from "react";
import { COLLECTION_COLORS, COLLECTION_ICONS } from "../utils/constants.js";
import { X } from "./Icons.jsx";

export function CollectionModal({ mode, initial, onClose, onSave }) {
  const [name, setName] = useState(initial?.name || "");
  const [color, setColor] = useState(initial?.color || COLLECTION_COLORS[0].value);
  const [icon, setIcon] = useState(initial?.icon || COLLECTION_ICONS[0]);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), color, icon);
  }

  return (
    <div className="modal-backdrop animate-fade" onClick={onClose}>
      <div
        className="w-full max-w-[320px] rounded-2xl border border-white/10 bg-[#12121d] p-4 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[14px] font-semibold">
            {mode === "create" ? "New Collection" : "Rename Collection"}
          </h2>
          <button className="icon-btn" onClick={onClose} title="Close">
            <X />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-white/60">
              Name
            </label>
            <input
              ref={inputRef}
              className="input-base"
              placeholder="Dev Resources"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-white/60">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLLECTION_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`swatch ${color === c.value ? "selected" : ""}`}
                  style={{ background: c.value }}
                  onClick={() => setColor(c.value)}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-white/60">
              Icon
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COLLECTION_ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-[14px] transition ${
                    icon === i
                      ? "bg-white/10 ring-1 ring-white/30"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!name.trim()}>
              {mode === "create" ? "Create" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
