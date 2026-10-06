export function LoadingState({ text = "Loading..." }) {
  return <div className="text-center py-16 text-[var(--color-muted)] text-sm">{text}</div>
}

export function EmptyState({ icon: Icon, text }) {
  return (
    <div className="text-center py-16">
      {Icon && <Icon size={36} className="text-[var(--color-muted)] mx-auto mb-3" />}
      <p className="text-sm text-[var(--color-muted)]">{text}</p>
    </div>
  )
}
