import { useState, useEffect } from "react"
import { useDashboardStore } from "../../context/dashboardContext"
import { usePaymentStore } from "../../context/paymentContext"
import { useOrderStore } from "../../context/orderContext"
import { usePageTitle } from "../../hooks/usePageTitle"
import { PaymentStats, ReportBuilder } from "@/components/admin/PaymentsParts"

export default function PaymentsReport() {
  usePageTitle("Payment & Report")
  const { dailyRevenue, fetchDailyRevenue } = useDashboardStore()
  const { payments, fetchPayments } = usePaymentStore()
  const { orders, fetchOrders, isLoading: ordersLoading } = useOrderStore()

  const [activePeriod] = useState("Daily") 
  const [generated, setGenerated] = useState(false)

  useEffect(() => {
    fetchDailyRevenue()
    fetchPayments()
    fetchOrders()
  }, [])

  const todaysPayments = payments.filter(p => {
    const d = new Date(p.payment_date)
    const today = new Date()
    return d.toDateString() === today.toDateString() && p.status === "Completed"
  })

  const todaysRevenue = todaysPayments.reduce((s, p) => s + Number(p.amount), 0)

  const totalRevenue = Number(dailyRevenue?.total || 0)
  const periodOrders = orders.filter(o => new Date(o.order_date).toDateString() === new Date().toDateString())
  const paidOrders = periodOrders.filter(o => o.status === "Paid")
  const avgOrderValue = paidOrders.length ? totalRevenue / paidOrders.length : 0

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-display font-bold text-[var(--color-text)]">Payments & Reports</h1>

      <PaymentStats orders={orders} todaysPayments={todaysPayments} todaysRevenue={todaysRevenue} />

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
