import { NextResponse } from 'next/server'

const getEnv = (key: string) => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing ${key}`)
  }
  return value
}

export const GET = async () => {
  try {
    const apiKey = getEnv('ALPACA_API_KEY')
    const apiSecret = getEnv('ALPACA_SECRET_KEY')
    const baseUrl = getEnv('ALPACA_BASE_URL')

    const response = await fetch(`${baseUrl}/v2/clock`, {
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': apiSecret,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json({ error: text || 'Alpaca error' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
