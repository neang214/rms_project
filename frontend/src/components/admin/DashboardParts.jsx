import { TrendingUp, Calendar, DollarSign, Flame } from "lucide-react"
import { Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Card } from "@/components/ui"
import { IconStatsBar } from "@/components/shared"

export function RevenueStats({ dailyRevenue, weeklyRevenue, monthlyRevenue }) {
  return (
    <IconStatsBar columns={3} stats={[
      { label: "Today's Revenue", value: dailyRevenue?.total ? `$${Number(dailyRevenue.total).toFixed(2)}` : "$0.00", icon: TrendingUp, bg: "bg-[var(--color-primary-muted)]", iconBg: "bg-[var(--color-primary-muted)]", text: "text-[var(--color-primary)]" },
      { label: "Weekly Revenue", value: weeklyRevenue?.total ? `$${Number(weeklyRevenue.total).toFixed(2)}` : "$0.00", icon: Calendar, bg: "bg-[var(--color-info-muted)]", iconBg: "bg-[var(--color-info-muted)]", text: "text-[var(--color-info)]" },
      { label: "Monthly Revenue", value: monthlyRevenue?.total ? `$${Number(monthlyRevenue.total).toFixed(2)}` : "$0.00", icon: DollarSign, bg: "bg-[var(--color-plum-muted)]", iconBg: "bg-[var(--color-plum-muted)]", text: "text-[var(--color-plum)]" },
    ]} />
  )
}

export function TopSellingTable({ topSellingItems }) {
  return (
    <Card>
      <div className="p-5 pb-3 border-b border-[var(--color-border)] flex items-center gap-2">
        <Flame size={18} className="text-[var(--color-flame)]" />
        <div>
          <div className="font-semibold text-[var(--color-primary)] text-base">Top Selling Items</div>
          <div className="text-xs text-[var(--color-muted)] mt-0.5">Most popular menu items based on quantity sold</div>
        </div>
      </div>

      <div className="p-2">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead className="text-right">Units Sold</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topSellingItems && topSellingItems.length > 0 ? (
              topSellingItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-bold text-[var(--color-muted)]">
                    #{index + 1}
                  </TableCell>
                  <TableCell className="font-medium text-[var(--color-text)]">
                    {item.item_name}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary" className="font-semibold">
                      {item.total_quantity} sold
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-xs text-[var(--color-muted)] py-6">
                  No sales records available yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
