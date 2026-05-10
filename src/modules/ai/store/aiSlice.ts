import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { getApiErrorMessage } from '../../../shared/api/getApiErrorMessage'
import { analyzeArCustomerCohort, fetchPersistedAiInsightsSnapshot } from '../services/aiApi'
import type { ARAiAnalysis } from '../types/aiAnalysis'

export interface FetchAnalysisArgs {
  /** Anchor AR entry id (24-char hex); server expands to full customer cohort. */
  anchorArId: string
}

export interface AiState {
  analysis: ARAiAnalysis | null
  loading: boolean
  error: string | null
  /** Anchor id for the analysis currently shown (from GET snapshot or POST analyze). */
  analysisAnchorArId: string | null
}

const initialState: AiState = {
  analysis: null,
  loading: false,
  error: null,
  analysisAnchorArId: null,
}

/** Hydrate panel from `GET /ar-entries/:id` → `aiInsights` (persisted agent snapshot). */
export const loadPersistedAiInsights = createAsyncThunk(
  'ai/loadPersistedAiInsights',
  async (anchorArId: string, { rejectWithValue, signal }) => {
    try {
      const analysis = await fetchPersistedAiInsightsSnapshot(anchorArId, { signal })
      return { anchorArId, analysis }
    } catch (e) {
      if (axios.isCancel(e)) throw e
      return rejectWithValue(getApiErrorMessage(e, 'hydrate_failed'))
    }
  },
)

export const fetchAnalysis = createAsyncThunk(
  'ai/fetchAnalysis',
  async ({ anchorArId }: FetchAnalysisArgs, { rejectWithValue, signal }) => {
    try {
      const analysis = await analyzeArCustomerCohort(anchorArId, { signal })
      return { anchorArId, analysis }
    } catch (e) {
      if (axios.isCancel(e)) throw e
      return rejectWithValue(getApiErrorMessage(e, 'analyze_failed'))
    }
  },
)

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearAnalysis: (state) => {
      state.analysis = null
      state.error = null
      state.analysisAnchorArId = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPersistedAiInsights.pending, (state, action) => {
        const id = action.meta.arg
        state.loading = true
        state.error = null
        if (state.analysisAnchorArId !== id) {
          state.analysis = null
          state.analysisAnchorArId = null
        }
      })
      .addCase(loadPersistedAiInsights.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        if (action.payload.analysis) {
          state.analysis = action.payload.analysis
          state.analysisAnchorArId = action.payload.anchorArId
        } else {
          state.analysis = null
          state.analysisAnchorArId = null
        }
      })
      .addCase(loadPersistedAiInsights.rejected, (state, action) => {
        state.loading = false
        if (action.meta.aborted) return
        state.analysis = null
        state.analysisAnchorArId = null
      })
      .addCase(fetchAnalysis.pending, (state, action) => {
        const id = action.meta.arg.anchorArId
        state.loading = true
        state.error = null
        if (state.analysisAnchorArId !== id) {
          state.analysis = null
          state.analysisAnchorArId = null
        }
      })
      .addCase(fetchAnalysis.fulfilled, (state, action) => {
        state.loading = false
        state.analysis = action.payload.analysis
        state.analysisAnchorArId = action.payload.anchorArId
        state.error = null
      })
      .addCase(fetchAnalysis.rejected, (state, action) => {
        state.loading = false
        if (action.meta.aborted) return
        state.error = typeof action.payload === 'string' ? action.payload : 'analyze_failed'
      })
  },
})

export const { clearAnalysis } = aiSlice.actions
export default aiSlice.reducer
