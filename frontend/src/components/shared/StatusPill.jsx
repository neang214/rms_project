import { cn } from "@/lib/utils"

const STATUS_STYLES = {
  Pending:   { bg: "bg-[var(--color-border)]",   color: "text-[var(--color-text-secondary)]",   label: "Pending" },
  Preparing: { bg: "bg-[var(--color-accent-muted)]",  color: "text-[var(--color-warning)]",  label: "Preparing" },
  Ready:     { bg: "bg-[var(--color-info-muted)]",   color: "text-[var(--color-info)]",   label: "Ready" },
  Served:    { bg: "bg-[var(--color-primary-muted)]",  color: "text-[var(--color-primary)]",  label: "Served" },
  Paid:      { bg: "bg-[var(--color-primary-muted)]",  color: "text-[var(--color-primary)]",  label: "Paid" },
}
export function StatusPill({ status, className }) {
  const cfg = STATUS_STYLES[status] || STATUS_STYLES.Pending
  return (
    <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", cfg.bg, cfg.color, className)}>
      {cfg.label}
    </span>
  )
}
