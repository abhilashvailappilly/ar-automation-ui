import type { ARDetail, AREntry, ARStatus } from '../types/ar'
import type { ArDetailApiResponse, ArEntryApi } from './arApi.types'

const KNOWN_STATUSES = new Set<string>([
  'PENDING',
  'INVOICE_NOT_FOUND',
  'MISSING_DOCUMENTS',
  'READY_FOR_PDF',
  'PDF_GENERATED',
  'EMAIL_SENT',
])

function asStatus(raw: string): ARStatus {
  if (KNOWN_STATUSES.has(raw)) return raw as ARStatus
  return 'PENDING'
}

/** Backend confidence is [0, 1]; UI progress bars expect 0–100. */
export function confidenceToPercent(raw: number | undefined): number {
  if (raw === undefined || Number.isNaN(raw)) return 0
  const n = Number(raw)
  if (n <= 1 && n >= 0) return Math.round(n * 100)
  return Math.round(Math.min(100, Math.max(0, n)))
}

function shortId(id: string | undefined, len = 6) {
  if (!id) return '—'
  const s = String(id)
  return s.length <= len ? s : `${s.slice(0, len)}…`
}

export function mapEntryFromApi(entry: ArEntryApi): AREntry {
  const missingDocs =
    (entry.missingChecks ?? 0) > 0 ||
    entry.status === 'MISSING_DOCUMENTS' ||
    entry.status === 'INVOICE_NOT_FOUND'

  const merchant = entry.merchantId ? shortId(entry.merchantId) : ''
  const outlet = entry.outletId ? shortId(entry.outletId) : ''
  const customer =
    merchant && outlet ? `${merchant} · ${outlet}` : merchant || outlet || '—'

  return {
    id: entry.id,
    invoiceNo: entry.invoiceNo,
    customer,
    amount: Number(entry.amount) || 0,
    status: asStatus(entry.status),
    missingDocs,
    confidenceScore: confidenceToPercent(entry.confidenceScore),
  }
}

export function resolvePdfUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const origin =
    import.meta.env.VITE_PUBLIC_ORIGIN ??
    import.meta.env.VITE_API_ORIGIN ??
    (typeof window !== 'undefined' ? window.location.origin : '')
  if (url.startsWith('/')) return `${origin}${url}`
  return `${origin}/${url}`
}

export function mapDetailFromApi(res: ArDetailApiResponse): ARDetail {
  const row = mapEntryFromApi(res.entry)
  const md = res.missingDocuments
  const entry = res.entry

  const invoicePresent = md.invoiceLinked ?? entry.invoiceLinked ?? false
  const checksPresent =
    (entry.expectedChecks ?? 0) === 0
      ? invoicePresent
      : (entry.matchedChecks ?? 0) >= (entry.expectedChecks ?? 0)
  const supportingPresent =
    entry.status !== 'MISSING_DOCUMENTS' && entry.status !== 'INVOICE_NOT_FOUND'

  return {
    ...row,
    confidenceScore: confidenceToPercent(res.confidenceScore ?? entry.confidenceScore),
    documents: {
      invoice: invoicePresent,
      checks: checksPresent,
      supporting: supportingPresent,
    },
    pdfUrl: resolvePdfUrl(res.finalPdfUrl ?? entry.finalPdfUrl ?? undefined),
  }
}
