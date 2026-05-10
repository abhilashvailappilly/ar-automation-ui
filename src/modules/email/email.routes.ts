/**
 * Paths relative to the axios client `baseURL` (e.g. `/api/v1`).
 * Mirror these on the backend router mounted for the email module.
 */
export const emailRoutes = {
  threadByArId: (arId: string) => `/email/thread/${encodeURIComponent(arId)}`,
  syncThreadByArId: (arId: string) => `/email/sync-thread/${encodeURIComponent(arId)}`,
} as const
