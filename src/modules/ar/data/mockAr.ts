import type { AREntry, ARDetail } from '../types/ar'

/** Legacy fixture data — kept for local UI experiments only (not wired into slices). */
export const MOCK_AR_ENTRIES: AREntry[] = [
  {
    id: '1',
    invoiceNo: 'INV-1042',
    customer: 'Northwind Trading',
    amount: 12450.0,
    status: 'READY_FOR_PDF',
    missingDocs: false,
    confidenceScore: 94,
  },
  {
    id: '2',
    invoiceNo: 'INV-1043',
    customer: 'Blue Harbor LLC',
    amount: 8320.5,
    status: 'PENDING',
    missingDocs: true,
    confidenceScore: 62,
  },
  {
    id: '3',
    invoiceNo: 'INV-1044',
    customer: 'Summit Retail Co.',
    amount: 21990.0,
    status: 'PDF_GENERATED',
    missingDocs: false,
    confidenceScore: 88,
  },
  {
    id: '4',
    invoiceNo: 'INV-1045',
    customer: 'Riverstone Foods',
    amount: 5675.25,
    status: 'MISSING_DOCUMENTS',
    missingDocs: true,
    confidenceScore: 41,
  },
  {
    id: '5',
    invoiceNo: 'INV-1046',
    customer: 'Silverline Media',
    amount: 9900.0,
    status: 'INVOICE_NOT_FOUND',
    missingDocs: true,
    confidenceScore: 0,
  },
]

const detailBase = new Map(
  MOCK_AR_ENTRIES.map((e) => [e.id, e] as const),
)

export function getMockARDetail(id: string): ARDetail | undefined {
  const base = detailBase.get(id)
  if (!base) return undefined
  const documents =
    base.status === 'MISSING_DOCUMENTS'
      ? { invoice: true, checks: false, supporting: false }
      : base.missingDocs
        ? { invoice: true, checks: true, supporting: false }
        : { invoice: true, checks: true, supporting: true }
  return {
    ...base,
    documents,
    pdfUrl:
      base.status === 'PDF_GENERATED'
        ? 'https://www.w3.org/WAI/WCAG21/working-examples/pdf-note/note.pdf'
        : undefined,
  }
}
