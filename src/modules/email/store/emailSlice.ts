import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { getApiErrorMessage } from '../../../shared/api/getApiErrorMessage'
import type { EmailThreadMessage } from '../types/emailThread'
import { getEmailThread, postSyncEmailThread } from '../services/emailApi'

export interface EmailState {
  thread: EmailThreadMessage[]
  loading: boolean
  syncing: boolean
  error: string | null
  /** AR id the current `thread` belongs to; cleared when switching entries mid-fetch */
  threadArId: string | null
}

const initialState: EmailState = {
  thread: [],
  loading: false,
  syncing: false,
  error: null,
  threadArId: null,
}

export const fetchEmailThread = createAsyncThunk(
  'email/fetchEmailThread',
  async (arId: string, { rejectWithValue, signal }) => {
    try {
      const messages = await getEmailThread(arId, { signal })
      return { arId, messages }
    } catch (e) {
      if (axios.isCancel(e)) throw e
      return rejectWithValue(getApiErrorMessage(e, 'fetch_failed'))
    }
  },
)

export const syncEmailThread = createAsyncThunk(
  'email/syncEmailThread',
  async (arId: string, { rejectWithValue, signal }) => {
    try {
      await postSyncEmailThread(arId, { signal })
      const messages = await getEmailThread(arId, { signal })
      return { arId, messages }
    } catch (e) {
      if (axios.isCancel(e)) throw e
      return rejectWithValue(getApiErrorMessage(e, 'sync_failed'))
    }
  },
)

const emailSlice = createSlice({
  name: 'email',
  initialState,
  reducers: {
    clearEmailThread: (state) => {
      state.thread = []
      state.error = null
      state.threadArId = null
      state.loading = false
      state.syncing = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmailThread.pending, (state, action) => {
        const arId = action.meta.arg
        state.loading = true
        state.error = null
        if (state.threadArId !== arId) {
          state.thread = []
          state.threadArId = null
        }
      })
      .addCase(fetchEmailThread.fulfilled, (state, action) => {
        state.loading = false
        state.thread = action.payload.messages
        state.threadArId = action.payload.arId
        state.error = null
      })
      .addCase(fetchEmailThread.rejected, (state, action) => {
        state.loading = false
        if (action.meta.aborted) return
        state.error = typeof action.payload === 'string' ? action.payload : 'fetch_failed'
      })
      .addCase(syncEmailThread.pending, (state) => {
        state.syncing = true
        state.error = null
      })
      .addCase(syncEmailThread.fulfilled, (state, action) => {
        state.syncing = false
        state.thread = action.payload.messages
        state.threadArId = action.payload.arId
        state.error = null
      })
      .addCase(syncEmailThread.rejected, (state, action) => {
        state.syncing = false
        if (action.meta.aborted) return
        state.error = typeof action.payload === 'string' ? action.payload : 'sync_failed'
      })
  },
})

export const { clearEmailThread } = emailSlice.actions
export default emailSlice.reducer
