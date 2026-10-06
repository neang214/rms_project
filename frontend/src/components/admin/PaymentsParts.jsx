import { ShoppingCart, TrendingUp, Receipt, Printer, RefreshCw, DollarSign } from "lucide-react"
import { Button, Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from "@/components/ui"
import { IconStatsBar } from "@/components/shared"
import { cn } from "@/lib/utils"

export const periods = ["Daily", "Weekly", "Monthly"]

export const orderTotal = (order) => order.order_items?.reduce((sum, oi) => sum + Number(oi.unit_price) * oi.quantity, 0) || 0

export function PaymentStats({ orders, todaysPayments, todaysRevenue }) {
  return (
    <IconStatsBar columns={4} stats={[
      { label: "Total Orders", value: orders.length, icon: ShoppingCart, bg: "bg-[var(--color-primary-muted)]", iconBg: "bg-[var(--color-primary-muted)]", text: "text-[var(--color-primary)]" },
      { label: "Today's Payments", value: todaysPayments.length, icon: Receipt, bg: "bg-[var(--color-accent-muted)]", iconBg: "bg-[var(--color-accent-muted)]", text: "text-[var(--color-accent)]" },
      { label: "Today's Revenue", value: `$${todaysRevenue.toFixed(2)}`, icon: TrendingUp, bg: "bg-[var(--color-info-muted)]", iconBg: "bg-[var(--color-info-muted)]", text: "text-[var(--color-info)]" },
      { label: "Total Revenue (All Time)", value: `$${orders.filter(o => o.status === "Paid").reduce((s, o) => s + orderTotal(o), 0).toFixed(2)}`, icon: DollarSign, bg: "bg-[var(--color-plum-muted)]", iconBg: "bg-[var(--color-plum-muted)]", text: "text-[var(--color-plum)]" },
    ]} />
  )
}

export function ReportBuilder({ generated, setGenerated, activePeriod, setActivePeriod, totalRevenue, paidOrders, avgOrderValue, periodOrders, ordersLoading, periods: periodsProp }) {
  const periodOptions = periodsProp || periods
  return (
    <Card>
      <div className="p-5 border-b border-[var(--color-border)]">
        <div className="font-semibold text-[var(--color-primary)]">{generated ? "Sales Report" : "Reports"}</div>
        <div className="text-xs text-[var(--color-muted)] mt-0.5">
          {generated ? `${activePeriod} sales and payment overview` : "Generate detailed sales and payment reports"}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {!generated ? (
          <>
            {periodOptions.length > 1 && (
              <div>
                <div className="font-medium text-[var(--color-text)] text-sm mb-3">Choose Period</div>
                <div className="flex gap-2 flex-wrap">
                  {periodOptions.map(p => (
                    <button key={p} onClick={() => setActivePeriod(p)}
                      className={cn(
                        "flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all",
                        activePeriod === p ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]"
                      )}>
                      <TrendingUp size={13} /> {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button className="w-full gap-2" onClick={() => setGenerated(true)}>
              <Printer size={15} /> Generate Report
            </Button>
          </>
        ) : (
          <>
            <div className="flex gap-2 flex-wrap justify-end">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}><Printer size={13} /> Print Report</Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setGenerated(false)}><RefreshCw size={13} /> Generate New Report</Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}` },
                { label: "Paid Orders", value: paidOrders.length },
                { label: "Avg Order Value", value: `$${avgOrderValue.toFixed(2)}` },
                { label: "Report Period", value: activePeriod, green: true },
              ].map(({ label, value, green }) => (
                <div key={label} className="rounded-xl border border-[var(--color-border)] p-4">
                  <div className="text-xs text-[var(--color-muted)] mb-1">{label}</div>
                  <div className={`text-xl font-bold ${green ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"}`}>{value}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-[var(--color-border)] p-4">
              <div className="font-medium text-[var(--color-text)] mb-3">
                Order Details ({periodOrders.length} orders)
              </div>
              {ordersLoading ? (
                <div className="text-center text-sm text-[var(--color-muted)] py-6">Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead>Order#</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {periodOrders.slice(0, 50).map(o => (
                      <TableRow key={o.order_id}>
                        <TableCell className="font-medium">ORD-{String(o.order_id).padStart(3, "0")}</TableCell>
                        <TableCell className="text-[var(--color-muted)]">{o.table?.table_number}</TableCell>
                        <TableCell className="text-[var(--color-muted)]">{new Date(o.order_date).toLocaleString()}</TableCell>
                        <TableCell><Badge variant={o.status === "Paid" ? "success" : "outline"}>{o.status}</Badge></TableCell>
                        <TableCell className="text-right font-semibold text-[var(--color-primary)]">${orderTotal(o).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    {periodOrders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-[var(--color-muted)] py-6">No orders for this period.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
