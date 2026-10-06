import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export function Modal({ open, onClose, title, children, maxWidth = "max-w-xs" }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className={cn("bg-[var(--color-surface)] rounded-2xl shadow-2xl w-full border border-[var(--color-border)] overflow-hidden", maxWidth)}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
            <div className="font-semibold text-sm text-[var(--color-text)]">{title}</div>
            <button onClick={onClose} className="text-[var(--color-muted)] hover:text-[var(--color-text)]">
              <X size={16} />
            </button>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
