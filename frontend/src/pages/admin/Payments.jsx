import { useEffect } from "react"
import { usePaymentStore } from "../../context/paymentContext"
import { useOrderStore } from "../../context/orderContext"
import { usePageTitle } from "../../hooks/usePageTitle"
import { PaymentStats } from "@/components/admin/PaymentsParts"

export default function Payments() {
  usePageTitle("Payments")
  const { payments, fetchPayments } = usePaymentStore()
  const { orders, fetchOrders } = useOrderStore()

  useEffect(() => {
    fetchPayments()
    fetchOrders()
  }, [])

  const todaysPayments = payments.filter(p => {
    const d = new Date(p.payment_date)
    const today = new Date()
    return d.toDateString() === today.toDateString() && p.status === "Completed"
  })

  const todaysRevenue = todaysPayments.reduce((s, p) => s + Number(p.amount), 0)

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-display font-bold text-[var(--color-text)]">Payments</h1>

      <PaymentStats orders={orders} todaysPayments={todaysPayments} todaysRevenue={todaysRevenue} />
    </div>
  )
}
