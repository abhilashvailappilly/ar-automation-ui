import axios from 'axios'
import type { ApiErrorEnvelope } from './types'

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong') {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorEnvelope | undefined
    if (body && typeof body === 'object' && body.success === false && body.error?.message) {
      return body.error.message
    }
    if (error.message) return error.message
  }
  if (error instanceof Error) return error.message
  return fallback
}
