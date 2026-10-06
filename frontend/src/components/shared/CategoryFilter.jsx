import { cn } from "@/lib/utils"

export default function CategoryFilter({ categories, active, onChange, toggle = false, size = "sm", variant = "cashier" }) {
  const pad = size === "md" ? "px-4" : "px-3"
  
  const inactive = variant === "surface"
    ? "border-[var(--color-border)] text-[var(--color-text-secondary)] bg-[var(--color-surface)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
    : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]"
  const pill = (selected) =>
    cn(
      pad, "py-1.5 rounded-full text-sm font-medium border transition-all",
      selected ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" : inactive
    )

  return (
    <div className="flex gap-2 flex-wrap">
      <button onClick={() => onChange("All")} className={pill(active === "All")}>All</button>
      {categories.map(cat => (
        <button
          key={cat.category_id}
          onClick={() => onChange(toggle && active === cat.category_id ? "All" : cat.category_id)}
          className={pill(active === cat.category_id)}
        >
          {cat.category_name}
        </button>
      ))}
    </div>
  )
}
