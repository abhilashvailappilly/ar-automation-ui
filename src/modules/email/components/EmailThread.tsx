import { Alert, Skeleton } from 'antd'
import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../../shared/store/hooks'
import { buildPlaceholderEmailMessages } from '../constants/dummyEmailThread'
import { clearEmailThread, fetchEmailThread, syncEmailThread } from '../store/emailSlice'
import { EmailHeader } from './EmailHeader'
import { EmailMessage } from './EmailMessage'

interface EmailThreadProps {
  arId: string
  /** Omit outer card when nested (e.g. company AR tabs). */
  embedded?: boolean
}

export function EmailThread({ arId, embedded }: EmailThreadProps) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { thread, loading, syncing, error, threadArId } = useAppSelector((s) => s.email)

  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const promise = dispatch(fetchEmailThread(arId))
    return () => {
      promise.abort()
      dispatch(clearEmailThread())
    }
  }, [arId, dispatch])

  const handleRefresh = () => {
    void dispatch(fetchEmailThread(arId))
  }

  const handleSync = () => {
    void dispatch(syncEmailThread(arId))
  }

  const placeholderMessages = useMemo(
    () =>
      buildPlaceholderEmailMessages({
        from: t('emailThread.placeholderFrom'),
        subject: t('emailThread.placeholderSubject'),
      }),
    [t],
  )

  const showPlaceholder =
    threadArId === arId && thread.length === 0 && !loading && !error

  const displayMessages = showPlaceholder ? placeholderMessages : threadArId === arId ? thread : []

  useEffect(() => {
    if (!displayMessages.length || threadArId !== arId) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [displayMessages.length, threadArId, arId])

  const showSkeleton = loading && thread.length === 0

  const shellClass = embedded
    ? 'space-y-4'
    : 'rounded-xl bg-white p-6 shadow-sm dark:border dark:border-neutral-800 dark:bg-neutral-900'

  return (
    <div className={shellClass}>
      <EmailHeader loading={loading} syncing={syncing} onRefresh={handleRefresh} onSync={handleSync} />

      {error ? (
        <Alert type="error" message={t('emailThread.loadFailed')} description={error} showIcon className="mt-4" />
      ) : null}

      <div
        ref={scrollRef}
        className="mt-4 max-h-[min(520px,55vh)] overflow-y-auto pr-1"
      >
        {showSkeleton ? (
          <div className="space-y-4 py-2">
            <Skeleton active avatar={{ shape: 'square', size: 'large' }} paragraph={{ rows: 3 }} />
            <Skeleton active avatar={{ shape: 'square', size: 'large' }} paragraph={{ rows: 2 }} />
          </div>
        ) : threadArId === arId && displayMessages.length > 0 ? (
          <div className="flex flex-col gap-4 pb-2">
            {showPlaceholder ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                {t('emailThread.placeholderHint')}
              </p>
            ) : null}
            {displayMessages.map((m, i) => (
              <EmailMessage key={`${m.timestamp}:${i}`} message={m} isLatest={i === displayMessages.length - 1} />
            ))}
            <div ref={bottomRef} className="h-px shrink-0" aria-hidden />
          </div>
        ) : null}
      </div>
    </div>
  )
}
