import type { ARCompanyGroup, ARDetail, AREntry, ARStatus } from '../types/ar'
import { resolvePdfUrl } from '../../../shared/utils/resolvePdfUrl'
import type {
  ArCompanyGroupApi,
  ArDetailApiResponse,
  ArEntryApi,
  ArRowApi,
} from './arApi.types'

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

function rowId(row: ArRowApi): string {
  const raw = row._id
  if (raw != null && typeof raw !== 'object') return String(raw)
  return ''
}

function rowPostingIso(row: ArRowApi): string | undefined {
  const raw = row.businessDate ?? row.invoiceDate ?? row.taxInvoiceDate
  if (raw == null || raw === '') return undefined
  const s = typeof raw === 'string' ? raw : String(raw)
  const d = new Date(s)
  if (!Number.isNaN(d.getTime())) return d.toISOString()
  return s
}

/**
 * Maps one aggregated list row (Ecobillz-shaped) to the UI table row model.
 * `guestId` comes from the parent bucket when the row projection omits it.
 */
export function mapRowApiToEntry(row: ArRowApi, guestIdFromBucket: string): AREntry {
  const id = rowId(row)
  const invoiceNoRaw = row.taxInvoiceNo ?? row.invoiceNo
  const invoiceNo =
    invoiceNoRaw != null && String(invoiceNoRaw).trim() !== ''
      ? String(invoiceNoRaw).trim()
      : '—'

  const amount = Number(row.total ?? 0) || 0
  const status = asStatus(String(row.status ?? 'PENDING'))
  const missingDocs =
    (row.missingChecks ?? 0) > 0 ||
    status === 'MISSING_DOCUMENTS' ||
    status === 'INVOICE_NOT_FOUND'

  const nameParts = [row.fullName, row.companyName].filter(
    (x): x is string => typeof x === 'string' && x.trim() !== '',
  )
  const customer =
    nameParts.join(' · ') ||
    (guestIdFromBucket.trim() !== '' ? guestIdFromBucket : '—')

  const postingDate = rowPostingIso(row)

  return {
    id,
    invoiceNo,
    customer,
    amount,
    status,
    missingDocs,
    confidenceScore: confidenceToPercent(
      row.confidenceScore !== undefined && row.confidenceScore !== null
        ? Number(row.confidenceScore)
        : undefined,
    ),
    ...(postingDate ? { postingDate } : {}),
  }
}

function extractCompanyFinalPdfRaw(group: ArCompanyGroupApi): string | undefined {
  for (const c of group.customer) {
    for (const row of c.rows) {
      const u = row.finalPdfUrl
      if (u != null && String(u).trim() !== '') return String(u).trim()
    }
  }
  return undefined
}

const OBJECT_ID_HEX = /^[a-fA-F0-9]{24}$/

/** Stable representative AR Mongo id for company-level tracking (`GET /tracking/:arId`). */
function pickCompanyTrackingEntryId(group: ArCompanyGroupApi): string | undefined {
  const ids: string[] = []
  for (const c of group.customer) {
    for (const row of c.rows) {
      const raw = row._id
      if (raw != null && typeof raw !== 'object') {
        const id = String(raw).trim()
        if (OBJECT_ID_HEX.test(id)) ids.push(id)
      }
    }
  }
  if (ids.length === 0) return undefined
  ids.sort()
  return ids[0]
}

export function mapCompanyGroupFromApi(group: ArCompanyGroupApi): ARCompanyGroup {
  const identifier = group.identifier != null ? String(group.identifier) : ''
  const guests = group.customer.map((c) => {
    const gid = c.guestId != null ? String(c.guestId) : ''
    return {
      guestId: gid,
      entries: c.rows.map((row) => mapRowApiToEntry(row, gid)),
      count: c.count,
      total: c.total,
    }
  })

  const firstRow = group.customer[0]?.rows[0]
  const fallbackName =
    firstRow && typeof firstRow.companyName === 'string'
      ? firstRow.companyName.trim()
      : firstRow && typeof firstRow.fullName === 'string'
        ? firstRow.fullName.trim()
        : ''

  const label =
    identifier.trim() !== ''
      ? identifier.trim()
      : fallbackName !== ''
        ? fallbackName
        : ''

  const mergedPdfRaw = extractCompanyFinalPdfRaw(group)
  const finalPdfUrl = mergedPdfRaw ? resolvePdfUrl(mergedPdfRaw) : undefined
  const trackingEntryId = pickCompanyTrackingEntryId(group)

  return {
    identifier,
    label,
    guests,
    totalCount: group.totalCount,
    total: group.total,
    ...(finalPdfUrl ? { finalPdfUrl } : {}),
    ...(trackingEntryId ? { trackingEntryId } : {}),
  }
}

export function flattenCompanyGroups(groups: ARCompanyGroup[]): AREntry[] {
  const out: AREntry[] = []
  for (const g of groups) {
    for (const guest of g.guests) {
      out.push(...guest.entries)
    }
  }
  return out
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
