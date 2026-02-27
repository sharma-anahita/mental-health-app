import axios, { AxiosInstance } from 'axios'

const ML_BASE = process.env.ML_SERVICE_URL ?? 'http://localhost:8000'

const client: AxiosInstance = axios.create({
  baseURL: ML_BASE,
  timeout: 8_000,
})

export interface ReflectionResult {
  sentimentScore: number
  sentimentLabel: string
}

export async function analyzeReflection(text: string): Promise<ReflectionResult> {
  if (!text || typeof text !== 'string') {
    throw new TypeError('analyzeReflection: `text` must be a non-empty string')
  }

  try {
    const resp = await client.post('/analyze-reflection', { text })
    const { sentiment_score, sentiment_label } = resp.data ?? {}
    return {
      sentimentScore: Number(sentiment_score ?? 0),
      sentimentLabel: String(sentiment_label ?? 'neutral'),
    }
  } catch (err: any) {
    const detail = err?.response?.data?.detail ?? err?.message ?? 'ML service error'
    throw new Error(`analyzeReflection failed: ${detail}`)
  }
}

export interface TrendResult {
  trend: string
  volatility: string
  riskScore: number
}

export async function analyzeTrend(moods: number[]): Promise<TrendResult> {
  if (!Array.isArray(moods) || moods.length < 2) {
    throw new TypeError('analyzeTrend: `moods` must be an array of at least two numbers')
  }

  try {
    const resp = await client.post('/analyze-trend', { moods })
    const { trend, volatility, risk_score } = resp.data ?? {}
    return {
      trend: String(trend ?? 'flat'),
      volatility: String(volatility ?? 'low'),
      riskScore: Number(risk_score ?? 0),
    }
  } catch (err: any) {
    const detail = err?.response?.data?.detail ?? err?.message ?? 'ML service error'
    throw new Error(`analyzeTrend failed: ${detail}`)
  }
}

export default { analyzeReflection, analyzeTrend }
