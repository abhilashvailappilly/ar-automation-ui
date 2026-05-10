import { ThunderboltOutlined } from '@ant-design/icons'
import { Button, Spin, message } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ARGroupedEntries } from '../components/ARGroupedEntries'
import { ArProcessingRunModal } from '../components/ArProcessingRunModal'
import type { ArTriggerRunPayload } from '../api/arApi.types'
import { useAppDispatch, useAppSelector } from '../../../shared/store/hooks'
import { fetchAREntries, triggerArProcessingRun } from '../store/arSlice'

export function AREntriesPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { groups, loading } = useAppSelector((s) => s.ar)
  const [runModalOpen, setRunModalOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchAREntries())
  }, [dispatch])

  const handleRunSubmit = async (payload: ArTriggerRunPayload) => {
    try {
      const result = await dispatch(triggerArProcessingRun(payload)).unwrap()
      message.success(t('arRun.success', { jobId: String(result.jobId) }))
    } catch (err) {
      message.error(typeof err === 'string' ? err : t('arRun.failed'))
      throw err
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            {t('arList.title')}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {t('arList.subtitle')}
          </p>
        </div>
        <Button type="primary" icon={<ThunderboltOutlined />} onClick={() => setRunModalOpen(true)}>
          {t('arRun.openButton')}
        </Button>
      </section>
      <Spin spinning={loading && groups.length === 0}>
        <ARGroupedEntries groups={groups} loading={loading} />
      </Spin>

      <ArProcessingRunModal
        open={runModalOpen}
        onClose={() => setRunModalOpen(false)}
        onSubmit={handleRunSubmit}
      />
    </div>
  )
}
