import { Spin } from 'antd'
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { fetchMe } from '../../modules/auth/store/authSlice'
import { BrandLogo } from '../components/BrandLogo'
import { useAppDispatch, useAppSelector } from '../store/hooks'

/**
 * When a stored JWT exists, validates it with `GET /auth/me` before rendering protected routes.
 */
export function SessionGate() {
  const dispatch = useAppDispatch()
  const token = useAppSelector((s) => s.auth.token)
  const [sessionValidated, setSessionValidated] = useState(() => !token)

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false
    void dispatch(fetchMe())
      .unwrap()
      .catch(() => {
        /* auth slice clears invalid token */
      })
      .finally(() => {
        if (!cancelled) setSessionValidated(true)
      })

    return () => {
      cancelled = true
    }
  }, [dispatch, token])

  const busy = Boolean(token) && !sessionValidated

  if (busy) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#f5f7fb] dark:bg-neutral-950">
        <BrandLogo className="h-[4.5rem] w-auto max-w-[min(90vw,20rem)] object-contain opacity-95 sm:h-[5.5rem] sm:max-w-[22rem]" />
        <Spin size="large" />
      </div>
    )
  }

  return <Outlet />
}
