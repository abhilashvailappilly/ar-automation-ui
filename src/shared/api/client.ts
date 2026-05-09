import axios from 'axios'
import type { ApiSuccessEnvelope } from './types'
import { AUTH_TOKEN_KEY } from '../constants/authStorage'

function readToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  } catch {
    return null
  }
}

function resolveApiBaseURL(): string {
  const explicit = import.meta.env.VITE_API_BASE_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, '')

  const version = import.meta.env.VITE_API_VERSION?.trim() || 'v1'
  const origin = import.meta.env.VITE_API_ORIGIN?.trim().replace(/\/$/, '') ?? ''

  if (origin) return `${origin}/api/${version}`
  return `/api/${version}`
}

const baseURL = resolveApiBaseURL()

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = readToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use((response) => {
  const body = response.data as unknown
  if (
    body !== null &&
    typeof body === 'object' &&
    !Array.isArray(body) &&
    'success' in body &&
    (body as ApiSuccessEnvelope<unknown>).success === true &&
    'data' in body
  ) {
    response.data = (body as ApiSuccessEnvelope<unknown>).data
  }
  return response
})
