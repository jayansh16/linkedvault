import { useState } from "react";
import { ChevronRight, Folder, Pencil, Plus, Trash, More } from "./Icons.jsx";

export function CollectionPanel({
  collections,
  activeId,
  onSelect,
  onAddCollection,
  onRename,
  onDelete,
  onDropLink,
}) {
  const [open, setOpen] = useState(true);
  const [menuFor, setMenuFor] = useState(null);

  const totalLinks = collections.reduce((s, c) => s + c.links.length, 0);
  const pinnedCount = collections.reduce(
    (s, c) => s + c.links.filter((l) => l.pinned).length,
    0
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-white/50 hover:text-white/80"
        >
          <span className={`chev ${open ? "open" : ""}`}>
            <ChevronRight />
          </span>
          Collections
        </button>
        <button
          onClick={onAddCollection}
          className="icon-btn"
          title="New collection"
        >
          <Plus />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <SidebarItem
          label="All Links"
          icon="🔗"
          color="#7C3AED"
          count={totalLinks}
          active={activeId === "all"}
          onClick={() => onSelect("all")}
        />
        <SidebarItem
          label="Pinned"
          icon="⭐"
          color="#F59E0B"
          count={pinnedCount}
          active={activeId === "pinned"}
          onClick={() => onSelect("pinned")}
        />

        {open && (
          <div className="mt-2 space-y-0.5 animate-slide-down">
            {collections.length === 0 && (
              <div className="px-3 py-4 text-center text-[12px] text-white/40">
                No collections yet.{" "}
                <button
                  onClick={onAddCollection}
                  className="text-violet-300 underline-offset-2 hover:underline"
                >
                  Create one
                </button>
              </div>
            )}
            {collections.map((c) => (
              <div key={c.id} className="relative">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add("drop-target");
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove("drop-target");
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("drop-target");
                    const linkId = e.dataTransfer.getData("text/link-id");
                    const fromColId = e.dataTransfer.getData(
                      "text/from-collection"
                    );
                    if (linkId && fromColId && fromColId !== c.id) {
                      onDropLink(linkId, c.id);
                    }
                  }}
                >
                  <SidebarItem
                    label={c.name}
                    icon={c.icon}
                    color={c.color}
                    count={c.links.length}
                    active={activeId === c.id}
                    onClick={() => onSelect(c.id)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setMenuFor(menuFor === c.id ? null : c.id);
                    }}
                    extra={
                      <button
                        className="icon-btn !h-6 !w-6 opacity-0 group-hover:opacity-100 data-[open=true]:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuFor(menuFor === c.id ? null : c.id);
                        }}
                        data-open={menuFor === c.id}
                      >
                        <More />
                      </button>
                    }
                  />
                </div>

                {menuFor === c.id && (
                  <div
                    className="absolute right-2 top-9 z-30 w-36 rounded-lg border border-white/10 bg-[#161622] p-1 text-[12.5px] shadow-xl animate-pop"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-white/80 hover:bg-white/10"
                      onClick={() => {
                        onRename(c.id);
                        setMenuFor(null);
                      }}
                    >
                      <Pencil /> Rename
                    </button>
                    <button
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-rose-400 hover:bg-rose-500/10"
                      onClick={() => {
                        onDelete(c.id);
                        setMenuFor(null);
                      }}
                    >
                      <Trash /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SidebarItem({
  label,
  icon,
  color,
  count,
  active,
  onClick,
  onContextMenu,
  extra,
}) {
  return (
    <div
      className={`col-row group ${active ? "active" : ""}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <span
        className="flex h-6 w-6 items-center justify-center rounded-md text-[13px]"
        style={{
          background: `${color}20`,
          border: `1px solid ${color}40`,
        }}
      >
        {icon === "📁" ? (
          <Folder style={{ color }} />
        ) : (
          <span>{icon}</span>
        )}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {extra}
      <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10.5px] font-medium text-white/50">
        {count}
      </span>
    </div>
  );
}
