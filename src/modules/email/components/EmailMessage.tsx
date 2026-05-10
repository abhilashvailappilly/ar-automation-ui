import { Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import type { EmailIntentKind, EmailThreadMessage } from '../types/emailThread'

interface EmailMessageProps {
  message: EmailThreadMessage
  isLatest?: boolean
}

function intentTagColor(intent: EmailIntentKind): string {
  const k = String(intent).toUpperCase()
  switch (k) {
    case 'PAYMENT':
      return 'success'
    case 'DISPUTE':
      return 'error'
    case 'QUERY':
      return 'warning'
    case 'ACKNOWLEDGED':
      return 'processing'
    default:
      return 'default'
  }
}

function formatWhen(iso: string): string {
  if (!iso.trim()) return ''
  const d = new Date(iso)
  if (!Number.isNaN(d.getTime())) {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(d)
  }
  return iso
}

export function EmailMessage({ message, isLatest }: EmailMessageProps) {
  const { t } = useTranslation()
  const outbound = message.direction === 'OUTBOUND'

  const alignment = outbound ? 'justify-end' : 'justify-start'
  const bubbleBg = outbound
    ? 'bg-sky-50 text-neutral-900 dark:bg-sky-950/45 dark:text-neutral-100'
    : 'bg-white text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'

  const ringClass = isLatest ? 'ring-2 ring-sky-400/80 ring-offset-2 ring-offset-neutral-50 dark:ring-sky-500/70 dark:ring-offset-neutral-950' : ''

  const ai = message.aiAnalysis
  const intentLabel = ai?.intent ? String(ai.intent).replace(/_/g, ' ') : ''

  return (
    <div className={`flex w-full ${alignment}`}>
      <div
        className={`max-w-[70%] rounded-xl p-4 shadow-sm ${bubbleBg} ${ringClass}`}
        data-latest={isLatest ? 'true' : undefined}
      >
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
            {message.from}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">{formatWhen(message.timestamp)}</span>
        </div>
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">{message.subject}</p>
        <div className="mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
          {message.body || '—'}
        </div>

        {ai?.intent && ai.summary ? (
          <div className="mt-4 border-t border-neutral-200/80 pt-3 dark:border-neutral-600/80">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {t('emailThread.intentLabel')}
              </span>
              <Tag color={intentTagColor(ai.intent)} className="m-0">
                {intentLabel}
              </Tag>
            </div>
            <p className="text-xs leading-snug text-neutral-600 dark:text-neutral-300">{ai.summary}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
