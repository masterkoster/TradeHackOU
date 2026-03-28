import { DashboardMetrics } from "@/components/dashboard-metrics"
import { TradingDashboard } from "@/components/trading-dashboard"
import { TickerList } from "@/components/ticker-list"
import { Header } from "@/components/header"
import { AlpacaStatus } from "@/components/alpaca-status"

export default function Dashboard() {
  return (
    <div className="relative min-h-screen w-full bg-[#f7f7f2] text-black dark:bg-[#0b0e12] dark:text-white">
      <Header />

<<<<<<< Updated upstream
      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-20 pt-28">
        <section className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-black/50 dark:text-white/50">
              TradeHackOU
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Simple, secure access to US markets.
            </h1>
            <p className="text-base text-black/60 dark:text-white/60">
              Trade stocks and ETFs with a lightweight workspace built for fast prototyping,
              real-time visibility, and a clean investor experience.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button className="rounded-md bg-black px-5 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black">
                Open Account
              </button>
              <button className="rounded-md border border-black/15 dark:border-white/20 px-5 py-2 text-sm font-semibold text-black/70 dark:text-white/70">
                View Pricing
              </button>
            </div>
=======
      {/* Main Scrollable Area */}
      <div className="h-full overflow-y-auto no-scrollbar">
        <main className="flex gap-6 p-6 pt-24 min-h-full">
          <Sidebar />

          {/* Main Content Container */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            <DashboardMetrics />
            <TradingDashboard />
            <TickerList />

            <AlpacaStatus />
>>>>>>> Stashed changes
          </div>
          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Market snapshot</h2>
              <p className="text-sm text-black/60 dark:text-white/60">
                Watchlist and data tools built to move with you. Multi-symbol overlays, fast
                timeframes, and clean charting with Alpaca data.
              </p>
              <AlpacaStatus />
            </div>
          </div>
        </section>

        <DashboardMetrics />
        <PerformanceChart />
        <TickerList />
      </main>
    </div>
  )
}
