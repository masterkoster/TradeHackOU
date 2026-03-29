'use client'

import { useState, useCallback, useEffect } from 'react'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { StarButton } from '@/components/star-button'

const COMPANY_NAMES: Record<string, string> = {
  // Technology
  AAPL: 'Apple',
  MSFT: 'Microsoft',
  NVDA: 'NVIDIA',
  GOOGL: 'Alphabet',
  META: 'Meta Platforms',
  AMD: 'AMD',
  INTC: 'Intel',
  TSLA: 'Tesla',
  // Finance
  JPM: 'JPMorgan Chase',
  BAC: 'Bank of America',
  GS: 'Goldman Sachs',
  V: 'Visa',
  MA: 'Mastercard',
  WFC: 'Wells Fargo',
  // Healthcare
  JNJ: 'Johnson & Johnson',
  UNH: 'UnitedHealth',
  PFE: 'Pfizer',
  ABBV: 'AbbVie',
  MRK: 'Merck',
  // Energy
  XOM: 'ExxonMobil',
  CVX: 'Chevron',
  COP: 'ConocoPhillips',
  SLB: 'SLB',
  // Consumer
  AMZN: 'Amazon',
  WMT: 'Walmart',
  HD: 'Home Depot',
  MCD: "McDonald's",
  SBUX: 'Starbucks',
  COST: 'Costco',
  // ETFs
  SPY: 'S&P 500 ETF',
  QQQ: 'Nasdaq-100 ETF',
  DIA: 'Dow Jones ETF',
  IWM: 'Russell 2000 ETF',
}

const INDUSTRIES = [
  {
    name: 'Technology',
    symbols: ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META', 'AMD', 'INTC', 'TSLA'],
  },
  {
    name: 'Finance',
    symbols: ['JPM', 'BAC', 'GS', 'V', 'MA', 'WFC'],
  },
  {
    name: 'Healthcare',
    symbols: ['JNJ', 'UNH', 'PFE', 'ABBV', 'MRK'],
  },
  {
    name: 'Energy',
    symbols: ['XOM', 'CVX', 'COP', 'SLB'],
  },
  {
    name: 'Consumer',
    symbols: ['AMZN', 'WMT', 'HD', 'MCD', 'SBUX', 'COST'],
  },
  {
    name: 'ETFs & Indices',
    symbols: ['SPY', 'QQQ', 'DIA', 'IWM'],
  },
]

const ALL_SYMBOLS = INDUSTRIES.flatMap((g) => g.symbols)

interface AlpacaSnapshot {
  latestTrade?: { p?: number }
  dailyBar?: { o?: number; c?: number; v?: number }
  prevDailyBar?: { c?: number }
}

interface StockData {
  symbol: string
  price: number
  changePct: number
  volume: number
}

interface CompanyProfile {
  symbol: string
  name: string
  summary: string
  sector: string | null
  industry: string | null
  employees: number | null
  marketCap: number | null
  eps: number | null
  pe: number | null
  dividendYield: number | null
  website: string | null
  logoUrl: string | null
}

function calcStockData(symbol: string, snap: AlpacaSnapshot): StockData {
  const price = snap.latestTrade?.p ?? snap.dailyBar?.c ?? 0
  const prevClose = snap.prevDailyBar?.c ?? snap.dailyBar?.o ?? 0
  const changePct = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0
  const volume = snap.dailyBar?.v ?? 0
  return { symbol, price, changePct, volume }
}

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return String(v)
}

