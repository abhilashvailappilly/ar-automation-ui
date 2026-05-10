import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getApiErrorMessage } from '../../../shared/api/getApiErrorMessage'
import type { TrackingTimelineApi, TrackingUpdatePayload } from '../api/trackingApi.types'
import { getTracking, postTrackingUpdate } from '../services/trackingApi'

interface TrackingState {
  /** Timeline keyed by AR entry id (`GET /tracking/:arId`). */
  byArId: Record<string, TrackingTimelineApi>
  loadingByArId: Record<string, boolean>
  updating: boolean
}

const initialState: TrackingState = {
  byArId: {},
  loadingByArId: {},
  updating: false,
}

export const fetchTracking = createAsyncThunk(
  'tracking/fetchTracking',
  async (arId: string, { rejectWithValue }) => {
    try {
      return { arId, data: await getTracking(arId) }
    } catch (e) {
      return rejectWithValue(getApiErrorMessage(e, 'fetch_failed'))
    }
  },
)

export const updateTracking = createAsyncThunk(
  'tracking/updateTracking',
  async (payload: TrackingUpdatePayload, { rejectWithValue }) => {
    try {
      await postTrackingUpdate(payload)
      return payload.arId
    } catch (e) {
      return rejectWithValue(getApiErrorMessage(e, 'update_failed'))
    }
  },
)

const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {
    clearTracking: (state) => {
      state.byArId = {}
      state.loadingByArId = {}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTracking.pending, (state, action) => {
        const arId = action.meta.arg
        state.loadingByArId[arId] = true
      })
      .addCase(fetchTracking.fulfilled, (state, action) => {
        const { arId, data } = action.payload
        state.byArId[arId] = data
        delete state.loadingByArId[arId]
      })
      .addCase(fetchTracking.rejected, (state, action) => {
        const arId = action.meta.arg
        delete state.loadingByArId[arId]
        delete state.byArId[arId]
      })
      .addCase(updateTracking.pending, (state) => {
        state.updating = true
      })
      .addCase(updateTracking.fulfilled, (state) => {
        state.updating = false
      })
      .addCase(updateTracking.rejected, (state) => {
        state.updating = false
      })
  },
})

export const { clearTracking } = trackingSlice.actions
export default trackingSlice.reducer
