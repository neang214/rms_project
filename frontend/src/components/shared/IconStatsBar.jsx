import { cn } from "@/lib/utils"

export function IconStatsBar({ stats, columns = 2 }) {
  const colClass = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" }[columns] || "grid-cols-2"
  return (
    <div className={cn("grid gap-3", colClass)}>
      {stats.map(({ label, value, icon: Icon, bg, text, iconBg }) => (
        <div key={label} className={cn("rounded-2xl p-4 flex items-center gap-3", bg)}>
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
            {Icon && <Icon size={17} className={text} />}
          </div>
          <div>
            <div className={cn("text-2xl font-bold", text)}>{value}</div>
            <div className="text-[10px] text-[var(--color-muted)]">{label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
