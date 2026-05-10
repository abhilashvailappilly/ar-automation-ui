/**
 * ArAutomation stores merged PDFs under `FILES_PUBLIC_PREFIX` (`/api/files/...`).
 * If we build iframe `src` with the API host (e.g. localhost:3001) while the SPA runs on
 * another origin (e.g. localhost:5173), Helmet's default `X-Frame-Options: SAMEORIGIN` blocks
 * embedding and the preview appears blank. Prefer the SPA origin in the browser so `/api`
 * is satisfied via the Vite proxy or same deployment edge routing — same-origin iframe works.
 */
const FILES_PUBLIC_PREFIX = '/api/files'

function getConfiguredApiOrigin(): string | null {
  const base = import.meta.env.VITE_API_BASE_URL?.trim()
  if (base) {
    try {
      return new URL(base).origin
    } catch {
      /* ignore */
    }
  }
  const o = import.meta.env.VITE_API_ORIGIN?.trim()?.replace(/\/$/, '')
  return o || null
}

export function resolvePdfUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  const raw = url.trim()

  const toSpaOrigin = (pathname: string, search: string, hash: string): string | undefined => {
    if (typeof window === 'undefined') return undefined
    if (!pathname.startsWith(`${FILES_PUBLIC_PREFIX}/`)) return undefined
    return `${window.location.origin}${pathname}${search}${hash}`
  }

  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    try {
      const parsed = new URL(raw)
      const apiOrigin = getConfiguredApiOrigin()
      const underPublicFiles = parsed.pathname.startsWith(`${FILES_PUBLIC_PREFIX}/`)
      const knownApiHost =
        apiOrigin === null ? true : parsed.origin === apiOrigin
      if (underPublicFiles && knownApiHost) {
        const rewritten = toSpaOrigin(parsed.pathname, parsed.search, parsed.hash)
        if (rewritten) return rewritten
      }
    } catch {
      return raw
    }
    return raw
  }

  if (typeof window !== 'undefined') {
    if (raw.startsWith('/')) return `${window.location.origin}${raw}`
    return `${window.location.origin}/${raw}`
  }

  const fallback =
    import.meta.env.VITE_PUBLIC_ORIGIN?.trim()?.replace(/\/$/, '') ||
    import.meta.env.VITE_API_ORIGIN?.trim()?.replace(/\/$/, '') ||
    ''
  if (!fallback) return raw.startsWith('/') ? raw : `/${raw}`
  return raw.startsWith('/') ? `${fallback}${raw}` : `${fallback}/${raw}`
}
