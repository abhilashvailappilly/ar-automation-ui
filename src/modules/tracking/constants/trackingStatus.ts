/** Mirrors ArAutomation `TRACKING_EVENT_STATUS` — valid values for POST /tracking/update. */
export const TRACKING_EVENT_STATUS = {
  COVER_LETTER_GENERATED: 'COVER_LETTER_GENERATED',
  PDF_GENERATED: 'PDF_GENERATED',
  EMAIL_SENT: 'EMAIL_SENT',
  EMAIL_DELIVERED: 'EMAIL_DELIVERED',
  EMAIL_OPENED: 'EMAIL_OPENED',
  RECEIVED_BY_CLIENT: 'RECEIVED_BY_CLIENT',
  CLIENT_RESPONDED: 'CLIENT_RESPONDED',
  PAYMENT_INITIATED: 'PAYMENT_INITIATED',
  PARTIAL_PAYMENT: 'PARTIAL_PAYMENT',
  FULL_PAYMENT_COMPLETED: 'FULL_PAYMENT_COMPLETED',
  ESCALATION_TRIGGERED: 'ESCALATION_TRIGGERED',
} as const

export type TrackingEventStatus =
  (typeof TRACKING_EVENT_STATUS)[keyof typeof TRACKING_EVENT_STATUS]

export const TRACKING_STATUS_OPTIONS: { value: TrackingEventStatus; labelKey: string }[] = [
  { value: 'COVER_LETTER_GENERATED', labelKey: 'tracking.status.COVER_LETTER_GENERATED' },
  { value: 'PDF_GENERATED', labelKey: 'tracking.status.PDF_GENERATED' },
  { value: 'EMAIL_SENT', labelKey: 'tracking.status.EMAIL_SENT' },
  { value: 'EMAIL_DELIVERED', labelKey: 'tracking.status.EMAIL_DELIVERED' },
  { value: 'EMAIL_OPENED', labelKey: 'tracking.status.EMAIL_OPENED' },
  { value: 'RECEIVED_BY_CLIENT', labelKey: 'tracking.status.RECEIVED_BY_CLIENT' },
  { value: 'CLIENT_RESPONDED', labelKey: 'tracking.status.CLIENT_RESPONDED' },
  { value: 'PAYMENT_INITIATED', labelKey: 'tracking.status.PAYMENT_INITIATED' },
  { value: 'PARTIAL_PAYMENT', labelKey: 'tracking.status.PARTIAL_PAYMENT' },
  { value: 'FULL_PAYMENT_COMPLETED', labelKey: 'tracking.status.FULL_PAYMENT_COMPLETED' },
  { value: 'ESCALATION_TRIGGERED', labelKey: 'tracking.status.ESCALATION_TRIGGERED' },
]
