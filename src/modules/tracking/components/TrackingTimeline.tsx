import { Empty, Skeleton, Timeline } from 'antd'
import type { TimelineProps } from 'antd'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { TrackingTimelineApi } from '../api/trackingApi.types'

function formatTs(iso: string | undefined): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d)
  } catch {
    return iso
  }
}

function stepColor(state: string): NonNullable<TimelineProps['items']>[number]['color'] {
  if (state === 'completed') return 'green'
  if (state === 'current') return 'blue'
  return 'gray'
}

interface TrackingTimelineProps {
  data: TrackingTimelineApi | null
  loading: boolean
}

export function TrackingTimeline({ data, loading }: TrackingTimelineProps) {
  const { t } = useTranslation()

  const mainItems: TimelineProps['items'] = useMemo(() => {
    if (!data?.stepper?.length) return []
    return data.stepper.map((step) => {
      const evt = data.timeline.find((e) => e.status === step.status)
      return {
        color: stepColor(step.state),
        children: (
          <div className="pb-1">
            <p className="font-medium text-neutral-900 dark:text-neutral-100">{step.label}</p>
            <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
              {evt?.description ??
                (step.state === 'pending' ? t('tracking.stepPending') : '')}
            </p>
            {evt?.timestamp ? (
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {formatTs(evt.timestamp)}
              </p>
            ) : null}
          </div>
        ),
      }
    })
  }, [data, t])

  const extraItems: TimelineProps['items'] = useMemo(() => {
    if (!data?.extraTimeline?.length) return []
    return data.extraTimeline.map((evt, i) => ({
      key: `extra-${i}-${evt.timestamp}`,
      color: 'green',
      children: (
        <div className="pb-1">
          <p className="font-medium text-neutral-900 dark:text-neutral-100">{evt.label}</p>
          <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">{evt.description}</p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{formatTs(evt.timestamp)}</p>
        </div>
      ),
    }))
  }, [data])

  if (loading && !data) {
    return (
      <div className="py-2">
        <Skeleton active paragraph={{ rows: 8 }} title={{ width: '40%' }} />
      </div>
    )
  }

  if (!data) {
    return <Empty description={t('tracking.timelineUnavailable')} />
  }

  return (
    <div className="space-y-6">
      <Timeline items={mainItems} />
      {extraItems.length > 0 ? (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {t('tracking.extraEvents')}
          </p>
          <Timeline items={extraItems} />
        </div>
      ) : null}
    </div>
  )
}
