import { useState, useEffect } from "react"
import { ShoppingBag, Search, Eye, Users, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { isAllergyNote } from "@/lib/noteTags"
import { useOrderStore } from "../../context/orderContext"
import { useSocketRole, useSocketEvent } from "../../services/socket"
import { usePageTitle } from "../../hooks/usePageTitle"
import { useLang } from "@/i18n/LanguageContext"
import { PageHeader, StatsBar } from "@/components/shared"
import { orderTotal, statusConfig } from "@/components/cashier/orderHelpers"
import ViewOrderDialog from "@/components/cashier/ViewOrderDialog"

// Read-only version of the active-orders view: a server can check how an
// order they placed is progressing, but payment stays with the cashier,
// so there's no Pay action here (see ActiveOrdersTable for that version).
export default function ServerOrders() {
  const { t } = useLang()
  usePageTitle("Orders")
  const { orders, fetchOrders, isLoading } = useOrderStore()
  const [viewOrder, setViewOrder] = useState(null)
  const [search, setSearch] = useState("")

  useSocketRole("server")

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 60000)
    return () => clearInterval(interval)
  }, [])

  useSocketEvent("order:new", () => fetchOrders())
  useSocketEvent("order:status_changed", () => fetchOrders())
  useSocketEvent("order:deleted", () => fetchOrders())
  useSocketEvent("order_item:new", () => fetchOrders())
  useSocketEvent("order_item:status_changed", () => fetchOrders())
  useSocketEvent("payment:completed", () => fetchOrders())

  const activeOrders = orders.filter(o => !(o.is_paid ?? o.status === "Paid"))

  const searchQuery = search.trim().toLowerCase()
  const searchedOrders = searchQuery
    ? activeOrders.filter(o => String(o.table?.table_number ?? "").toLowerCase().includes(searchQuery))
    : activeOrders

  const stats = {
    active: activeOrders.length,
    pending: activeOrders.filter(o => o.status === "Pending").length,
    cooking: activeOrders.filter(o => o.status === "Preparing").length,
    ready: activeOrders.filter(o => o.status === "Served").length,
  }

  const grouped = {
    Served: searchedOrders.filter(o => o.status === "Served"),
    Preparing: searchedOrders.filter(o => o.status === "Preparing"),
    Pending: searchedOrders.filter(o => o.status === "Pending"),
  }

  const sectionConfig = [
    { key: "Served", label: t("cashier.readyForPayment"), accent: "text-[var(--color-primary)]", bar: "bg-[var(--color-primary)]" },
    { key: "Preparing", label: t("cashier.beingPrepared"), accent: "text-[var(--color-warning)]", bar: "bg-[var(--color-warning)]/80" },
    { key: "Pending", label: t("cashier.newOrders"), accent: "text-[var(--color-text-secondary)]", bar: "bg-[var(--color-muted)]" },
  ]

  return (
    <div className="space-y-4">
      <PageHeader icon={ShoppingBag} title={t("nav.orders")} subtitle={`• ${stats.active} active`} />

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Find by table #"
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </div>

      <StatsBar columns={3} stats={[
        { label: t("cashier.statActive"), value: stats.active, color: "text-[var(--color-primary)]", bg: "bg-[var(--color-primary-muted)]" },
        { label: t("status.cooking"), value: stats.cooking, color: "text-[var(--color-flame)]", bg: "bg-[var(--color-flame-muted)]" },
        { label: t("status.ready"), value: stats.ready, color: "text-[var(--color-primary)]", bg: "bg-[var(--color-primary-muted)]" },
      ]} />

      {isLoading && activeOrders.length === 0 ? (
        <div className="text-center py-16 text-[var(--color-muted)] text-sm">Loading orders...</div>
      ) : activeOrders.length === 0 ? (
        <div className="text-center py-16 text-[var(--color-muted)] text-sm">No active orders.</div>
      ) : searchQuery && searchedOrders.length === 0 ? (
        <div className="text-center py-16 text-[var(--color-muted)] text-sm">No active order matches "{searchQuery}".</div>
      ) : (
        sectionConfig.map(({ key, label, accent, bar }) => (
          grouped[key].length > 0 && (
            <div key={key}>
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("w-1 h-5 rounded-full", bar)} />
                <div className={cn("font-semibold text-sm", accent)}>{label}</div>
              </div>
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {grouped[key].map(order => {
                      const cfg = statusConfig[order.status] || statusConfig.Pending
                      const itemCount = order.order_items?.reduce((s, oi) => s + oi.quantity, 0) || 0
                      const hasAllergy = order.order_items?.some(oi => isAllergyNote(oi.note))
                      return (
                        <tr key={order.order_id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-primary-muted)]/40 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-[var(--color-text)]">#{String(order.order_id).padStart(4, "0")}</span>
                              {hasAllergy && <AlertTriangle size={12} className="text-[var(--color-danger)]" />}
                            </div>
                            <div className="text-[10px] text-[var(--color-muted)]">{new Date(order.order_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                          </td>
                          <td className="py-3 px-3 text-sm text-[var(--color-text)]">
                            {order.table?.table_number}
                            {order.party_size != null && (
                              <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] text-[var(--color-muted)]"><Users size={10} /> {order.party_size}</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-sm text-[var(--color-muted)]">{itemCount} item{itemCount !== 1 ? "s" : ""}</td>
                          <td className="py-3 px-3"><span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", cfg.color)}>{t(cfg.labelKey)}</span></td>
                          <td className="py-3 px-3 text-sm font-bold text-[var(--color-text)] text-right">${orderTotal(order).toFixed(2)}</td>
                          <td className="py-3 px-3 text-right">
                            <button onClick={() => setViewOrder(order)} title={t("cashier.viewDetails")}
                              className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)] transition-colors">
                              <Eye size={15} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ))
      )}

      <ViewOrderDialog order={viewOrder} onClose={() => setViewOrder(null)} />
    </div>
  )
}
