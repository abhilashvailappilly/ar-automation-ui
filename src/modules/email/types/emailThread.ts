export type EmailDirection = 'OUTBOUND' | 'INBOUND'

/** Matches backend / AI intent labels; unknown values fall back to default styling */
export type EmailIntentKind = 'PAYMENT' | 'DISPUTE' | 'QUERY' | 'ACKNOWLEDGED' | (string & {})

export interface EmailAiAnalysis {
  intent: EmailIntentKind
  summary: string
}

export interface EmailThreadMessage {
  direction: EmailDirection
  from: string
  subject: string
  body: string
  timestamp: string
  aiAnalysis?: EmailAiAnalysis | null
}
