export async function analyzeSentiment(
  texts: string[]
): Promise<Array<{ label: string; score: number }>> {
  const apiKey = process.env.NEXT_PUBLIC_HF_API_KEY
  if (!apiKey) throw new Error('HuggingFace API key not configured')

  const res = await fetch('https://api-inference.huggingface.co/models/ProsusAI/finbert', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: texts }),
  })

  if (!res.ok) throw new Error('Sentiment analysis failed')
  const data = await res.json() as Array<Array<{ label: string; score: number }>>
  return data.map((results) => results.reduce((best, cur) => (cur.score > best.score ? cur : best)))
}
