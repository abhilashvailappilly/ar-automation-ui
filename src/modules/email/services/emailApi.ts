import { api } from '../../../shared/api/client'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import { emailRoutes } from '../email.routes'
import type { EmailAiAnalysis, EmailDirection, EmailThreadMessage } from '../types/emailThread'

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function unwrapEnvelope<T>(raw: unknown): T | undefined {
  if (isRecord(raw) && raw.success === true && 'data' in raw) {
    return (raw as ApiSuccessEnvelope<T>).data
  }
  return undefined
}

function pickMessages(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload
  if (!isRecord(payload)) return []
  const nested =
    payload.messages ??
    payload.thread ??
    payload.items ??
    payload.data ??
    payload.results
  if (Array.isArray(nested)) return nested
  if (isRecord(nested) && Array.isArray(nested.messages)) return nested.messages as unknown[]
  return []
}

function str(v: unknown, fallback = ''): string {
  if (v === null || v === undefined) return fallback
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return fallback
}

function mapDirection(raw: unknown): EmailDirection {
  const u = String(raw ?? 'INBOUND').toUpperCase()
  if (u === 'OUTBOUND' || u === 'SENT' || u === 'YOU' || u === 'INTERNAL') return 'OUTBOUND'
  return 'INBOUND'
}

function mapAi(raw: unknown): EmailAiAnalysis | undefined {
  if (!isRecord(raw)) return undefined
  const intent = str(raw.intent ?? raw.Intent, 'QUERY').toUpperCase() as EmailAiAnalysis['intent']
  const summary = str(raw.summary ?? raw.Summary ?? raw.text ?? raw.description)
  if (!summary.trim()) return undefined
  return { intent, summary }
}

function mapMessage(raw: unknown): EmailThreadMessage | null {
  if (!isRecord(raw)) return null
  const direction = mapDirection(raw.direction ?? raw.Direction ?? raw.type)
  const from =
    str(raw.from ?? raw.From ?? raw.sender ?? raw.senderName ?? raw.fromEmail ?? raw.from_address)
  const subject = str(raw.subject ?? raw.Subject ?? raw.title)
  const body = str(raw.body ?? raw.Body ?? raw.text ?? raw.content ?? raw.html ?? raw.message)
  const timestamp = str(
    raw.timestamp ?? raw.Timestamp ?? raw.sentAt ?? raw.createdAt ?? raw.date ?? raw.time,
  )
  if (!from && !subject && !body) return null
  const aiRaw = raw.aiAnalysis ?? raw.ai_analysis ?? raw.analysis ?? raw.insight
  return {
    direction,
    from: from || '—',
    subject: subject || '—',
    body,
    timestamp,
    aiAnalysis: mapAi(aiRaw),
  }
}

export async function getEmailThread(
  arId: string,
  opts?: { signal?: AbortSignal },
): Promise<EmailThreadMessage[]> {
  const { data: raw } = await api.get<unknown>(emailRoutes.threadByArId(arId), {
    signal: opts?.signal,
  })
  const unwrapped = unwrapEnvelope<unknown>(raw) ?? raw
  const list = pickMessages(unwrapped)
  const mapped = list.map(mapMessage).filter((m): m is EmailThreadMessage => m !== null)
  return mapped
}

/** Triggers server-side thread sync for this AR entry, then callers typically refetch the thread. */
export async function postSyncEmailThread(arId: string, opts?: { signal?: AbortSignal }): Promise<void> {
  await api.post(emailRoutes.syncThreadByArId(arId), undefined, {
    signal: opts?.signal,
  })
}
