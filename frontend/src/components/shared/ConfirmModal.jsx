import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { Modal } from "./Modal"

export function ConfirmModal({
  open, onClose, onConfirm, title = "Are you sure?", message,
  confirmLabel = "Confirm", cancelLabel = "Cancel", danger = false, busy = false, errorMsg = null,
}) {
  return (
    <Modal open={open} onClose={busy ? undefined : onClose} title={title}>
      {message && <p className="text-sm text-[var(--color-text-secondary)] mb-4">{message}</p>}
      {errorMsg && (
        <div className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-muted)] border border-[var(--color-danger)]/25 rounded-xl px-3 py-2 mb-4">{errorMsg}</div>
      )}
      <div className="flex gap-2">
        <button
          onClick={onClose}
          disabled={busy}
          className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-muted)] transition-colors disabled:opacity-60 min-h-[44px]"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={busy}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60 min-h-[44px]",
            danger ? "bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90" : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
          )}
        >
          {busy && <Loader2 size={14} className="animate-spin" />}
          {busy ? "Please wait..." : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
