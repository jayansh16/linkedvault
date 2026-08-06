import { useEffect, useRef } from "react";
import { Trash, X } from "./Icons.jsx";

export function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  danger,
  onCancel,
  onConfirm,
}) {
  const cancelRef = useRef(null);
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  return (
    <div className="modal-backdrop animate-fade" onClick={onCancel}>
      <div
        className="w-full max-w-[300px] rounded-2xl border border-white/10 bg-[#12121d] p-4 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{
                background: danger
                  ? "rgba(244, 63, 94, 0.15)"
                  : "rgba(124,58,237,0.15)",
                color: danger ? "#fb7185" : "#c4b5fd",
              }}
            >
              <Trash />
            </div>
            <h2 className="text-[14px] font-semibold">{title}</h2>
          </div>
          <button className="icon-btn" onClick={onCancel} title="Close">
            <X />
          </button>
        </div>
        <p className="mb-4 text-[12.5px] leading-relaxed text-white/70">
          {message}
        </p>
        <div className="flex items-center justify-end gap-2">
          <button
            ref={cancelRef}
            className="btn-ghost"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className={danger ? "btn-primary !bg-rose-500" : "btn-primary"}
            onClick={onConfirm}
            style={
              danger
                ? {
                    background: "linear-gradient(135deg,#f43f5e,#e11d48)",
                    boxShadow: "0 6px 20px -6px rgba(244,63,94,0.5)",
                  }
                : undefined
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
