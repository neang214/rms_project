import { useState, useEffect } from "react"
import { ShoppingBag, Search, QrCode } from "lucide-react"
import { cn } from "@/lib/utils"
import { useOrderStore } from "../../context/orderContext"
import { usePaymentStore } from "../../context/paymentContext"
import { useSocketRole, useSocketEvent } from "../../services/socket"
import { usePageTitle } from "../../hooks/usePageTitle"
import { useLang } from "@/i18n/LanguageContext"
import { PageHeader, StatsBar } from "@/components/shared"
import ReceiptScanner from "@/components/cashier/ReceiptScanner"
import { orderTotal } from "@/components/cashier/orderHelpers"
import UnconfirmedList from "@/components/cashier/UnconfirmedList"
import ActiveOrdersTable from "@/components/cashier/ActiveOrdersTable"
import ViewOrderDialog from "@/components/cashier/ViewOrderDialog"
import PaymentDialog from "@/components/cashier/PaymentDialog"

export default function CashierOrders() {
  const { t } = useLang()
  usePageTitle("Order Management")
  const { orders, fetchOrders, unconfirmedOrders, fetchUnconfirmedOrders, confirmOrder, rejectOrder, isLoading } = useOrderStore()
  const { paymentMethods, fetchPaymentMethods } = usePaymentStore()

  const [payOrder, setPayOrder] = useState(null)
  const [viewOrder, setViewOrder] = useState(null)
  const [confirmBusyId, setConfirmBusyId] = useState(null)
  const [search, setSearch] = useState("")
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scanError, setScanError] = useState("")

  useSocketRole("cashier")

  useEffect(() => {
    fetchOrders()
    fetchPaymentMethods()
    fetchUnconfirmedOrders()
    const interval = setInterval(() => {
      fetchOrders()
      fetchUnconfirmedOrders()
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  useSocketEvent("order:new", () => { fetchOrders(); fetchUnconfirmedOrders() })
  useSocketEvent("order:confirmed", () => { fetchOrders(); fetchUnconfirmedOrders() })
  useSocketEvent("order:status_changed", () => fetchOrders())
  useSocketEvent("order:deleted", () => { fetchOrders(); fetchUnconfirmedOrders() })
  useSocketEvent("order_item:new", () => fetchOrders())
  useSocketEvent("order_item:status_changed", () => fetchOrders())
  useSocketEvent("payment:completed", () => fetchOrders())

  const activeOrders = orders.filter(o => !(o.is_paid ?? o.status === "Paid") && o.confirmed !== false)

  
  
  
  
  const handleReceiptFound = (orderId) => {
    setScannerOpen(false)
    const found = orders.find(o => o.order_id === orderId)
    if (!found) {
      setScanError(`Order #${String(orderId).padStart(4, "0")} not found.`)
      return
    }
    if (found.is_paid ?? found.status === "Paid") {
      setScanError(`Order #${String(orderId).padStart(4, "0")} has already been paid.`)
      return
    }
    if (found.confirmed === false) {
      setScanError(`Order #${String(orderId).padStart(4, "0")} hasn't been confirmed yet.`)
      return
    }
    setScanError("")
    setPayOrder(found)
  }

  // Search by table number or waiting (queue) number — either can be typed
  // as-is, matching is exact on the number so "5" doesn't accidentally
  
  const searchQuery = search.trim().toLowerCase()
  
  
  
  const searchDigits = searchQuery.replace(/\D/g, "")
  const searchAsNumber = searchDigits ? parseInt(searchDigits, 10) : null

  const searchedOrders = searchQuery
    ? activeOrders.filter(o =>
        String(o.table?.table_number ?? "").toLowerCase().includes(searchQuery) ||
        (searchAsNumber !== null && o.queue_number === searchAsNumber)
      )
    : activeOrders

  const stats = {
    active: activeOrders.length,
    pending: activeOrders.filter(o => o.status === "Pending").length,
    cooking: activeOrders.filter(o => o.status === "Preparing").length,
    ready: activeOrders.filter(o => o.status === "Served").length,
    total: activeOrders.reduce((s, o) => s + orderTotal(o), 0),
  }

  const grouped = {
    Served: searchedOrders.filter(o => o.status === "Served"),
    Preparing: searchedOrders.filter(o => o.status === "Preparing"),
    Pending: searchedOrders.filter(o => o.status === "Pending"),
  }

  const sectionConfig = [
    { key: "Served", label: t("cashier.readyForPayment"), sub: `${grouped.Served.length} ${t("cashier.orders")}`, accent: "text-[var(--color-primary)]", bar: "bg-[var(--color-primary)]" },
    { key: "Preparing", label: t("cashier.beingPrepared"), sub: `${grouped.Preparing.length} ${t("cashier.ordersInKitchen")}`, accent: "text-[var(--color-warning)]", bar: "bg-[var(--color-warning)]/80" },
    { key: "Pending", label: t("cashier.newOrders"), sub: `${grouped.Pending.length} ${t("cashier.ordersWaiting")}`, accent: "text-[var(--color-text-secondary)]", bar: "bg-[var(--color-muted)]" },
  ]

  const handleConfirmGuestOrder = async (order) => {
    setConfirmBusyId(order.order_id)
    try {
      await confirmOrder(order.order_id)
      await fetchOrders()
    } catch (err) {
      console.error(err)
    } finally {
      setConfirmBusyId(null)
    }
  }

  const handleRejectGuestOrder = async (order) => {
    setConfirmBusyId(order.order_id)
    try {
      await rejectOrder(order.order_id)
    } catch (err) {
      console.error(err)
    } finally {
      setConfirmBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader icon={ShoppingBag} title={t("nav.orders")}
        subtitle={`• ${stats.active} active`} />

      {}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Find by table # or waiting #"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>
        <button onClick={() => { setScanError(""); setScannerOpen(true) }}
          className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors shrink-0">
          <QrCode size={15} /> Scan receipt
        </button>
      </div>
      {scanError && (
        <div className="text-sm text-[var(--color-danger)] bg-[var(--color-danger-muted)] border border-[var(--color-danger)]/25 rounded-xl px-3 py-2">{scanError}</div>
      )}

      {}
      {unconfirmedOrders.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 rounded-full bg-[var(--color-warning)]" />
            <div>
              <div className="font-semibold text-sm text-[var(--color-warning)]">{t("cashier.awaiting")}</div>
              <div className="text-[10px] text-[var(--color-muted)]">{unconfirmedOrders.length} guest order{unconfirmedOrders.length !== 1 ? "s" : ""} need review — confirm only if the table really has a customer</div>
            </div>
          </div>
          <UnconfirmedList
            orders={unconfirmedOrders}
            onConfirm={handleConfirmGuestOrder}
            onReject={handleRejectGuestOrder}
            busyId={confirmBusyId}
          />
        </div>
      )}

      {/* Stats bar */}
      <StatsBar columns={5} stats={[
        { label: t("cashier.statActive"), value: stats.active, color: "text-[var(--color-primary)]", bg: "bg-[var(--color-primary-muted)]" },
        { label: t("status.pending"), value: stats.pending, color: "text-[var(--color-warning)]", bg: "bg-[var(--color-accent-muted)]" },
        { label: t("status.cooking"), value: stats.cooking, color: "text-[var(--color-flame)]", bg: "bg-[var(--color-flame-muted)]" },
        { label: t("status.ready"), value: stats.ready, color: "text-[var(--color-primary)]", bg: "bg-[var(--color-primary-muted)]" },
        { label: t("common.total"), value: `$${stats.total.toFixed(2)}`, color: "text-[var(--color-plum)]", bg: "bg-[var(--color-plum-muted)]" },
      ]} />

      {isLoading && activeOrders.length === 0 ? (
        <div className="text-center py-16 text-[var(--color-muted)] text-sm">Loading orders...</div>
      ) : activeOrders.length === 0 && unconfirmedOrders.length === 0 ? (
        <div className="text-center py-16 text-[var(--color-muted)] text-sm">No active orders.</div>
      ) : searchQuery && searchedOrders.length === 0 ? (
        <div className="text-center py-16 text-[var(--color-muted)] text-sm">No active order matches "{searchQuery}".</div>
      ) : (
        sectionConfig.map(({ key, label, sub, accent, bar }) => (
          grouped[key].length > 0 && (
            <div key={key}>
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("w-1 h-5 rounded-full", bar)} />
                <div>
                  <div className={cn("font-semibold text-sm", accent)}>{label}</div>
                  <div className="text-[10px] text-[var(--color-muted)]">{sub}</div>
                </div>
              </div>
              <ActiveOrdersTable orders={grouped[key]} onPay={setPayOrder} onView={setViewOrder} />
            </div>
          )
        ))
      )}

      <ViewOrderDialog order={viewOrder} onClose={() => setViewOrder(null)} />

      <PaymentDialog
        order={payOrder}
        paymentMethods={paymentMethods}
        unconfirmedCount={unconfirmedOrders.length}
        onClose={() => setPayOrder(null)}
        onPaid={fetchOrders}
      />

      {scannerOpen && (
        <ReceiptScanner onFound={handleReceiptFound} onClose={() => setScannerOpen(false)} />
      )}
    </div>
  )
}
