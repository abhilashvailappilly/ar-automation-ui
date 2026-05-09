import { Spin } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ARTable } from '../components/ARTable'
import { useAppDispatch, useAppSelector } from '../../../shared/store/hooks'
import { fetchAREntries } from '../store/arSlice'

export function AREntriesPage() {
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
          {t('arList.title')}
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {t('arList.subtitle')}
        </p>
      </section>
      <Spin spinning={loading && list.length === 0}>
        <ARTable entries={list} loading={loading && list.length === 0} />
      </Spin>
    </div>
  )
}
