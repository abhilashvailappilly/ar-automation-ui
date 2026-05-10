import type { TrackingEventStatus } from '../constants/trackingStatus'

export interface TrackingTimelineEventApi {
  status: string
  label: string
  description: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface TrackingStepperStepApi {
  status: string
  label: string
  state: 'completed' | 'current' | 'pending'
}

export interface TrackingSummaryApi {
  trackingCurrentStatus: string
  trackingLastUpdatedAt: string | null
}

export interface TrackingTimelineApi {
  arEntryId: string
  invoiceNo: string
  timeline: TrackingTimelineEventApi[]
  stepper: TrackingStepperStepApi[]
  extraTimeline: TrackingTimelineEventApi[]
  sla: Record<string, unknown>
  trackingSummary: TrackingSummaryApi
}

export interface TrackingUpdatePayload {
  arId: string
  status: TrackingEventStatus
  label?: string
  description?: string
  metadata?: Record<string, unknown>
}

export interface TrackingUpdateResponseApi {
  event: TrackingTimelineEventApi
}
