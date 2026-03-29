# TradeHackOU — Presentation

---

## Slide 1: Title

**TradeHackOU**
*AI-Powered Trading Dashboard*

Real-time market data. Sentiment-driven signals. LLM chart analysis.

---

## Slide 2: The Problem

Trading decisions require synthesizing multiple inputs at once:

- Raw price action across multiple timeframes
- Market sentiment from news
- Technical patterns and key price levels
- Risk tolerance

Most retail traders lack tooling that brings all of this together in one place, in real time.

---

## Slide 3: Our Solution

TradeHackOU is a unified trading dashboard that combines:

1. **Live market data** — real-time price streaming via Alpaca WebSocket
2. **Sentiment analysis** — FinBERT scores news headlines to produce a market signal
3. **AI-powered chart analysis** — Groq LLM identifies key levels, trends, and patterns
4. **Risk-aware signals** — BUY / SELL / HOLD thresholds adjust to your risk profile
5. **Multi-symbol tools** — compare stocks, explore the market, manage a watchlist

---

## Slide 4: Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 + React 18 + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Charts | lightweight-charts v4 |
| Market Data | Alpaca Markets REST + WebSocket |
| Sentiment AI | HuggingFace FinBERT |
| Analysis AI | Groq `llama-3.3-70b-versatile` |
| Auth | Supabase |

---

## Slide 5: Core Feature — Trading Dashboard

The main dashboard gives traders everything they need on one screen:

- **5 chart types**: Candlestick, Line, Area, OHLC, Heikin-Ashi
- **Multiple visualization modes**: Standard, Returns, Moving Averages, VWAP, Volume, Multi
- **Live WebSocket streaming** with a connection status indicator
- **5-minute data cache** with a stale-data warning banner
- **Volume histogram** pane below the main chart

---

## Slide 6: Core Feature — AI Signals

**How the signal works:**

1. Fetch the top 10 recent news headlines for the symbol
2. Run each headline through **FinBERT** (a finance-tuned BERT model from HuggingFace)
3. Aggregate positive / negative / neutral scores
4. Apply risk-profile thresholds

| Risk Profile | BUY | SELL |
|---|---|---|
| Low | positive ≥ 75% | negative ≥ 45% |
| Moderate | positive ≥ 60% | negative ≥ 55% |
| High | positive ≥ 45% | negative ≥ 70% |

---

## Slide 7: Core Feature — AI Chart Analysis

Powered by **Groq** running `llama-3.3-70b-versatile`:

- Analyzes historical OHLCV bar data for the selected symbol and timeframe
- Returns a structured analysis panel with:
  - **Summary** — overall market narrative
  - **Key levels** — support and resistance zones
  - **Trend** — directional bias
  - **Patterns** — candlestick or chart patterns detected
  - **Risk notes** — things to watch out for
- Results cached in sessionStorage (5-minute TTL) to reduce API calls

---

## Slide 8: Core Feature — Market Explorer & Comparison

**Stock Explorer (`/app/explore`)**
- Browse stocks by industry category
- View company profiles, fundamentals, top gainers/losers
- Search and drill down into individual securities

**Multi-Symbol Comparison (`/app/compare`)**
- Add multiple symbols to an overlay chart
- Configurable periods: 1D, 1W, 1M, 3M, 6M, 1Y
- Side-by-side metrics table: OHLC, volume, period change

---

## Slide 9: Core Feature — Watchlist & Portfolio Analysis

**Favorites (`/app/favorites`)**
- Star any stock to add it to your personal watchlist
- View chart overlays for all watchlist symbols
- One-click **portfolio-level Groq analysis**:
  - Sector concentration
  - Correlated risk exposure
  - High-level thesis for the portfolio

Favorites and risk profile persist across sessions via localStorage.

---

## Slide 10: Architecture

```
Browser
  │
  ├── Next.js App Router (React 18, TypeScript)
  │     ├── Public: Landing page
  │     └── Protected /app/*: Dashboard, Explore, Compare, Analytics, Favorites
  │
  ├── API Routes (server-side proxies)
  │     ├── /api/alpaca/*   → Alpaca Markets
  │     ├── /api/groq/*     → Groq LLM
  │     └── /api/market/*   → Alpha Vantage
  │
  └── Client-side
        ├── Alpaca WebSocket (live bars)
        ├── HuggingFace FinBERT (sentiment, client-side)
        ├── Supabase Auth
        └── localStorage / sessionStorage (cache, favorites, risk profile)
```

---

## Slide 11: Data Flow — Signal Generation

```
User selects symbol
        │
        ▼
Fetch top 10 news headlines (Alpaca /api/alpaca/news)
        │
        ▼
FinBERT sentiment analysis per headline (HuggingFace API)
        │
        ▼
Aggregate scores → positive%, negative%, neutral%
        │
        ▼
Apply risk-profile thresholds (Low / Moderate / High)
```

---

## Slide 12: Data Flow — AI Chart Analysis

```
User clicks "Analyze"
        │
        ▼
Check sessionStorage cache (5-min TTL)
        │ (cache miss)
        ▼
Fetch historical bars (useBars hook → Alpaca)
        │
        ▼
Build structured prompt (historicAnalysis.ts)
        │
        ▼
POST to /api/groq/analyze → Groq llama-3.3-70b
        │
        ▼
Parse JSON response → display analysis panel
        │
        ▼
Store in sessionStorage for 5 minutes
```

---

## Slide 13: What We Built in a Hackathon

- Full authentication flow with Supabase
- Real-time WebSocket integration with Alpaca
- Two AI integrations (FinBERT + Groq) working in tandem
- 8 pages with protected routing
- Multi-symbol charting and comparison
- Portfolio-level AI analysis
- Dark/light theme support
- Responsive layout with sidebar navigation

---

## Slide 14: Lessons Learned

- **FinBERT latency** — HuggingFace inference API can be slow on cold starts; a dedicated inference endpoint or local model would improve UX
- **WebSocket reconnection** — handling Alpaca auth timeouts gracefully required careful state management
- **LLM prompt engineering** — structured JSON output from Groq needed explicit schema instructions to be reliable
- **Caching strategy** — 5-minute TTL hit the right balance between freshness and API cost during the hackathon window

---

## Slide 15: Future Work

- **Options data** — integrate options chain and Greeks
- **Backtesting** — run the signal logic against historical data to evaluate performance
- **Alerts** — notify users when a BUY/SELL signal triggers for a watched symbol
- **Paper trading** — execute mock trades directly from the dashboard via Alpaca paper account
- **Mobile-first redesign** — optimize for smaller screens
- **Additional indicators** — RSI, MACD, Bollinger Bands overlaid on chart

---

## Slide 16: Demo

Live demo walkthrough:

1. Land on the public page — see market snapshot and live ticker prices
2. Sign in with Supabase
3. Enter a symbol on the dashboard — load historical bars, view live streaming
4. Change chart type and timeframe
5. View BUY/SELL/HOLD signal and underlying sentiment breakdown
6. Run AI analysis — see key levels, trend, patterns
7. Add symbols to favorites — run portfolio analysis
8. Switch to Explore and Compare pages

---

*Built at HackOU*
