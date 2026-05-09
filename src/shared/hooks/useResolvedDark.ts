import { useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

export function useResolvedDark(themeMode: ThemeMode): boolean {
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false,
  )

  useEffect(() => {
    if (themeMode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemDark(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [themeMode])

  if (themeMode === 'dark') return true
  if (themeMode === 'light') return false
  return systemDark
}
