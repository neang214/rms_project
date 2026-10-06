import { UserCheck, Check, X } from "lucide-react"
import { orderTotal } from "./orderHelpers"

export default function UnconfirmedCard({ order, onConfirm, onReject, busy }) {
  const total = orderTotal(order)
  return (
    <div className="bg-[var(--color-accent-muted)] border-2 border-[var(--color-warning)]/35 rounded-2xl overflow-hidden">
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <UserCheck size={12} className="text-[var(--color-warning)]" />
              <span className="text-[10px] font-bold text-[var(--color-warning)] uppercase tracking-wide">New Guest Order</span>
            </div>
            <div className="text-xs font-semibold text-[var(--color-text)] mt-0.5">Order#{String(order.order_id).padStart(4, "0")}</div>
            <div className="text-[10px] text-[var(--color-muted)]">{new Date(order.order_date).toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[var(--color-muted)]">Table: {order.table?.table_number}</div>
            <div className="text-sm font-bold text-[var(--color-text)]">${total.toFixed(2)}</div>
          </div>
        </div>
        {order.order_items?.map((oi) => (
          <div key={oi.order_item_id} className="flex gap-2 mb-1.5">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-[var(--color-text)] truncate">{oi.menu_item?.item_name}</div>
              <div className="flex justify-between text-[10px] mt-0.5">
                <span>${Number(oi.unit_price).toFixed(2)}</span>
                <span className="text-[var(--color-muted)]">Qty: {oi.quantity}</span>
              </div>
            </div>
          </div>
        ))}
        <p className="text-[10px] text-[var(--color-warning)] mt-2 mb-2">Check that table {order.table?.table_number} actually has a customer before approving.</p>
        <div className="flex gap-1.5">
          <button onClick={() => onReject(order)} disabled={busy} className="flex-1 flex items-center justify-center gap-1.5 border border-[var(--color-danger)]/35 text-[var(--color-danger)] text-xs font-semibold py-2.5 rounded-xl active:bg-[var(--color-danger-muted)] transition-colors disabled:opacity-60 min-h-[40px]">
            <X size={14} /> Reject
          </button>
          <button onClick={() => onConfirm(order)} disabled={busy} className="flex-1 flex items-center justify-center gap-1.5 bg-[var(--color-primary)] text-white text-xs font-semibold py-2.5 rounded-xl active:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-60 min-h-[40px]">
            <Check size={14} /> Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
