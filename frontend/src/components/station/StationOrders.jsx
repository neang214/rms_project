import { useState, useEffect } from "react"
import { Clock, Flame, Wifi, WifiOff, Users, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"
import { cn, menuItemName } from "@/lib/utils"
import { useOrderItemStore } from "../../context/orderItemContext"
import { useSocketRole, useSocketEvent } from "../../services/socket"
import { usePageTitle } from "../../hooks/usePageTitle"
import { ConnectionBadge, IconStatsBar } from "@/components/shared"
import { isAllergyNote } from "@/lib/noteTags"
import { useLang } from "@/i18n/LanguageContext"

function groupByOrder(items) {
  const map = new Map()
  for (const oi of items) {
    const orderId = oi.order?.order_id
    if (!map.has(orderId)) {
      map.set(orderId, {
        order_id: orderId,
        queue_number: oi.order?.queue_number,
        party_size: oi.order?.party_size,
        table_number: oi.order?.table?.table_number || "—",
        order_date: oi.order?.order_date,
        note: oi.order?.note,
        items: [],
      })
    }
    map.get(orderId).items.push(oi)
  }
  return Array.from(map.values())
}

function groupByTable(orders) {
  const map = new Map()
  for (const order of orders) {
    if (!map.has(order.table_number)) map.set(order.table_number, [])
    map.get(order.table_number).push(order)
  }
  
  for (const list of map.values()) {
    list.sort((a, b) => new Date(a.order_date) - new Date(b.order_date))
  }
  return Array.from(map.entries()).map(([table_number, tableOrders]) => ({ table_number, orders: tableOrders }))
}

export default function StationOrders({ config }) {
  const { t, lang } = useLang()
  usePageTitle(t(config.pageTitleKey))
  const store = useOrderItemStore()
  const queue = store[config.queueKey]
  const fetchQueue = store[config.fetchKey]
  const { updateItemStatus, isLoading } = store

  const [filter, setFilter] = useState("all")
  const [newOrderIds, setNewOrderIds] = useState(new Set())
  
  
  
  const [expandedIds, setExpandedIds] = useState(new Set())
  const toggleExpanded = (orderId) => setExpandedIds(prev => {
    const next = new Set(prev)
    if (next.has(orderId)) next.delete(orderId)
    else next.add(orderId)
    return next
  })

  
  const { connected } = useSocketRole(config.role)

  const filterTabs = [
    { label: t("station.allOrders"), key: "all", icon: config.icons.all },
    { label: t("status.pending"), key: "Pending", icon: Clock },
    { label: t("status.preparing"), key: "Preparing", icon: Flame },
  ]

  const statusCfg = {
    Pending:   { label: "Pending", color: "bg-[var(--color-border)] text-[var(--color-text-secondary)] dark:bg-[var(--color-border-strong)]", actionLabel: t(config.labels.startActionKey), actionColor: "bg-[var(--color-accent-muted)] border border-[var(--color-warning)]/25 text-[var(--color-warning)] active:bg-[var(--color-accent-muted)]", nextStatus: "Preparing", icon: Clock },
    Preparing: { label: t(config.labels.preparingKey), color: "bg-[var(--color-accent-muted)] text-[var(--color-warning)]", actionLabel: t("station.markReady"), actionColor: "bg-[var(--color-primary)] text-white active:bg-[var(--color-primary-dark)]", nextStatus: "Ready", icon: Flame },
  }

  
  
  useEffect(() => {
    fetchQueue()
    const interval = setInterval(() => fetchQueue(), 60000)
    return () => clearInterval(interval)
    
  }, [])

  
  
  const flagNew = (orderId) => {
    if (!orderId) return
    setNewOrderIds(prev => new Set(prev).add(orderId))
    setExpandedIds(prev => new Set(prev).add(orderId))
    setTimeout(() => {
      setNewOrderIds(prev => {
        const next = new Set(prev)
        next.delete(orderId)
        return next
      })
    }, 8000)
  }

  useSocketEvent("order:new", (order) => {
    flagNew(order?.order_id)
    fetchQueue()
  })
  useSocketEvent("order_item:new", (item) => {
    flagNew(item?.order?.order_id)
    fetchQueue()
  })
  useSocketEvent("order_item:status_changed", () => fetchQueue())
  useSocketEvent("order:deleted", () => fetchQueue())

  const filteredQueue = filter === "all" ? queue : queue.filter(i => i.status === filter)
  const orders = groupByOrder(filteredQueue)
  const tableGroups = groupByTable(orders)

  const stats = {
    pending: queue.filter(i => i.status === "Pending").length,
    preparing: queue.filter(i => i.status === "Preparing").length,
  }

  
  const orderStatus = (order) => {
    if (order.items.some(i => i.status === "Pending")) return "Pending"
    return "Preparing"
  }

  const advance = async (order) => {
    const current = orderStatus(order)
    const next = statusCfg[current]?.nextStatus
    if (!next) return
    const itemsToUpdate = order.items.filter(i => i.status === current)
    await Promise.all(itemsToUpdate.map(i => updateItemStatus(i.order_item_id, next)))
    fetchQueue()
  }

  const HeaderIcon = config.icons.header
  const EmptyIcon = config.icons.empty

  return (
    <div className="space-y-4">
      {}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary-muted)] flex items-center justify-center">
            <HeaderIcon size={20} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-[var(--color-text)]">{t(config.headerKey)}</h1>
            <p className="text-xs text-[var(--color-muted)]">• {t(config.subtitleKey)}</p>
          </div>
        </div>
        <ConnectionBadge connected={connected} WifiIcon={Wifi} WifiOffIcon={WifiOff} />
      </div>

      {}
      <IconStatsBar columns={2} stats={[
        { label: t("station.pendingOrder"), value: stats.pending, icon: Clock, bg: "bg-[var(--color-accent-muted)]", text: "text-[var(--color-warning)]", iconBg: "bg-[var(--color-accent-muted)]" },
        { label: t(config.labels.statNowKey), value: stats.preparing, icon: Flame, bg: "bg-[var(--color-flame-muted)]", text: "text-[var(--color-flame)]", iconBg: "bg-[var(--color-flame-muted)]" },
      ]} />

      {}
      <div className="flex gap-2 flex-wrap">
        {filterTabs.map(({ label, key, icon: Icon }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all min-h-[44px]",
              filter === key ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" : "border-[var(--color-border)] text-[var(--color-text-secondary)] active:bg-[var(--color-primary-muted)]")}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {}
      <div className="space-y-5">
        {isLoading && orders.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-muted)] text-sm">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-muted)]">
            <EmptyIcon size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t("station.noOrders")}</p>
          </div>
        ) : (
          tableGroups.map(group => (
            <div key={group.table_number} className={cn(
              group.orders.length > 1 && "border-l-2 border-[var(--color-primary)]/40 pl-3 space-y-3"
            )}>
              {group.orders.length > 1 && (
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-primary)]">
                  <Users size={12} />
                  {t("common.table")} {group.table_number} — {group.orders.length} {t("station.roundsAtTable")}
                </div>
              )}
              <div className="space-y-3">
                {group.orders.map((order, roundIdx) => {
                  const status = orderStatus(order)
                  const cfg = statusCfg[status]
                  const Icon = cfg.icon
                  const isNew = newOrderIds.has(order.order_id)
                  const hasAllergy = order.items.some(i => isAllergyNote(i.note))
                  const expanded = expandedIds.has(order.order_id)
                  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0)
                  return (
                    <div key={order.order_id} className={cn(
                      "bg-[var(--color-surface)] border rounded-2xl overflow-hidden transition-all",
                      hasAllergy ? "border-[var(--color-danger)]/45 ring-2 ring-[var(--color-danger)]/30" :
                      isNew ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30" : "border-[var(--color-border)]"
                    )}>
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        {}
                        <button
                          type="button"
                          onClick={() => toggleExpanded(order.order_id)}
                          className="flex items-center gap-3 flex-1 min-w-0 text-left"
                        >
                          <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)] flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-white">
                              {order.queue_number != null ? `#${order.queue_number}` : "—"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-semibold text-[var(--color-text)]">Order#{String(order.order_id).padStart(4, "0")}</span>
                              {group.orders.length > 1 && (
                                <span className="text-[9px] font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-1.5 py-0.5 rounded-full">
                                  {t("station.round")} {roundIdx + 1}
                                </span>
                              )}
                              {isNew && <span className="text-[9px] font-bold bg-[var(--color-primary)] text-white px-1.5 py-0.5 rounded-full animate-pulse">NEW</span>}
                              {hasAllergy && <AlertTriangle size={12} className="text-[var(--color-danger)] shrink-0" />}
                            </div>
                            <div className="text-xs text-[var(--color-muted)]">{t("common.table")} <span className="text-[var(--color-primary)]">{order.table_number}</span></div>
                            <div className="flex gap-1.5 items-center mt-1 flex-wrap">
                              <span className={cn("flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full", cfg.color)}>
                                <Icon size={10} /> {cfg.label}
                              </span>
                              <span className="text-[10px] bg-[var(--color-background)] text-[var(--color-muted)] border border-[var(--color-border)] px-1.5 py-0.5 rounded-full font-medium">
                                {itemCount} {t("station.items")}
                              </span>
                              {order.party_size != null && (
                                <span className="flex items-center gap-1 text-[10px] bg-[var(--color-info-muted)] text-[var(--color-info)] border border-[var(--color-info)]/25 px-1.5 py-0.5 rounded-full font-medium">
                                  <Users size={9} /> {order.party_size}
                                </span>
                              )}
                              {order.note && (
                                <span className="text-[10px] bg-[var(--color-accent-muted)] text-[var(--color-warning)] border border-[var(--color-warning)]/25 px-1.5 py-0.5 rounded-full font-medium">📝 {order.note}</span>
                              )}
                            </div>
                          </div>
                          <span className="text-[var(--color-muted)] shrink-0 self-start pt-1">
                            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                        </button>

                        {}
                        {cfg.actionLabel && (
                          <button onClick={() => advance(order)}
                            className={cn("w-full sm:w-auto shrink-0 px-5 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all min-h-[48px]", cfg.actionColor)}>
                            <Icon size={16} /> {cfg.actionLabel}
                          </button>
                        )}
                      </div>

                      {}
                      {expanded && (
                        <div className="px-4 pb-4">
                          <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
                            <div className="grid grid-cols-[1fr_auto_1.2fr] gap-x-3 px-3 py-1.5 bg-[var(--color-background)] text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                              <div>{t("station.colItem")}</div>
                              <div className="text-center">{t("common.qty")}</div>
                              <div>{t("station.colNote")}</div>
                            </div>
                            {order.items.map((item) => {
                              const allergy = isAllergyNote(item.note)
                              return (
                                <div key={item.order_item_id} className="grid grid-cols-[1fr_auto_1.2fr] gap-x-3 px-3 py-2 items-center border-t border-[var(--color-border)]">
                                  <div className="text-sm font-medium text-[var(--color-text)] truncate">{menuItemName(item.menu_item, lang)}</div>
                                  <div className="text-sm font-semibold text-[var(--color-text)] text-center">{item.quantity}</div>
                                  <div>
                                    {item.note ? (
                                      <span className={cn(
                                        "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                                        allergy ? "bg-[var(--color-danger-muted)] text-[var(--color-danger)] border border-[var(--color-danger)]/25" : "bg-[var(--color-accent-muted)] text-[var(--color-warning)] border border-[var(--color-warning)]/25"
                                      )}>
                                        {allergy && <AlertTriangle size={9} />}
                                        {item.note}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-[var(--color-muted)]">—</span>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
