/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Full JSON API base URL; overrides `VITE_API_ORIGIN` + `VITE_API_VERSION` when set */
  readonly VITE_API_BASE_URL?: string
  /** API server origin, no trailing slash (e.g. http://localhost:3001) */
  readonly VITE_API_ORIGIN?: string
  /** API path segment after `/api/` (e.g. v1) */
  readonly VITE_API_VERSION?: string
  /** Optional origin for resolving relative `/api/files/...` PDF URLs */
  readonly VITE_PUBLIC_ORIGIN?: string
}
