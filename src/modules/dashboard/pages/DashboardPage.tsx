import { Spin } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ARTable } from '../../ar/components/ARTable'
import { AnalyticsChart } from '../../ar/components/AnalyticsChart'
import { fetchAREntries } from '../../ar/store/arSlice'
import { useAppDispatch, useAppSelector } from '../../../shared/store/hooks'
import { MetricCards } from '../components/MetricCards'
import { RecentActivity } from '../components/RecentActivity'

export function DashboardPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { list, loading } = useAppSelector((s) => s.ar)

  useEffect(() => {
    dispatch(fetchAREntries())
  }, [dispatch])

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          {t('dashboard.title')}
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {t('dashboard.subtitle')}
        </p>
      </section>

      <Spin spinning={loading && list.length === 0}>
        <div className="space-y-6">
          <MetricCards entries={list} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AnalyticsChart entries={list} />
            </div>
            <div className="lg:col-span-1">
              <RecentActivity entries={list} />
            </div>
          </div>
          <section>
            <h2 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {t('dashboard.arEntriesHeading')}
            </h2>
            <ARTable entries={list} loading={loading && list.length === 0} />
          </section>
        </div>
      </Spin>
    </div>
  )
}
