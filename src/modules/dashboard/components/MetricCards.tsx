import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileSearchOutlined,
} from '@ant-design/icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { AREntry } from '../../ar/types/ar'

function RupeeIcon() {
  return <span aria-hidden className="font-semibold leading-none">₹</span>
}

interface MetricCardsProps {
  entries: AREntry[]
}

export function MetricCards({ entries }: MetricCardsProps) {
  const { t } = useTranslation()

  const totalAR = entries.reduce((s, e) => s + e.amount, 0)
  const pending = entries.filter((e) => e.status === 'PENDING').length
  const missingDocs = entries.filter((e) => e.missingDocs).length
  const processedToday = entries.filter(
    (e) => e.status === 'PDF_GENERATED' || e.status === 'EMAIL_SENT',
  ).length

  const cards = useMemo(
    () => [
      {
        key: 'totalAr',
        title: t('metrics.totalArAmount'),
        value: formatCurrency(totalAR, { maximumFractionDigits: 0 }),
        trend: t('metrics.totalArTrend'),
        icon: <RupeeIcon />,
        circle: 'bg-sky-100 text-sky-600',
      },
      {
        key: 'pending',
        title: t('metrics.pendingInvoices'),
        value: String(pending),
        trend: t('metrics.pendingTrend', { count: pending }),
        icon: <ClockCircleOutlined />,
        circle: 'bg-amber-100 text-amber-600',
      },
      {
        key: 'missing',
        title: t('metrics.missingDocuments'),
        value: String(missingDocs),
        trend: missingDocs ? t('metrics.needsAttention') : t('metrics.allComplete'),
        icon: <FileSearchOutlined />,
        circle: 'bg-rose-100 text-rose-600',
      },
      {
        key: 'processed',
        title: t('metrics.processedToday'),
        value: String(processedToday),
        trend: t('metrics.processedTrend'),
        icon: <CheckCircleOutlined />,
        circle: 'bg-emerald-100 text-emerald-600',
      },
    ],
    [missingDocs, pending, processedToday, t, totalAR],
  )

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, title, value, trend, icon, circle }) => (
        <div
          key={key}
          className="rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex flex-col gap-4">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${circle}`}
            >
              <span className="text-lg">{icon}</span>
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                {value}
              </p>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{trend}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
