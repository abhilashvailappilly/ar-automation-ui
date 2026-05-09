import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../../../shared/api/client'
import { getApiErrorMessage } from '../../../shared/api/getApiErrorMessage'
import { AUTH_TOKEN_KEY } from '../../../shared/constants/authStorage'
import type { AuthUser } from '../types'

interface AuthState {
  token: string | null
  user: AuthUser | null
}

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  } catch {
    return null
  }
}

const initialState: AuthState = {
  token: readStoredToken(),
  user: null,
}

export const login = createAsyncThunk<
  { user: AuthUser; token: string },
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post<{ user: AuthUser; token: string }>(
      '/auth/login',
      credentials,
    )
    return data
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err, 'Login failed'))
  }
})

export const register = createAsyncThunk<
  { user: AuthUser; token: string },
  { email: string; password: string; name?: string },
  { rejectValue: string }
>('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post<{ user: AuthUser; token: string }>(
      '/auth/register',
      payload,
    )
    return data
  } catch (err) {
    return rejectWithValue(getApiErrorMessage(err, 'Registration failed'))
  }
})

export const fetchMe = createAsyncThunk<AuthUser, void, { rejectValue: string }>(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<{ user: AuthUser }>('/auth/me')
      return data.user
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Session expired'))
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null
      state.user = null
      try {
        localStorage.removeItem(AUTH_TOKEN_KEY)
      } catch {
        /* ignore */
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload.token
        state.user = action.payload.user
        try {
          localStorage.setItem(AUTH_TOKEN_KEY, action.payload.token)
        } catch {
          /* ignore */
        }
      })
      .addCase(register.fulfilled, (state, action) => {
        state.token = action.payload.token
        state.user = action.payload.user
        try {
          localStorage.setItem(AUTH_TOKEN_KEY, action.payload.token)
        } catch {
          /* ignore */
        }
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload
      })
      .addCase(fetchMe.rejected, (state) => {
        state.token = null
        state.user = null
        try {
          localStorage.removeItem(AUTH_TOKEN_KEY)
        } catch {
          /* ignore */
        }
      })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer
