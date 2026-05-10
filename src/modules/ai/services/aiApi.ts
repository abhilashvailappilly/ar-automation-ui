import { api } from '../../../shared/api/client'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import type { ArAiInsightsApi, ArDetailApiResponse } from '../../ar/api/arApi.types'
import { aiRoutes } from '../ai.routes.js'
import type { ARAiAnalysis } from '../types/aiAnalysis'

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function unwrapEnvelope<T>(raw: unknown): T | undefined {
  if (isRecord(raw) && raw.success === true && 'data' in raw) {
    return (raw as ApiSuccessEnvelope<T>).data
  }
  return undefined
}

function str(v: unknown, fallback = ''): string {
  if (v === null || v === undefined) return fallback
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return fallback
}

function num(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number.parseFloat(v)
    return Number.isFinite(n) ? n : fallback
  }
  return fallback
}

/**
 * ArAutomation returns flat analysis fields inside envelope `data`, alongside
 * `anchorArId`, `customerScope`, `source`, `persisted`, etc.
 */
function pickPayload(raw: unknown): Record<string, unknown> | undefined {
  const inner = unwrapEnvelope<unknown>(raw) ?? raw
  if (!isRecord(inner)) return undefined

  const hasFlatAnalysis =
    'riskLevel' in inner ||
    'customerIntent' in inner ||
    'paymentLikelihood' in inner ||
    ('summary' in inner && 'recommendedAction' in inner) ||
    'currentStatus' in inner

  if (hasFlatAnalysis) return inner

  const nestedCandidates = [
    inner.insights,
    inner.agenticAnalysis,
    inner.agentic_analysis,
    inner.agentOutput,
    inner.agent_output,
    inner.analysis,
    inner.result,
    inner.payload,
  ]

  for (const c of nestedCandidates) {
    if (isRecord(c)) return c as Record<string, unknown>
  }

  return inner
}

function clampPct(v: number): number {
  if (!Number.isFinite(v)) return 0
  let x = v
  if (x <= 1 && x >= 0) x *= 100
  return Math.min(100, Math.max(0, Math.round(x)))
}

function joinActionItems(raw: unknown): string {
  if (!Array.isArray(raw)) return ''
  const parts = raw
    .map((item) => {
      if (typeof item === 'string') return item.trim()
      if (isRecord(item)) return str(item.text ?? item.action ?? item.label ?? item.step).trim()
      return ''
    })
    .filter(Boolean)
  return parts.join(' · ')
}

export function mapApiToAnalysis(payload: Record<string, unknown>): ARAiAnalysis {
  const riskRaw = str(
    payload.riskLevel ?? payload.risk_level ?? payload.risk ?? payload.riskTier ?? payload.risk_tier,
    'LOW',
  ).toUpperCase()

  const intentRaw = str(
    payload.customerIntent ??
      payload.customer_intent ??
      payload.intent ??
      payload.predictedIntent ??
      payload.predicted_intent ??
      'UNKNOWN',
  ).toUpperCase()

  const recommendedFromArray = joinActionItems(
    payload.actionItems ?? payload.action_items ?? payload.recommendations ?? payload.nextSteps ?? payload.next_steps,
  )

  const recommendedSingle = str(
    payload.recommendedAction ??
      payload.recommended_action ??
      payload.recommendation ??
      payload.primaryRecommendation ??
      payload.primary_recommendation ??
      payload.action ??
      payload.next_step ??
      payload.nextStep ??
      '',
  ).trim()

  const cs = payload.customerScope
  let cohortInvoiceCount: number | undefined
  if (isRecord(cs)) {
    const n = num(cs.arEntryCount)
    if (n > 0) cohortInvoiceCount = Math.round(n)
  }

  return {
    currentStatus: str(
      payload.currentStatus ??
        payload.current_status ??
        payload.status ??
        payload.operationalStatus ??
        '—',
      '—',
    ),
    riskLevel: riskRaw || 'LOW',
    customerIntent: intentRaw || 'UNKNOWN',
    paymentLikelihood: clampPct(
      num(
        payload.paymentLikelihood ??
          payload.payment_likelihood ??
          payload.paymentConfidence ??
          payload.payment_probability,
      ),
    ),
    summary: str(
      payload.summary ??
        payload.summaryText ??
        payload.executiveSummary ??
        payload.executive_summary ??
        '',
    ),
    recommendedAction: recommendedSingle || recommendedFromArray,
    analysisSource: str(payload.source ?? '').trim() || undefined,
    persisted: typeof payload.persisted === 'boolean' ? payload.persisted : undefined,
    anchorArId: str(payload.anchorArId ?? '').trim() || undefined,
    cohortInvoiceCount,
  }
}

/**
 * POST `/api/v1/ai/analyze/ar/:arId` — cohort analysis anchored on one AR row (Mongo ObjectId).
 * Body empty; backend resolves merchant/outlet + billing bucket + cohort entries.
 */
export async function analyzeArCustomerCohort(
  anchorArId: string,
  opts?: { signal?: AbortSignal },
): Promise<ARAiAnalysis> {
  const { data: raw } = await api.post<unknown>(
    aiRoutes.analyzeArByAnchorId(anchorArId),
    {},
    { signal: opts?.signal },
  )
  const picked = pickPayload(raw)
  if (!picked) {
    return mapApiToAnalysis(isRecord(raw) ? (raw as Record<string, unknown>) : {})
  }
  return mapApiToAnalysis(picked)
}

/** Map GET `/ar-entries/:id` → `aiInsights` into the same UI model as POST analyze. */
export function mapAiInsightsSnapshotToAnalysis(insights: ArAiInsightsApi): ARAiAnalysis {
  const payload = { ...insights } as Record<string, unknown>
  return { ...mapApiToAnalysis(payload), persisted: true }
}

/** Loads persisted cohort analysis stored on AR rows (no POST). Returns null if none. */
export async function fetchPersistedAiInsightsSnapshot(
  anchorArId: string,
  opts?: { signal?: AbortSignal },
): Promise<ARAiAnalysis | null> {
  const { data } = await api.get<ArDetailApiResponse>(`/ar-entries/${encodeURIComponent(anchorArId)}`, {
    signal: opts?.signal,
  })
  const insights = data.aiInsights
  if (!insights) return null
  return mapAiInsightsSnapshotToAnalysis(insights)
}
