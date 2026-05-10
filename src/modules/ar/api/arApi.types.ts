/** Raw AR entry shape from ArAutomation `GET /ar-entries/:id` and detail payloads. */
export interface ArEntryApi {
  id: string
  invoiceNo: string
  invoiceDate?: string
  merchantId?: string
  outletId?: string
  amount: number
  status: string
  invoiceLinked?: boolean
  matchedChecks?: number
  expectedChecks?: number
  missingChecks?: number
  missingCheckNos?: string[]
  /** Backend stores ratio in [0, 1]. */
  confidenceScore?: number
  finalPdfUrl?: string | null
}

/**
 * One row inside a list aggregation bucket (`customer[].rows`).
 * Mirrors `ar-entry.mongo.repository` `$push` projection (amount exposed as `total`).
 */
export interface ArRowApi {
  _id?: string
  invoiceNo?: string
  taxInvoiceNo?: string
  /** Monetary amount (maps from stored `amount`). */
  total?: number
  status?: string
  confidenceScore?: number
  finalPdfUrl?: string | null
  guestId?: string
  fullName?: string
  companyName?: string
  merchantId?: string
  outletId?: string
  invoiceLinked?: boolean
  matchedChecks?: number
  expectedChecks?: number
  missingChecks?: number
  missingCheckNos?: string[]
  businessDate?: string
  invoiceDate?: string
  taxInvoiceDate?: string
  [key: string]: unknown
}

export interface ArCustomerBucketApi {
  guestId?: string
  rows: ArRowApi[]
  count: number
  total: number
}

/** One company / billing-identifier group from list aggregation. */
export interface ArCompanyGroupApi {
  identifier?: string
  customer: ArCustomerBucketApi[]
  totalCount: number
  total: number
}

export interface ArListMetaApi {
  total: number
  arEntryCount: number
  page: number
  limit: number
}

/** List endpoint returns company buckets, not a flat row array. */
export interface ArListApiResponse extends ArListMetaApi {
  entries: ArCompanyGroupApi[]
}

export interface ArDetailApiResponse {
  entry: ArEntryApi
  /** Present when ArAutomation `shapeAiInsights(entry.agentAnalysis)` is non-null. */
  aiInsights?: ArAiInsightsApi | null
  missingDocuments: {
    checkCount: number
    checkNos: string[]
    invoiceLinked: boolean
  }
  confidenceScore: number
  finalPdfUrl?: string | null
}

/** Persisted AI snapshot from `entry.agentAnalysis.lastAnalysis` (detail list shape). */
export interface ArAiInsightsApi {
  updatedAt?: string | null
  source?: string | null
  currentStatus?: string | null
  riskLevel?: string | null
  customerIntent?: string | null
  paymentLikelihood?: number | null
  summary?: string | null
  recommendedAction?: string | null
  customerScope?: Record<string, unknown> | null
  anchorArId?: string | null
  generatedAt?: string | null
}

/** `POST /ar-entries/run` body — matches ArAutomation `triggerRun` validation. */
export interface ArTriggerRunPayload {
  merchantId: string
  outletId: string
  /** ISO 8601 datetime string */
  fromDate?: string
  /** ISO 8601 datetime string */
  toDate?: string
}

export interface ArTriggerRunResponse {
  queued: true
  jobId: string | number
}
