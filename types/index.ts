export interface Bar {
  time: number // Unix timestamp in seconds
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type ChartType = 'candlestick' | 'line' | 'area' | 'ohlc' | 'heikin-ashi'
export type Timeframe = '1Min' | '5Min' | '15Min' | '1Hour' | '1Day' | '1Week' | '1Month'
export type WSStatus = 'disconnected' | 'connecting' | 'authenticated' | 'error'
export type RiskProfile = 'low' | 'moderate' | 'high'
export type Signal = 'BUY' | 'SELL' | 'HOLD' | null

export interface CacheEntry {
  bars: Bar[]
  fetchedAt: number
  symbol: string
  timeframe: Timeframe
}

export interface NewsArticle {
  id: number
  headline: string
  summary: string
  author: string
  created_at: string
  updated_at: string
  url: string
  symbols: string[]
  sentiment?: 'positive' | 'negative' | 'neutral'
  sentimentScore?: number
}

export interface GroqAnalysis {
  summary: string
  keyLevels: {
    support: number[]
    resistance: number[]
  }
  trend: 'bullish' | 'bearish' | 'sideways'
  patterns: string[]
  riskNotes: string
  generatedAt: number
  model: string
}

export type GroqStatus = 'idle' | 'loading' | 'done' | 'error'
