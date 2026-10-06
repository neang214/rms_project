import { cn } from "@/lib/utils"

export function SectionTitle({ label, sub, accent = "text-[var(--color-primary)]", bar = "bg-[var(--color-primary)]" }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={cn("w-1 h-5 rounded-full", bar)} />
      <div>
        <div className={cn("font-semibold text-sm", accent)}>{label}</div>
        {sub && <div className="text-[10px] text-[var(--color-muted)]">{sub}</div>}
      </div>
    </div>
  )
}
