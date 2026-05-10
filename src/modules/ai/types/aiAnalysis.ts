export type AiRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | string

export type AiCustomerIntent = 'PAYMENT' | 'DELAY' | 'DISPUTE' | 'UNKNOWN' | string

export interface ARAiAnalysis {
  currentStatus: string
  riskLevel: AiRiskLevel
  customerIntent: AiCustomerIntent
  /** 0–100 */
  paymentLikelihood: number
  summary: string
  recommendedAction: string
  /** Present when mapped from ArAutomation analyze response (`data.source`). */
  analysisSource?: string
  persisted?: boolean
  anchorArId?: string
  /** From `data.customerScope.arEntryCount` when present. */
  cohortInvoiceCount?: number
}