function StockCard({
  data,
  size = 'normal',
  onOpen,
}: {
  data: StockData
  size?: 'normal' | 'large'
  onOpen: (symbol: string) => void
}) {
  const positive = data.changePct >= 0
  const sign = positive ? '+' : ''

  if (size === 'large') {
    return (
      <button
        onClick={() => onOpen(data.symbol)}
        className="p-4 rounded-xl bg-card border border-border flex items-center justify-between gap-4 text-left hover:border-foreground/20 hover:bg-accent transition"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-base font-bold text-foreground">{data.symbol}</p>
            <StarButton symbol={data.symbol} size={13} />
          </div>
          <p className="text-xs text-muted-foreground truncate">{COMPANY_NAMES[data.symbol] ?? data.symbol}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-semibold text-foreground">${data.price.toFixed(2)}</p>
          <p className={`text-sm font-semibold ${positive ? 'text-[#22c55e]' : 'text-red-500 dark:text-red-400'}`}>
            {sign}{data.changePct.toFixed(2)}%
          </p>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={() => onOpen(data.symbol)}
      className="p-3 rounded-xl bg-card border border-border text-left hover:border-foreground/20 hover:bg-accent transition"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-sm font-bold text-foreground">{data.symbol}</p>
            <StarButton symbol={data.symbol} size={12} />
          </div>
          <p className="text-xs text-muted-foreground truncate">{COMPANY_NAMES[data.symbol] ?? data.symbol}</p>
        </div>
        <span
          className={`text-xs font-semibold px-1.5 py-0.5 rounded shrink-0 ml-2 ${
            positive
              ? 'text-[#22c55e] bg-[#22c55e]/10'
              : 'text-red-500 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
          }`}
        >
          {sign}{data.changePct.toFixed(2)}%
        </span>
      </div>
      <p className="text-sm font-semibold text-foreground">${data.price.toFixed(2)}</p>
      {data.volume > 0 && (
        <p className="text-xs text-muted-foreground mt-1">Vol {formatVolume(data.volume)}</p>
      )}
    </button>
  )
}

function SkeletonCard({ size = 'normal' }: { size?: 'normal' | 'large' }) {
  if (size === 'large') {
    return (
      <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between gap-4 animate-pulse">
        <div className="space-y-2">
          <div className="h-4 w-12 bg-muted-foreground/20 rounded" />
          <div className="h-3 w-20 bg-muted-foreground/10 rounded" />
        </div>
        <div className="space-y-2 text-right">
          <div className="h-4 w-16 bg-muted-foreground/20 rounded" />
          <div className="h-3 w-12 bg-muted-foreground/10 rounded" />
        </div>
      </div>
    )
  }
  return (
    <div className="p-3 rounded-xl bg-card border border-border animate-pulse">
      <div className="flex items-start justify-between mb-2">
        <div className="space-y-1.5">
          <div className="h-4 w-10 bg-muted-foreground/20 rounded" />
          <div className="h-3 w-16 bg-muted-foreground/10 rounded" />
        </div>
        <div className="h-5 w-14 bg-muted-foreground/10 rounded" />
      </div>
      <div className="h-4 w-14 bg-muted-foreground/20 rounded" />
    </div>
  )
}

export default function ExplorePage() {
  const [stocks, setStocks] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [selected, setSelected] = useState<CompanyProfile | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  const fetchSnapshots = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/alpaca/snapshots?symbols=${ALL_SYMBOLS.join(',')}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }
      const data = await res.json() as Record<string, AlpacaSnapshot>
      const parsed = ALL_SYMBOLS
        .filter((s) => data[s])
        .map((s) => calcStockData(s, data[s]))
      setStocks(parsed)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSnapshots() }, [fetchSnapshots])

  const openDetails = useCallback(async (symbol: string) => {
    setDetailOpen(true)
    setDetailLoading(true)
    setDetailError(null)
    setSelected(null)
    try {
      const res = await fetch(`/api/market/profile?symbol=${encodeURIComponent(symbol)}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }
      const data = (await res.json()) as CompanyProfile
      setSelected(data)
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : 'Failed to load company profile')
    } finally {
      setDetailLoading(false)
    }
  }, [])

  const bySymbol = Object.fromEntries(stocks.map((s) => [s.symbol, s]))

  const sorted = [...stocks].sort((a, b) => b.changePct - a.changePct)
  const gainers = sorted.slice(0, 5)
  const losers = sorted.slice(-5).reverse()

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Explore</h1>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={fetchSnapshots}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-600 text-sm dark:bg-red-900/20 dark:border-red-600/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Today's Movers */}
      <section>
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4">Today&apos;s Movers</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gainers */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-[#22c55e]" />
              <p className="text-sm font-medium text-foreground">Top Gainers</p>
            </div>
            <div className="flex flex-col gap-2">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} size="large" />)
                : gainers.map((s) => <StockCard key={s.symbol} data={s} size="large" onOpen={openDetails} />)}
            </div>
          </div>

          {/* Losers */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown size={14} className="text-red-500 dark:text-red-400" />
              <p className="text-sm font-medium text-foreground">Top Losers</p>
            </div>
            <div className="flex flex-col gap-2">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} size="large" />)
                : losers.map((s) => <StockCard key={s.symbol} data={s} size="large" onOpen={openDetails} />)}
            </div>
          </div>
        </div>
      </section>

      {/* By Industry */}
      <section className="space-y-8">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">By Industry</p>
        {INDUSTRIES.map((group) => (
          <div key={group.name}>
            <p className="text-sm font-medium text-foreground mb-3">{group.name}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {loading
                ? group.symbols.map((_, i) => <SkeletonCard key={i} />)
                : group.symbols.map((sym) =>
                    bySymbol[sym] ? (
                      <StockCard key={sym} data={bySymbol[sym]} onOpen={openDetails} />
                    ) : null
                  )}
            </div>
          </div>
        ))}
      </section>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Company details</DialogTitle>
            <DialogDescription>Fundamentals sourced from Yahoo Finance.</DialogDescription>
          </DialogHeader>

          {detailLoading && (
            <div className="py-6 text-sm text-muted-foreground">Loading profile…</div>
          )}

          {detailError && (
            <div className="py-4 text-sm text-red-500 dark:text-red-300">{detailError}</div>
          )}

          {selected && !detailLoading && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                {selected.logoUrl && (
                  <img
                    src={selected.logoUrl}
                    alt={`${selected.name} logo`}
                    className="w-12 h-12 rounded bg-white p-1"
                  />
                )}
                <div>
                  <p className="text-lg font-semibold text-foreground">{selected.name}</p>
                  <p className="text-sm text-muted-foreground">{selected.symbol}</p>
                </div>
              </div>

              {selected.summary && (
                <p className="text-sm text-foreground/70 leading-relaxed">{selected.summary}</p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted border border-border">
                  <p className="text-muted-foreground text-xs mb-1">Sector</p>
                  <p className="text-foreground">{selected.sector ?? '—'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted border border-border">
                  <p className="text-muted-foreground text-xs mb-1">Industry</p>
                  <p className="text-foreground">{selected.industry ?? '—'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted border border-border">
                  <p className="text-muted-foreground text-xs mb-1">Employees</p>
                  <p className="text-foreground">{selected.employees ? selected.employees.toLocaleString() : '—'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted border border-border">
                  <p className="text-muted-foreground text-xs mb-1">Market Cap</p>
                  <p className="text-foreground">{selected.marketCap ? `$${(selected.marketCap / 1e9).toFixed(1)}B` : '—'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted border border-border">
                  <p className="text-muted-foreground text-xs mb-1">EPS (TTM)</p>
                  <p className="text-foreground">{selected.eps ?? '—'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted border border-border">
                  <p className="text-muted-foreground text-xs mb-1">P/E (TTM)</p>
                  <p className="text-foreground">{selected.pe ?? '—'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
