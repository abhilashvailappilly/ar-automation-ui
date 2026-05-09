export type ARStatus =
  | 'PENDING'
  | 'INVOICE_NOT_FOUND'
  | 'MISSING_DOCUMENTS'
  | 'READY_FOR_PDF'
  | 'PDF_GENERATED'
  | 'EMAIL_SENT'

export interface ARDocumentStatus {
  invoice: boolean
  checks: boolean
  supporting: boolean
}

export interface AREntry {
  id: string
  invoiceNo: string
  /** Derived display label — backend links merchant/outlet ids when no customer field exists. */
  customer: string
  amount: number
  status: ARStatus
  missingDocs: boolean
  /** 0–100 for UI meters (mapped from API ratio when needed). */
  confidenceScore: number
}

export interface ARDetail extends AREntry {
  documents: ARDocumentStatus
  pdfUrl?: string
}
