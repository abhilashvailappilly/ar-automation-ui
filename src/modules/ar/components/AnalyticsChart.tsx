import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { AREntry } from '../types/ar'

interface AnalyticsChartProps {
  entries: AREntry[]
}

export function AnalyticsChart({ entries }: AnalyticsChartProps) {
  const { t } = useTranslation()

  const pending = entries.filter((e) => e.status === 'PENDING').length
  const invoiceMissing = entries.filter((e) => e.status === 'INVOICE_NOT_FOUND').length
  const ready = entries.filter((e) => e.status === 'READY_FOR_PDF').length
  const pdfDone = entries.filter((e) => e.status === 'PDF_GENERATED').length
  const missing = entries.filter((e) => e.status === 'MISSING_DOCUMENTS').length
  const emailed = entries.filter((e) => e.status === 'EMAIL_SENT').length

  const data = useMemo(
    () => [
      { name: t('chart.pending'), count: pending },
      { name: t('chart.noInvoice'), count: invoiceMissing },
      { name: t('chart.ready'), count: ready },
      { name: t('chart.pdfDone'), count: pdfDone },
      { name: t('chart.missingDocs'), count: missing },
      { name: t('chart.emailed'), count: emailed },
    ],
    [emailed, invoiceMissing, missing, pdfDone, pending, ready, t],
  )

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
        {t('chart.arOverviewTitle')}
      </h2>
      <div className="mt-6 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#737373', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={56}
            />
            <YAxis
              tick={{ fill: '#737373', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e5e7eb',
              }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
