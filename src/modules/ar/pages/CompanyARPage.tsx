import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Empty, Modal, Spin, Table, Tabs, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../shared/store/hooks'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { TrackingTimeline } from '../../tracking/components/TrackingTimeline'
import { TrackingUpdateModal } from '../../tracking/components/TrackingUpdateModal'
import type { TrackingEventStatus } from '../../tracking/constants/trackingStatus'
import { fetchTracking, updateTracking } from '../../tracking/store/trackingSlice'
import { ARStatusTag } from '../components/ARStatusTag'
import { CompanyMergedPdfSection } from '../components/CompanyMergedPdfSection'
import { fetchAREntries } from '../store/arSlice'
import type { ARCompanyGroup, AREntry } from '../types/ar'

function findCompanyGroup(groups: ARCompanyGroup[], canonicalArId: string): ARCompanyGroup | undefined {
  return groups.find(
    (g) =>
      g.trackingEntryId === canonicalArId ||
      g.guests.some((guest) => guest.entries.some((e) => e.id === canonicalArId)),
  )
}

function flattenCompanyEntries(group: ARCompanyGroup): AREntry[] {
  return group.guests.flatMap((g) => g.entries)
}

function postingTs(e: AREntry): number {
  if (!e.postingDate) return 0
  const t = new Date(e.postingDate).getTime()
  return Number.isNaN(t) ? 0 : t
}

function formatPostingDisplay(iso: string | undefined): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(d)
  } catch {
    return iso
  }
}

function formatTrackingTs(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return String(iso)
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d)
  } catch {
    return String(iso)
  }
}

