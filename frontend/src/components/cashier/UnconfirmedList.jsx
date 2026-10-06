import { UserCheck, Check, X } from "lucide-react"
import { menuItemName } from "@/lib/utils"
import { orderTotal } from "./orderHelpers"
import { useLang } from "@/i18n/LanguageContext"

export default function UnconfirmedList({ orders, onConfirm, onReject, busyId }) {
  const { t, lang } = useLang()
  return (
    <div className="border-2 border-[var(--color-warning)]/35 rounded-2xl overflow-hidden divide-y divide-amber-200">
      {orders.map(order => {
        const total = orderTotal(order)
        const busy = busyId === order.order_id
        const itemSummary = order.order_items
          ?.map(oi => `${oi.quantity}× ${menuItemName(oi.menu_item, lang)}`)
          .join(" · ")
        return (
          <div key={order.order_id} className="bg-[var(--color-accent-muted)] px-3 py-2.5 flex items-center gap-3 flex-wrap">
            {}
            <div className="min-w-[130px]">
              <div className="flex items-center gap-1.5">
                <UserCheck size={12} className="text-[var(--color-warning)]" />
                <span className="text-xs font-semibold text-[var(--color-text)]">Order#{String(order.order_id).padStart(4, "0")}</span>
              </div>
              <div className="text-[10px] text-[var(--color-muted)]">
                Table {order.table?.table_number} · {new Date(order.order_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>

            {}
            <div className="flex-1 min-w-[160px] text-xs text-[var(--color-text-secondary)] line-clamp-2">
              {itemSummary}
            </div>

            {}
            <div className="text-sm font-bold text-[var(--color-text)] w-16 text-right">${total.toFixed(2)}</div>

            {}
            <div className="flex gap-1.5">
              <button onClick={() => onReject(order)} disabled={busy}
                className="flex items-center justify-center gap-1 border border-[var(--color-danger)]/35 text-[var(--color-danger)] text-xs font-semibold px-3 py-2 rounded-lg active:bg-[var(--color-danger-muted)] transition-colors disabled:opacity-60 min-h-[38px]">
                <X size={13} /> {t("cashier.reject")}
              </button>
              <button onClick={() => onConfirm(order)} disabled={busy}
                className="flex items-center justify-center gap-1 bg-[var(--color-primary)] text-white text-xs font-semibold px-3 py-2 rounded-lg active:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-60 min-h-[38px]">
                <Check size={13} /> {t("cashier.confirm")}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
