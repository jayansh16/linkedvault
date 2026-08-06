import { hostnameOf, truncate } from "../utils/storage.js";
import { Pencil, Star, Trash } from "./Icons.jsx";

export function LinkCard({ link, collectionId, onEdit, onDelete, onTogglePin }) {
  return (
    <div
      className={`glass-card group relative flex items-start gap-2.5 rounded-xl p-2.5 animate-pop ${
        link.pinned ? "pinned-glow" : ""
      }`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/link-id", link.id);
        e.dataTransfer.setData("text/from-collection", collectionId);
        e.currentTarget.classList.add("dragging");
      }}
      onDragEnd={(e) => {
        e.currentTarget.classList.remove("dragging");
      }}
    >
      <div className="favicon mt-0.5">
        <img
          src={link.favicon}
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer noopener"
              className="block truncate text-[13px] font-semibold text-white hover:underline"
              title={link.siteName}
            >
              {link.siteName || hostnameOf(link.url)}
            </a>
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer noopener"
              className="block truncate text-[11px] text-violet-300/80 hover:text-violet-200"
              title={link.url}
            >
              {truncate(hostnameOf(link.url), 38)}
            </a>
          </div>
          <div className="flex shrink-0 items-center">
            <button
              className={`icon-btn ${link.pinned ? "text-amber-400" : ""}`}
              onClick={onTogglePin}
              title={link.pinned ? "Unpin" : "Pin"}
            >
              <Star filled={link.pinned} />
            </button>
            <button
              className="icon-btn"
              onClick={onEdit}
              title="Edit"
            >
              <Pencil />
            </button>
            <button
              className="icon-btn hover:!text-rose-400"
              onClick={onDelete}
              title="Delete"
            >
              <Trash />
            </button>
          </div>
        </div>
        {link.use && (
          <p className="mt-1 text-[11.5px] leading-snug text-white/55">
            {link.use}
          </p>
        )}
      </div>
    </div>
  );
}
