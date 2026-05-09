export type ApiSuccessEnvelope<T> = {
  success: true
  data: T
}

export type ApiErrorEnvelope = {
  success: false
  error: {
    code: string
    message: string
    requestId?: string
    details?: unknown
  }
}
