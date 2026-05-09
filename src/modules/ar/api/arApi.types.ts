/** Raw AR entry shape from ArAutomation `GET /ar-entries` list items. */
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

export interface ArListApiResponse {
  entries: ArEntryApi[]
  total: number
  page: number
  limit: number
}

export interface ArDetailApiResponse {
  entry: ArEntryApi
  missingDocuments: {
    checkCount: number
    checkNos: string[]
    invoiceLinked: boolean
  }
  confidenceScore: number
  finalPdfUrl?: string | null
}
