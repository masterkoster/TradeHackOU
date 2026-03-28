import { DashboardMetrics } from "@/components/dashboard-metrics"
import { PerformanceChart } from "@/components/performance-chart"
import { TickerList } from "@/components/ticker-list"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AlpacaStatus } from "@/components/alpaca-status"

export default function Dashboard() {
  return (
    <div className="relative h-screen w-full bg-black text-white overflow-hidden">
      <Header />

      {/* Main Scrollable Area */}
      <div className="h-full overflow-y-auto no-scrollbar">
        <main className="flex gap-6 p-6 pt-24 min-h-full">
          <Sidebar />

          {/* Main Content Container */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            <DashboardMetrics />
            <PerformanceChart />
            <TickerList />
            
            <AlpacaStatus />
          </div>
        </main>
      </div>
    </div>
  )
}
