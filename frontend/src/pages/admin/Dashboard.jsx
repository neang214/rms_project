import { useEffect } from "react"
import { useDashboardStore } from "../../context/dashboardContext"
import { usePageTitle } from "../../hooks/usePageTitle"
import { RevenueStats, TopSellingTable } from "@/components/admin/DashboardParts"

export default function Dashboard() {
  usePageTitle("Dashboard")
  const {
    dailyRevenue,
    weeklyRevenue,
    monthlyRevenue,
    topSellingItems,
    fetchDailyRevenue,
    fetchWeeklyRevenue,
    fetchMonthlyRevenue,
    fetchTopSelling,
  } = useDashboardStore()

  useEffect(() => {
    fetchTopSelling()
    fetchDailyRevenue()
    fetchWeeklyRevenue()
    fetchMonthlyRevenue()
  }, [fetchDailyRevenue, fetchWeeklyRevenue, fetchMonthlyRevenue, fetchTopSelling])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-[var(--color-text)]">Analytics Dashboard</h1>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">Real-time revenue performance and product tracking.</p>
      </div>

      <RevenueStats dailyRevenue={dailyRevenue} weeklyRevenue={weeklyRevenue} monthlyRevenue={monthlyRevenue} />

      <TopSellingTable topSellingItems={topSellingItems} />
    </div>
  )
}
