import { useState, useEffect } from "react"
import { useDashboardStore } from "../../context/dashboardContext"
import { useOrderStore } from "../../context/orderContext"
import { usePageTitle } from "../../hooks/usePageTitle"
import { ReportBuilder } from "@/components/admin/PaymentsParts"

export default function Reports() {
  usePageTitle("Reports")
  const { dailyRevenue, weeklyRevenue, monthlyRevenue, fetchDailyRevenue, fetchWeeklyRevenue, fetchMonthlyRevenue } = useDashboardStore()
  const { orders, fetchOrders, isLoading: ordersLoading } = useOrderStore()

  const [activePeriod, setActivePeriod] = useState("Daily")
  const [generated, setGenerated] = useState(false)

  useEffect(() => {
    fetchDailyRevenue()
    fetchWeeklyRevenue()
    fetchMonthlyRevenue()
    fetchOrders()
  }, [])

  const revenueByPeriod = {
    Daily: dailyRevenue?.total,
    Weekly: weeklyRevenue?.total,
    Monthly: monthlyRevenue?.total,
  }

  const totalRevenue = Number(revenueByPeriod[activePeriod] || 0)
  const periodOrders = activePeriod === "Daily"
    ? orders.filter(o => new Date(o.order_date).toDateString() === new Date().toDateString())
    : orders
  const paidOrders = periodOrders.filter(o => o.status === "Paid")
  const avgOrderValue = paidOrders.length ? totalRevenue / paidOrders.length : 0

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-display font-bold text-[var(--color-text)]">Reports</h1>

      <ReportBuilder
        generated={generated} setGenerated={setGenerated}
        activePeriod={activePeriod} setActivePeriod={setActivePeriod}
        totalRevenue={totalRevenue} paidOrders={paidOrders} avgOrderValue={avgOrderValue}
        periodOrders={periodOrders} ordersLoading={ordersLoading}
      />
    </div>
  )
}
