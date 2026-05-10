import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../../../shared/api/client'
import { getApiErrorMessage } from '../../../shared/api/getApiErrorMessage'
import type {
  ArDetailApiResponse,
  ArListApiResponse,
  ArTriggerRunPayload,
  ArTriggerRunResponse,
} from '../api/arApi.types'
import {
  flattenCompanyGroups,
  mapCompanyGroupFromApi,
  mapDetailFromApi,
} from '../api/mapArFromApi'
import type { ARCompanyGroup, ARDetail, AREntry } from '../types/ar'

export interface AREmailPayload {
  id: string
  subject: string
  body: string
  tone: string
  to?: string
}

export interface ARListMeta {
  /** Paginated identifier (company) bucket count from backend. */
  total: number
  /** Total AR row documents matching filters. */
  arEntryCount: number
  page: number
  limit: number
}

interface ARState {
  /** Company → guest → entries hierarchy from `GET /ar-entries`. */
  groups: ARCompanyGroup[]
  /** Flattened rows for charts and aggregate metrics. */
  list: AREntry[]
  listMeta: ARListMeta | null
  selected: ARDetail | null
  loading: boolean
}

const initialState: ARState = {
  groups: [],
  list: [],
  listMeta: null,
  selected: null,
  loading: false,
}

export const fetchAREntries = createAsyncThunk(
  'ar/fetchAREntries',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<ArListApiResponse>('/ar-entries')
      const groups = data.entries.map(mapCompanyGroupFromApi)
      const list = flattenCompanyGroups(groups)
      return {
        groups,
        list,
        meta: {
          total: data.total,
          arEntryCount: data.arEntryCount,
          page: data.page,
          limit: data.limit,
        } satisfies ARListMeta,
      }
    } catch {
      return rejectWithValue('fetch_failed')
    }
  },
)

export const fetchARDetail = createAsyncThunk(
  'ar/fetchARDetail',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get<ArDetailApiResponse>(`/ar-entries/${id}`)
      return mapDetailFromApi(data)
    } catch {
      return rejectWithValue('fetch_failed')
    }
  },
)

export const triggerArProcessingRun = createAsyncThunk(
  'ar/triggerRun',
  async (body: ArTriggerRunPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post<ArTriggerRunResponse>('/ar-entries/run', body)
      return data
    } catch (e) {
      return rejectWithValue(getApiErrorMessage(e, 'trigger_failed'))
    }
  },
)

export const sendEmail = createAsyncThunk(
  'ar/sendEmail',
  async (payload: AREmailPayload, { rejectWithValue }) => {
    try {
      await api.post(`/ar-entries/${payload.id}/send-email`, {
        to: payload.to,
        subject: payload.subject,
        body: payload.body,
      })
      return payload.id
    } catch {
      return rejectWithValue('send_failed')
    }
  },
)

const arSlice = createSlice({
  name: 'ar',
  initialState,
  reducers: {
    clearSelected: (state) => {
      state.selected = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAREntries.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchAREntries.fulfilled, (state, action) => {
        state.loading = false
        state.groups = action.payload.groups
        state.list = action.payload.list
        state.listMeta = action.payload.meta
      })
      .addCase(fetchAREntries.rejected, (state) => {
        state.loading = false
        state.groups = []
        state.list = []
        state.listMeta = null
      })
      .addCase(fetchARDetail.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchARDetail.fulfilled, (state, action) => {
        state.loading = false
        state.selected = action.payload
      })
      .addCase(fetchARDetail.rejected, (state) => {
        state.loading = false
        state.selected = null
      })
      .addCase(sendEmail.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(sendEmail.pending, (state) => {
        state.loading = true
      })
      .addCase(sendEmail.rejected, (state) => {
        state.loading = false
      })
  },
})

export const { clearSelected } = arSlice.actions
export default arSlice.reducer
