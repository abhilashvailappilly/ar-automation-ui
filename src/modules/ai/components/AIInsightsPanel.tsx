import { ReloadOutlined } from '@ant-design/icons'
import { Button, Empty, Progress, Skeleton, Tag, message } from 'antd'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../../shared/store/hooks'
import type { AiCustomerIntent } from '../types/aiAnalysis'
import { clearAnalysis, fetchAnalysis, loadPersistedAiInsights } from '../store/aiSlice'
import { ActionRecommendation } from './ActionRecommendation'
import { InsightCard } from './InsightCard'
import { RiskBadge } from './RiskBadge'

function intentTagProps(intent: AiCustomerIntent): { color: string } {
  const k = String(intent ?? '').toUpperCase()
  if (k === 'PAYMENT') return { color: 'success' }
  if (k === 'DELAY') return { color: 'warning' }
  if (k === 'DISPUTE') return { color: 'error' }
  return { color: 'default' }
}

interface AIInsightsPanelProps {
  /**
   * Anchor AR Mongo ObjectId (same cohort semantics as backend `POST /ai/analyze/ar/:arId`).
   * Typically `trackingEntryId` on the company page.
   */
  anchorArId: string
  embedded?: boolean
}

export function AIInsightsPanel({ anchorArId, embedded }: AIInsightsPanelProps) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const panelRef = useRef<HTMLDivElement>(null)
  const { analysis, loading, error, analysisAnchorArId } = useAppSelector((s) => s.ai)

  useEffect(() => {
    dispatch(clearAnalysis())
    void dispatch(loadPersistedAiInsights(anchorArId))
    return () => {
      dispatch(clearAnalysis())
    }
  }, [anchorArId, dispatch])

  useEffect(() => {
    if (analysis && analysisAnchorArId === anchorArId && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [analysis, analysisAnchorArId, anchorArId])

  const run = async () => {
    try {
      await dispatch(fetchAnalysis({ anchorArId })).unwrap()
      message.success(t('aiInsights.successToast'))
    } catch (err) {
      message.error(typeof err === 'string' ? err : t('aiInsights.errorToast'))
    }
  }

  const shellClass = embedded
    ? 'space-y-4'
    : 'rounded-xl bg-white p-6 shadow-sm transition-shadow duration-200 dark:border dark:border-neutral-800 dark:bg-neutral-900'

  const showResults = Boolean(analysis && analysisAnchorArId === anchorArId)
  const showEmpty = !loading && !showResults && !error

  const source = analysis?.analysisSource
  const sourceTag =
    source === 'ai'
      ? { color: 'processing' as const, label: t('aiInsights.sourceAi') }
      : source === 'fallback'
        ? { color: 'default' as const, label: t('aiInsights.sourceFallback') }
        : source
          ? { color: 'default' as const, label: source }
          : null

  return (
    <div ref={panelRef} className={shellClass}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4 dark:border-neutral-800">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {t('aiInsights.title')}
          </h2>
          {showResults && sourceTag ? <Tag color={sourceTag.color}>{sourceTag.label}</Tag> : null}
          {showResults && analysis?.persisted === true ? (
            <Tag color="success">{t('aiInsights.persisted')}</Tag>
          ) : null}
        </div>
        <Button
          type="default"
          size="small"
          icon={<ReloadOutlined />}
          loading={loading}
          disabled={loading}
          onClick={() => void run()}
        >
          {t('aiInsights.refresh')}
        </Button>
      </div>

      <div className="mt-4 space-y-4 transition-opacity duration-200">
        {loading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : error ? (
          <Empty description={error}>
            <Button type="primary" loading={loading} disabled={loading} onClick={() => void run()}>
              {t('aiInsights.runAnalysis')}
            </Button>
          </Empty>
        ) : showEmpty ? (
          <Empty description={t('aiInsights.empty')}>
            <Button type="primary" loading={loading} disabled={loading} onClick={() => void run()}>
              {t('aiInsights.runAnalysis')}
            </Button>
          </Empty>
        ) : analysis ? (
          <div className="space-y-4 opacity-100 duration-200">
            {analysis.cohortInvoiceCount != null && analysis.cohortInvoiceCount > 0 ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t('aiInsights.cohortHint', { count: analysis.cohortInvoiceCount })}
              </p>
            ) : null}

            <InsightCard title={t('aiInsights.currentStatus')}>
              <p className="text-sm text-neutral-800 dark:text-neutral-200">{analysis.currentStatus}</p>
            </InsightCard>

            <InsightCard title={t('aiInsights.riskLevel')}>
              <RiskBadge level={analysis.riskLevel} />
            </InsightCard>

            <InsightCard title={t('aiInsights.customerIntent')}>
              <Tag {...intentTagProps(analysis.customerIntent)} className="m-0 font-medium uppercase">
                {String(analysis.customerIntent || 'UNKNOWN').replace(/_/g, ' ')}
              </Tag>
            </InsightCard>

            <InsightCard title={t('aiInsights.paymentLikelihood')}>
              <Progress
                percent={analysis.paymentLikelihood}
                status="active"
                strokeColor={{
                  '0%': '#94a3b8',
                  '100%': '#0ea5e9',
                }}
              />
            </InsightCard>

            <InsightCard title={t('aiInsights.summary')}>
              <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {analysis.summary.trim() ? analysis.summary : t('aiInsights.summaryFallback')}
              </p>
            </InsightCard>

            <ActionRecommendation text={analysis.recommendedAction} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
