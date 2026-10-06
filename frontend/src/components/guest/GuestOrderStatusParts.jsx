import { ArrowLeft, Clock, Flame, CheckCircle2, CreditCard, RefreshCw } from "lucide-react"
import { cn, imageUrl, menuItemName } from "@/lib/utils"
import { useLang } from "@/i18n/LanguageContext"
import LanguageSwitcher from "@/components/LanguageSwitcher"

const FALLBACK_IMG = "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop"

export const statusSteps = ["Pending", "Preparing", "Served", "Paid"]

const statusMeta = {
  Pending:   { key: "guest.statusReceived",  icon: Clock,        color: "text-[var(--color-text-secondary)]",  bg: "bg-[var(--color-border)]" },
  Preparing: { key: "guest.statusPreparing", icon: Flame,        color: "text-[var(--color-warning)]", bg: "bg-[var(--color-accent-muted)]" },
  Served:    { key: "guest.statusServed",    icon: CheckCircle2, color: "text-[var(--color-primary)]", bg: "bg-[var(--color-primary-muted)]" },
  Paid:      { key: "guest.statusPaid",      icon: CreditCard,   color: "text-[var(--color-plum)]", bg: "bg-[var(--color-plum-muted)]" },
}

export function StatusHeader({ table, token, navigate }) {
  const { t } = useLang()
  return (
    <div className="sticky top-0 z-20 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between gap-2">
      <button onClick={() => navigate(`/order?t=${token}`)} className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
        <ArrowLeft size={16} /> {t("guest.backToMenu")}
      </button>
      <div className="flex items-center gap-3">
        <LanguageSwitcher langs={["en", "km"]} showIcon={false} />
        <div className="text-right">
          <div className="text-xs text-[var(--color-muted)]">{t("guest.table")}</div>
          <div className="font-bold text-sm text-[var(--color-primary)]">{table?.table_number || "..."}</div>
        </div>
      </div>
    </div>
  )
}

export function StatusContent({ loading, order, token, navigate, statusKey, currentStepIndex, itemTotal, totalKHR, onRefresh }) {
  const { t, lang } = useLang()
  const meta = statusMeta[statusKey] || statusMeta.Pending
  const StatusIcon = meta.icon
  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      {loading ? (
        <div className="text-center py-16 text-[var(--color-muted)] text-sm">{t("guest.loadingOrder")}</div>
      ) : !order ? (
        <div className="text-center py-16">
          <p className="text-sm text-[var(--color-muted)] mb-4">{t("guest.noActiveOrder")}</p>
          <button onClick={() => navigate(`/order?t=${token}`)} className="bg-[var(--color-primary)] text-white text-sm font-medium px-4 py-2.5 rounded-xl">
            {t("guest.browseMenu")}
          </button>
        </div>
      ) : (
        <>
          {}
          <div className={cn("rounded-2xl p-4 flex items-center gap-3", meta.bg)}>
            <div className="w-11 h-11 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
              <StatusIcon size={22} className={meta.color} />
            </div>
            <div className="flex-1">
              <div className={cn("font-semibold text-sm", meta.color)}>{t(meta.key)}</div>
              <div className="text-xs text-[var(--color-muted)]">{t("guest.yourOrder")} #{String(order.order_id).padStart(4, "0")}</div>
            </div>
            {order.queue_number != null && (
              <div className="text-center shrink-0">
                <div className="text-[10px] text-[var(--color-muted)] uppercase tracking-wide">{t("guest.waitingNumber")}</div>
                <div className={cn("text-xl font-bold", meta.color)}>#{order.queue_number}</div>
              </div>
            )}
          </div>

          {}
          <div className="flex items-start px-1">
            {statusSteps.map((step, idx) => {
              const done = idx <= currentStepIndex
              return (
                <div key={step} className="flex-1 flex flex-col items-center relative">
                  {}
                  {idx < statusSteps.length - 1 && (
                    <div className={cn(
                      "absolute top-[7px] left-1/2 w-full h-0.5",
                      idx < currentStepIndex ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"
                    )} />
                  )}
                  {}
                  <div className={cn(
                    "relative z-10 w-4 h-4 rounded-full border-2 transition-colors",
                    done
                      ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
                      : "bg-[var(--color-surface)] border-[var(--color-border)]",
                    idx === currentStepIndex && "ring-4 ring-[var(--color-primary-muted)]"
                  )} />
                  {}
                  <span className={cn(
                    "mt-2 text-[10px] text-center leading-tight",
                    done ? "text-[var(--color-primary)] font-medium" : "text-[var(--color-muted)]"
                  )}>
                    {t(statusMeta[step].key)}
                  </span>
                </div>
              )
            })}
          </div>

          {}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4">
            <div className="font-semibold text-sm text-[var(--color-text)] mb-3">{t("guest.yourOrder")}</div>
            <div className="space-y-3">
              {order.order_items?.map(oi => (
                <div key={oi.order_item_id} className="flex items-center gap-3">
                  <img src={imageUrl(oi.menu_item?.image_url, FALLBACK_IMG)} alt={menuItemName(oi.menu_item, lang)} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--color-text)] truncate">{menuItemName(oi.menu_item, lang)}</div>
                    <div className="text-xs text-[var(--color-muted)]">${Number(oi.unit_price).toFixed(2)} × {oi.quantity}</div>
                  </div>
                  <div className="text-sm font-semibold text-[var(--color-text)]">${(Number(oi.unit_price) * oi.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-[var(--color-border)] mt-3 pt-3 flex justify-between text-sm font-bold">
              <span className="text-[var(--color-text)]">{t("common.total")}</span>
              <span className="text-[var(--color-primary)]">${itemTotal.toFixed(2)} <span className="text-xs font-normal text-[var(--color-muted)]">៛{totalKHR.toLocaleString()}</span></span>
            </div>
          </div>

          <button onClick={onRefresh} className="w-full flex items-center justify-center gap-2 text-xs text-[var(--color-muted)] py-2">
            <RefreshCw size={12} /> {t("guest.refresh")}
          </button>
        </>
      )}
    </div>
  )
}
