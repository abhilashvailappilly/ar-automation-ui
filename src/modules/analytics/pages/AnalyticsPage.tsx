import { Spin } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AnalyticsChart } from '../../ar/components/AnalyticsChart'
import { fetchAREntries } from '../../ar/store/arSlice'
import { useAppDispatch, useAppSelector } from '../../../shared/store/hooks'

export function AnalyticsPage() {
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
          {t('analyticsPage.title')}
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {t('analyticsPage.subtitle')}
        </p>
      </section>
      <Spin spinning={loading && list.length === 0}>
        <AnalyticsChart entries={list} />
      </Spin>
    </div>
  )
}
