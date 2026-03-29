# TradeHackOU

A full-featured trading dashboard built for a hackathon. Combines real-time market data from Alpaca Markets, FinBERT-powered sentiment analysis, AI chart analysis via Groq, multi-symbol comparison, a favorites watchlist, and a stock explorer — all in a modern Next.js application with dark/light theme support and Supabase authentication.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16, React 18, TypeScript 5 (strict) |
| Styling | Tailwind CSS v4, shadcn/ui, Radix UI |
| Charting | lightweight-charts v4, Recharts |
| Market Data | Alpaca Markets REST + WebSocket (IEX feed) |
| Sentiment | HuggingFace FinBERT (`ProsusAI/finbert`) |
| AI Analysis | Groq `llama-3.3-70b-versatile` |
| Auth | Supabase |

## Features

### Trading Dashboard
- 5 chart types: Candlestick, Line, Area, OHLC, Heikin-Ashi
- Volume histogram pane
- Live bar streaming via Alpaca WebSocket with connection status indicator
- 5-minute in-memory data cache with stale-data banner
- Visualization modes: Standard, Returns, Moving Averages, Volume, VWAP, Multi

### Signals & AI
- BUY / SELL / HOLD signal derived from FinBERT sentiment × risk profile
- 3 risk profiles (Low, Moderate, High) that adjust signal thresholds
- AI historical analysis panel (Groq) with key levels, trend, patterns, and risk notes
- Portfolio-level Groq analysis for favorites watchlist

### Market Explorer
- Stock explorer with industry categorization, company profiles, top gainers/losers
- Multi-symbol comparison with configurable periods (1D to 1Y) and metrics table
- Analytics dashboard with sentiment + technical analysis views
- Favorites watchlist with chart overlays and portfolio analysis

### App
- Supabase authentication (email/password)
- Protected routes for all `/app/*` pages
- Persistent favorites and risk profile via localStorage
- Dark/light theme toggle

## Signal Logic

Risk-adjusted thresholds applied to FinBERT sentiment scores across the top 10 news headlines:

| Risk Profile | BUY threshold | SELL threshold |
|---|---|---|
| Low | positive ≥ 75% | negative ≥ 45% |
| Moderate | positive ≥ 60% | negative ≥ 55% |
| High | positive ≥ 45% | negative ≥ 70% |

## Setup

1. Install dependencies

```bash
npm install
```

2. Copy the env template and fill in your keys

```bash
cp .env.local.example .env.local
```

Required environment variables:

| Variable | Source |
|---|---|
| `ALPACA_API_KEY` | Alpaca paper account |
| `ALPACA_SECRET_KEY` | Alpaca paper account |
| `ALPACA_BASE_URL` | `https://paper-api.alpaca.markets` |
| `ALPACA_FEED` | `iex` |
| `NEXT_PUBLIC_ALPACA_API_KEY` | Same paper key (for WebSocket) |
| `NEXT_PUBLIC_ALPACA_SECRET_KEY` | Same paper secret (for WebSocket) |
| `NEXT_PUBLIC_HF_API_KEY` | HuggingFace token |
| `NEXT_PUBLIC_GROQ_API_KEY` | Groq API key |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

3. Run the dev server

```bash
npm run dev
```

## Pages

| Route | Description |
|---|---|
| `/` | Landing page — market snapshot, metrics, ticker list, auth |
| `/app` | Main trading dashboard (protected) |
| `/app/explore` | Stock explorer with industry grouping and company profiles |
| `/app/compare` | Multi-symbol overlay chart and metrics comparison |
| `/app/analytics` | Sentiment and technical analysis |
| `/app/favorites` | Watchlist management and portfolio-level AI analysis |
| `/app/profile` | User profile settings |
| `/app/risk` | Profile configuration |

## Project Structure

```
app/
  api/
    alpaca/          ← bars, quote, news, account, clock, snapshots proxies
    groq/            ← analyze (chart), portfolio analysis
    market/          ← company profile, financial series (Alpha Vantage)
  app/               ← authenticated pages (dashboard, explore, compare, analytics, favorites, profile, risk-profile)
  page.tsx           ← public landing page
components/
  trading-dashboard.tsx   ← main orchestration component
  chart.tsx               ← lightweight-charts wrapper
  compare-chart.tsx       ← multi-series overlay chart
  controls.tsx            ← symbol / timeframe / chart type / risk profile
  historic-analysis.tsx   ← Groq AI analysis panel
  sidebar.tsx             ← authenticated navigation
  header.tsx              ← top nav with theme toggle and auth
  star-button.tsx         ← add/remove from favorites
  stale-banner.tsx        ← stale data indicator
  ws-status-dot.tsx       ← WebSocket connection status
  risk-profile.tsx        ← risk profile badge + market status
contexts/
  RiskProfileContext.tsx  ← global risk profile state
  FavoritesContext.tsx    ← global favorites/watchlist state
hooks/
  useBars.ts              ← historical bar fetching + caching
  useWebSocket.ts         ← live Alpaca WebSocket bars
  useGroqAnalysis.ts      ← AI analysis with sessionStorage cache
lib/
  alpacaClient.ts         ← Alpaca REST helpers
  sentimentClient.ts      ← HuggingFace FinBERT calls
  groqClient.ts           ← Groq LLM calls
  dataCache.ts            ← 5-minute in-memory bar cache
  signal.ts               ← BUY/SELL/HOLD calculation
  historicAnalysis.ts     ← Groq prompt builder
  heikinAshi.ts           ← Heikin-Ashi candle calculation
  indicators.ts           ← SMA, VWAP, returns series
  supabaseClient.ts       ← Supabase client init
types/
  index.ts                ← Bar, ChartType, Timeframe, Signal, GroqAnalysis, etc.
```

## External Services

- **Alpaca Markets** — real-time and historical stock data, WebSocket streaming, market clock
- **HuggingFace** — FinBERT sentiment model for news headline analysis
- **Groq** — LLM-powered chart analysis and portfolio insights
- **Alpha Vantage** — company fundamentals and financial series data
- **Supabase** — authentication and user session management