export function CompanyARPage() {
  const { t } = useTranslation()
  const { canonicalArId } = useParams<{ canonicalArId: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { groups, loading: arLoading } = useAppSelector((s) => s.ar)
  const { byArId, loadingByArId, updating } = useAppSelector((s) => s.tracking)

  const [pdfOpen, setPdfOpen] = useState(false)
  const [trackingModalOpen, setTrackingModalOpen] = useState(false)

  useEffect(() => {
    void dispatch(fetchAREntries())
  }, [dispatch])

  useEffect(() => {
    if (!canonicalArId) return
    void dispatch(fetchTracking(canonicalArId))
  }, [canonicalArId, dispatch])

  const group = useMemo(() => {
    if (!canonicalArId) return undefined
    return findCompanyGroup(groups, canonicalArId)
  }, [canonicalArId, groups])

  const trackingArId = group?.trackingEntryId ?? canonicalArId ?? ''
  const trackingData = trackingArId ? byArId[trackingArId] : undefined
  const trackingLoading = trackingArId ? Boolean(loadingByArId[trackingArId]) : false

  const sortedEntries = useMemo(() => {
    if (!group) return []
    const rows = flattenCompanyEntries(group)
    return [...rows].sort((a, b) => postingTs(b) - postingTs(a))
  }, [group])

  const companyTotal = group?.total ?? 0

  const handleTrackingSubmit = async (values: {
    status: TrackingEventStatus
    description?: string
  }) => {
    const arId = trackingArId
    if (!arId) return
    try {
      await dispatch(
        updateTracking({
          arId,
          status: values.status,
          ...(values.description?.trim() ? { description: values.description.trim() } : {}),
        }),
      ).unwrap()
      message.success(t('tracking.updateSuccess'))
      await dispatch(fetchTracking(arId)).unwrap()
    } catch (err) {
      message.error(typeof err === 'string' ? err : t('tracking.updateFailed'))
      throw err
    }
  }

  const postingColumns: ColumnsType<AREntry> = useMemo(
    () => [
      {
        title: t('arTable.invoiceNo'),
        dataIndex: 'invoiceNo',
        key: 'invoiceNo',
        render: (text: string, record) => (
          <Link className="font-medium text-sky-600 hover:text-sky-700" to={`/ar/${record.id}`}>
            {text}
          </Link>
        ),
      },
      {
        title: t('arTable.customer'),
        dataIndex: 'customer',
        key: 'customer',
        ellipsis: true,
      },
      {
        title: t('arTable.amount'),
        dataIndex: 'amount',
        key: 'amount',
        render: (v: number) => formatCurrency(v),
      },
      {
        title: t('arTable.status'),
        dataIndex: 'status',
        key: 'status',
        render: (s: AREntry['status']) => <ARStatusTag status={s} />,
      },
      {
        title: t('companyPage.colPostingDate'),
        dataIndex: 'postingDate',
        key: 'postingDate',
        render: (v: string | undefined) => formatPostingDisplay(v),
        sorter: (a, b) => postingTs(a) - postingTs(b),
        defaultSortOrder: 'descend',
      },
      {
        title: t('arTable.action'),
        key: 'action',
        width: 100,
        render: (_, record) => (
          <Link to={`/ar/${record.id}`}>
            <Button type="link" size="small" className="px-0">
              {t('arTable.view')}
            </Button>
          </Link>
        ),
      },
    ],
    [t],
  )

  if (!canonicalArId) {
    return null
  }

  const ready = !arLoading || groups.length > 0
  const notFound = ready && !group

  return (
    <div className="space-y-6">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/ar')}
        className="-ml-2 text-neutral-600 dark:text-neutral-300"
      >
        {t('companyPage.backToList')}
      </Button>

      <Spin spinning={arLoading && !group}>
        {notFound ? (
          <div className="rounded-xl bg-white p-8 shadow-sm dark:border dark:border-neutral-800 dark:bg-neutral-900">
            <Empty description={t('companyPage.notFound')} />
            <div className="mt-4 text-center">
              <Link to="/ar" className="text-sm text-sky-600 hover:text-sky-700 dark:text-sky-400">
                {t('companyPage.backToList')}
              </Link>
            </div>
          </div>
        ) : group ? (
          <>
            <header className="rounded-xl bg-white p-6 shadow-sm dark:border dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {t('companyPage.companyLabel')}
              </p>
              <h1 className="mt-1 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {group.label || group.identifier || t('arGrouped.noCompanyId')}
              </h1>
              <div className="mt-3 flex flex-wrap gap-6 text-sm text-neutral-600 dark:text-neutral-400">
                <span>{t('companyPage.invoiceCount', { count: group.totalCount })}</span>
                <span>{t('companyPage.amountTotal', { amount: formatCurrency(companyTotal) })}</span>
              </div>
            </header>

            <Tabs
              defaultActiveKey="tracking"
              className="rounded-xl bg-white p-4 shadow-sm dark:border dark:border-neutral-800 dark:bg-neutral-900 [&_.ant-tabs-nav]:mb-4"
              items={[
                {
                  key: 'tracking',
                  label: t('companyPage.tabTracking'),
                  children: (
                    <div className="space-y-6 pt-2">
                      <CompanyMergedPdfSection
                        finalPdfUrl={group.finalPdfUrl}
                        companyLabel={group.label || group.identifier || t('arGrouped.noCompanyId')}
                        onPreview={(_url: string) => {
                          setPdfOpen(true)
                        }}
                      />

                      <div className="rounded-lg border border-neutral-200 bg-neutral-50/90 px-4 py-4 dark:border-neutral-700 dark:bg-neutral-900/60">
                        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                              {t('tracking.sectionTitle')}
                            </h2>
                            {trackingData?.trackingSummary?.trackingLastUpdatedAt ? (
                              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                                {t('arDetail.lastTrackingUpdate')}:{' '}
                                {formatTrackingTs(trackingData.trackingSummary.trackingLastUpdatedAt)}
                              </p>
                            ) : null}
                          </div>
                          {trackingArId ? (
                            <Button type="default" size="small" onClick={() => setTrackingModalOpen(true)}>
                              {t('arDetail.updateTracking')}
                            </Button>
                          ) : null}
                        </div>
                        {trackingArId ? (
                          <TrackingTimeline data={trackingData ?? null} loading={trackingLoading} />
                        ) : (
                          <p className="text-sm text-neutral-500">{t('arGrouped.trackingNoEntryId')}</p>
                        )}
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'posting',
                  label: t('companyPage.tabPosting'),
                  children: (
                    <div className="pt-2">
                      <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
                        {t('companyPage.postingTabHint')}
                      </p>
                      <Table<AREntry>
                        rowKey="id"
                        columns={postingColumns}
                        dataSource={sortedEntries}
                        pagination={{ pageSize: 12, showSizeChanger: false }}
                        scroll={{ x: 900 }}
                      />
                    </div>
                  ),
                },
              ]}
            />

            <Modal
              title={t('arGrouped.previewModalTitle', {
                company: group.label || group.identifier || t('arGrouped.noCompanyId'),
              })}
              open={pdfOpen && Boolean(group.finalPdfUrl)}
              onCancel={() => setPdfOpen(false)}
              footer={null}
              width={880}
              destroyOnHidden
            >
              {group.finalPdfUrl ? (
                <iframe
                  title={t('companyPage.pdfPreviewAria')}
                  src={group.finalPdfUrl}
                  className="mt-2 h-[70vh] w-full rounded-lg border border-neutral-200 dark:border-neutral-700"
                />
              ) : null}
            </Modal>

            <TrackingUpdateModal
              open={trackingModalOpen}
              arId={trackingArId || null}
              submitting={updating}
              onClose={() => setTrackingModalOpen(false)}
              onSubmit={handleTrackingSubmit}
            />
          </>
        ) : null}
      </Spin>
    </div>
  )
}
