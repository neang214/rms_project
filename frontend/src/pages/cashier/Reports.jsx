import { useState, useEffect } from "react"
import { useDashboardStore } from "../../context/dashboardContext"
import { useOrderStore } from "../../context/orderContext"
import { usePageTitle } from "../../hooks/usePageTitle"
import { ReportBuilder } from "@/components/admin/PaymentsParts"

export default function CashierReports() {
  usePageTitle("Reports")
  const { dailyRevenue, fetchDailyRevenue } = useDashboardStore()
  const { orders, fetchOrders, isLoading: ordersLoading } = useOrderStore()

  // Cashier reports stay scoped to today's shift — weekly/monthly rollups
  // are an admin-level view (see admin/Reports.jsx), so there's only one
  // period here, same as the page this was split out of.
  const [activePeriod] = useState("Daily")
  const [generated, setGenerated] = useState(false)

  useEffect(() => {
    fetchDailyRevenue()
    fetchOrders()
  }, [])

  const totalRevenue = Number(dailyRevenue?.total || 0)
  const periodOrders = orders.filter(o => new Date(o.order_date).toDateString() === new Date().toDateString())
  const paidOrders = periodOrders.filter(o => o.status === "Paid")
  const avgOrderValue = paidOrders.length ? totalRevenue / paidOrders.length : 0

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-display font-bold text-[var(--color-text)]">Reports</h1>

      <ReportBuilder
        generated={generated} setGenerated={setGenerated}
        activePeriod={activePeriod} setActivePeriod={() => {}}
        totalRevenue={totalRevenue} paidOrders={paidOrders} avgOrderValue={avgOrderValue}
        periodOrders={periodOrders} ordersLoading={ordersLoading}
        periods={["Daily"]}
      />
    </div>
  )
}
