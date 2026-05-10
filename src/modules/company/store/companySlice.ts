import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../../../shared/api/client'
import { getApiErrorMessage } from '../../../shared/api/getApiErrorMessage'
import type {
  CompanyDeleteApiResponse,
  CompanyListApiResponse,
  CompanySingleApiResponse,
} from '../api/companyApi.types'
import { mapCompanyFromApi } from '../api/mapCompanyFromApi'
import type { Company, CompanyCreatePayload, CompanyUpdatePayload } from '../types/company'

export interface FetchCompaniesArgs {
  page?: number
  limit?: number
  q?: string
}

interface CompanyState {
  items: Company[]
  total: number
  page: number
  limit: number
  /** Last search query used for the active list (not echoed by API). */
  q: string
  loading: boolean
  saving: boolean
}

const initialState: CompanyState = {
  items: [],
  total: 0,
  page: 1,
  limit: 20,
  q: '',
  loading: false,
  saving: false,
}

export const fetchCompanies = createAsyncThunk(
  'company/fetchCompanies',
  async (args: FetchCompaniesArgs | undefined, { rejectWithValue }) => {
    try {
      const page = args?.page ?? 1
      const limit = args?.limit ?? 20
      const q = args?.q?.trim() ?? ''
      const { data } = await api.get<CompanyListApiResponse>('/companies', {
        params: {
          page,
          limit,
          ...(q ? { q } : {}),
        },
      })
      return {
        companies: data.companies.map(mapCompanyFromApi),
        total: data.total,
        page: data.page,
        limit: data.limit,
        q,
      }
    } catch (e) {
      return rejectWithValue(getApiErrorMessage(e, 'fetch_failed'))
    }
  },
)

export const createCompany = createAsyncThunk(
  'company/create',
  async (payload: CompanyCreatePayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post<CompanySingleApiResponse>('/companies', payload)
      return mapCompanyFromApi(data.company)
    } catch (e) {
      return rejectWithValue(getApiErrorMessage(e, 'create_failed'))
    }
  },
)

export const updateCompany = createAsyncThunk(
  'company/update',
  async (
    { id, patch }: { id: string; patch: CompanyUpdatePayload },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.patch<CompanySingleApiResponse>(`/companies/${id}`, patch)
      return mapCompanyFromApi(data.company)
    } catch (e) {
      return rejectWithValue(getApiErrorMessage(e, 'update_failed'))
    }
  },
)

export const deleteCompany = createAsyncThunk(
  'company/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.delete<CompanyDeleteApiResponse>(`/companies/${id}`)
      return data
    } catch (e) {
      return rejectWithValue(getApiErrorMessage(e, 'delete_failed'))
    }
  },
)

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.companies
        state.total = action.payload.total
        state.page = action.payload.page
        state.limit = action.payload.limit
        state.q = action.payload.q
      })
      .addCase(fetchCompanies.rejected, (state) => {
        state.loading = false
        state.items = []
      })
      .addCase(createCompany.pending, (state) => {
        state.saving = true
      })
      .addCase(createCompany.fulfilled, (state) => {
        state.saving = false
      })
      .addCase(createCompany.rejected, (state) => {
        state.saving = false
      })
      .addCase(updateCompany.pending, (state) => {
        state.saving = true
      })
      .addCase(updateCompany.fulfilled, (state) => {
        state.saving = false
      })
      .addCase(updateCompany.rejected, (state) => {
        state.saving = false
      })
      .addCase(deleteCompany.pending, (state) => {
        state.saving = true
      })
      .addCase(deleteCompany.fulfilled, (state) => {
        state.saving = false
      })
      .addCase(deleteCompany.rejected, (state) => {
        state.saving = false
      })
  },
})

export default companySlice.reducer
