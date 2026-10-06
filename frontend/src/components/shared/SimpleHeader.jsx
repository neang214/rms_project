export function SimpleHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 className="text-2xl font-display font-bold text-[var(--color-text)]">{title}</h1>
        {subtitle && <p className="text-sm text-[var(--color-muted)] mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
