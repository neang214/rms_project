import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui"
import { Users, AlertTriangle } from "lucide-react"
import { cn, menuItemName } from "@/lib/utils"
import { isAllergyNote } from "@/lib/noteTags"
import { orderTotal } from "./orderHelpers"
import { useLang } from "@/i18n/LanguageContext"

export default function ViewOrderDialog({ order, onClose }) {
  const { t, lang } = useLang()
  return (
    <Dialog open={!!order} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        {order && (
          <>
            <DialogHeader>
              <DialogTitle>Order#{String(order.order_id).padStart(4, "0")}</DialogTitle>
              <DialogDescription>{t("common.table")} {order.table?.table_number} · {new Date(order.order_date).toLocaleString()}</DialogDescription>
            </DialogHeader>
            {(order.party_size != null || order.note) && (
              <div className="flex flex-wrap gap-1.5 -mt-1">
                {order.party_size != null && (
                  <span className="flex items-center gap-1 text-[10px] bg-[var(--color-info-muted)] text-[var(--color-info)] border border-[var(--color-info)]/25 px-2 py-0.5 rounded-full font-medium">
                    <Users size={10} /> {order.party_size} guest{order.party_size !== 1 ? "s" : ""}
                  </span>
                )}
                {order.note && (
                  <span className="text-[10px] bg-[var(--color-accent-muted)] text-[var(--color-warning)] border border-[var(--color-warning)]/25 px-2 py-0.5 rounded-full font-medium">📝 {order.note}</span>
                )}
              </div>
            )}
            <div className="space-y-2">
              {order.order_items?.map(oi => (
                <div key={oi.order_item_id} className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text)]">{menuItemName(oi.menu_item, lang)} <span className="text-[var(--color-muted)]">x{oi.quantity}</span></span>
                    <span className="font-medium">${(Number(oi.unit_price) * oi.quantity).toFixed(2)}</span>
                  </div>
                  {oi.note && (
                    <div className={cn(
                      "flex items-center gap-1 text-[10px] font-medium mt-0.5 px-1.5 py-0.5 rounded-full w-fit",
                      isAllergyNote(oi.note) ? "bg-[var(--color-danger-muted)] text-[var(--color-danger)] border border-[var(--color-danger)]/25" : "bg-[var(--color-accent-muted)] text-[var(--color-warning)] border border-[var(--color-warning)]/25"
                    )}>
                      {isAllergyNote(oi.note) && <AlertTriangle size={9} />}
                      {oi.note}
                    </div>
                  )}
                </div>
              ))}
              <div className="border-t border-[var(--color-border)] pt-2 flex justify-between font-bold text-[var(--color-primary)]">
                <span>{t("common.total")}</span>
                <span>${orderTotal(order).toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
