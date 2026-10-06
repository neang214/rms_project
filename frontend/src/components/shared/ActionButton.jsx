import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export function ActionButton({
  children, onClick, variant = "primary", icon: Icon, loading = false,
  disabled = false, className, type = "button",
}) {
  const variants = {
    primary:   "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]",
    secondary: "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-muted)]",
    danger:    "border border-[var(--color-danger)]/35 text-[var(--color-danger)] hover:bg-[var(--color-danger-muted)]",
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60 min-h-[44px]",
        variants[variant], className
      )}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : Icon && <Icon size={14} />}
      {children}
    </button>
  )
}
