import { useTranslation } from 'react-i18next'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { ARStatusTag } from '../../ar/components/ARStatusTag'
import type { AREntry } from '../../ar/types/ar'

interface RecentActivityProps {
  entries: AREntry[]
}

export function RecentActivity({ entries }: RecentActivityProps) {
  const { t } = useTranslation()
  const rows = entries.slice(0, 5)

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{t('recentActivity.title')}</h2>
      <ul className="mt-4 flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {row.invoiceNo}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{formatCurrency(row.amount)}</p>
            </div>
            <ARStatusTag status={row.status} />
          </li>
        ))}
      </ul>
    </div>
  )
}
