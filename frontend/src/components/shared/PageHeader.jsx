import { cn } from "@/lib/utils"

export function PageHeader({ icon: Icon, title, subtitle, right, size = "md" }) {
  const isLg = size === "lg"
  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-3">
        <div className={cn(
          "rounded-xl bg-[var(--color-primary-muted)] flex items-center justify-center shrink-0",
          isLg ? "w-11 h-11" : "w-9 h-9"
        )}>
          {Icon && <Icon size={isLg ? 22 : 18} className="text-[var(--color-primary)]" />}
        </div>
        <div>
          <h1 className={cn(
            "font-display font-bold text-[var(--color-text)]",
            isLg ? "text-2xl" : "text-xl"
          )}>{title}</h1>
          {subtitle && <p className="text-xs text-[var(--color-muted)]">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  )
}
