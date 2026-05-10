import { api } from '../../../shared/api/client'
import type {
  TrackingTimelineApi,
  TrackingUpdatePayload,
  TrackingUpdateResponseApi,
} from '../api/trackingApi.types'

export async function getTracking(arId: string): Promise<TrackingTimelineApi> {
  const { data } = await api.get<TrackingTimelineApi>(`/tracking/${arId}`)
  return data
}

export async function postTrackingUpdate(
  body: TrackingUpdatePayload,
): Promise<TrackingUpdateResponseApi> {
  const { data } = await api.post<TrackingUpdateResponseApi>('/tracking/update', body)
  return data
}
