import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../../../shared/api/client'
import type { ArDetailApiResponse, ArListApiResponse } from '../api/arApi.types'
import { mapDetailFromApi, mapEntryFromApi } from '../api/mapArFromApi'
import type { ARDetail, AREntry } from '../types/ar'

export interface AREmailPayload {
  id: string
  subject: string
  body: string
  tone: string
  to?: string
}

interface ARState {
  list: AREntry[]
  selected: ARDetail | null
  loading: boolean
}

const initialState: ARState = {
  list: [],
  selected: null,
  loading: false,
}

export const fetchAREntries = createAsyncThunk(
  'ar/fetchAREntries',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<ArListApiResponse>('/ar-entries')
      return data.entries.map(mapEntryFromApi)
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
        state.list = action.payload
      })
      .addCase(fetchAREntries.rejected, (state) => {
        state.loading = false
        state.list = []
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
