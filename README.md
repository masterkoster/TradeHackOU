# TradeHackOU

Single-page trading dashboard built for a hackathon. Live/historical market data from Alpaca Markets, FinBERT sentiment scoring, AI-powered chart analysis via Groq, and real-time WebSocket bars.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16, React 18, TypeScript 5 (strict) |
| Styling | Tailwind CSS v4, shadcn/ui |
| Charting | lightweight-charts v4 |
| Market Data | Alpaca Markets REST + WebSocket |
| Sentiment | HuggingFace FinBERT (ProsusAI) |
| AI Analysis | Groq `llama-3.3-70b-versatile` |

## Features

- 5 chart types: Candlestick, Line, Area, OHLC, Heikin-Ashi
- Volume histogram pane
- Live bar streaming via Alpaca WebSocket
- 5-minute in-memory data cache with stale-data banner
- BUY / SELL / HOLD signal from FinBERT sentiment × risk profile
- AI historical analysis panel (Groq) with key levels, patterns, risk notes
- 3 risk profiles: Low, Moderate, High

## Setup

1. Install dependencies

```bash
npm install
```

2. Copy the env template and fill in your keys

```bash
cp .env.local.example .env.local
```

Required keys:

| Variable | Source |
|---|---|
| `ALPACA_API_KEY` | Alpaca paper account |
| `ALPACA_SECRET_KEY` | Alpaca paper account |
| `ALPACA_BASE_URL` | `https://paper-api.alpaca.markets` |
| `ALPACA_DATA_URL` | `https://data.alpaca.markets` |
| `ALPACA_FEED` | `iex` |
| `NEXT_PUBLIC_ALPACA_API_KEY` | Same paper key (for WebSocket) |
| `NEXT_PUBLIC_ALPACA_SECRET_KEY` | Same paper secret (for WebSocket) |
| `NEXT_PUBLIC_ALPACA_STREAM_URL` | `wss://stream.data.alpaca.markets/v2/iex` |
| `NEXT_PUBLIC_ALPACA_FEED` | `iex` |
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage key |
| `GROQ_API_KEY` | Groq API key |

3. Run the dev server

```bash
npm run dev
```

## Project Structure

```
app/
  api/alpaca/
    bars/        ← historical bar proxy
    news/        ← news proxy
    quote/       ← latest quote proxy
    account/     ← account status
  page.tsx       ← dashboard root
components/
  trading-dashboard.tsx   ← main wiring component
  chart.tsx               ← lightweight-charts
  controls.tsx            ← symbol / timeframe / chart type / risk
  historic-analysis.tsx   ← Groq AI panel
  stale-banner.tsx
  ws-status-dot.tsx
  risk-profile.tsx
hooks/
  useBars.ts
  useWebSocket.ts
  useGroqAnalysis.ts
lib/
  alpacaClient.ts
  dataCache.ts
  groqClient.ts
  sentimentClient.ts
  historicAnalysis.ts
  heikinAshi.ts
  signal.ts
types/
  index.ts
```
