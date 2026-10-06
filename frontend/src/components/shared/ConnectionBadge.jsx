import { cn } from "@/lib/utils"

export function ConnectionBadge({ connected, WifiIcon, WifiOffIcon }) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1.5 rounded-full",
      connected ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)]" : "bg-[var(--color-danger-muted)] text-[var(--color-danger)]"
    )}>
      {connected ? (WifiIcon && <WifiIcon size={11} />) : (WifiOffIcon && <WifiOffIcon size={11} />)}
      {connected ? "Live" : "Reconnecting..."}
    </div>
  )
}
