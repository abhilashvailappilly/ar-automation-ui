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
  /** ISO-ish datetime string from list row `businessDate` / `invoiceDate` / `taxInvoiceDate`. */
  postingDate?: string
}

/** One guest/customer bucket under a billing identifier (company), from list aggregation. */
export interface ARGuestBucket {
  guestId: string
  entries: AREntry[]
  count: number
  total: number
}

/** Company / billing-identifier group from `GET /ar-entries` aggregation. */
export interface ARCompanyGroup {
  /** Raw `billingIdentifier` from backend (may be empty). */
  identifier: string
  /** Best-effort display label: identifier, else first row company name. */
  label: string
  guests: ARGuestBucket[]
  totalCount: number
  total: number
  /**
   * One merged PDF per company (cover letter + bundled invoices); same `finalPdfUrl` on rows after generation.
   * Resolved for same-origin preview where applicable.
   */
  finalPdfUrl?: string
  /**
   * Canonical AR row id for `GET /tracking/:arId` at company scope (backend API is per-entry;
   * we pick a stable representative id for the whole billing group).
   */
  trackingEntryId?: string
}

export interface ARDetail extends AREntry {
  documents: ARDocumentStatus
  pdfUrl?: string
}
