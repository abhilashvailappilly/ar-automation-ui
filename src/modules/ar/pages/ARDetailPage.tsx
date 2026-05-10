import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Modal, Progress, Spin } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../shared/store/hooks'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { EmailDrawer } from '../components/EmailDrawer'
import { ARStatusTag } from '../components/ARStatusTag'
import { clearSelected, fetchARDetail } from '../store/arSlice'

const EMAIL_ALLOWED_STATUSES = new Set(['PDF_GENERATED'])

function DocLine({
  label,
  present,
  missingSuffix,
}: {
  label: string
  present: boolean
  missingSuffix: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span
        className={
          present
            ? 'text-sm text-neutral-800 dark:text-neutral-200'
            : 'text-sm font-medium text-red-600 dark:text-red-400'
        }
      >
        {label}
        {!present ? missingSuffix : ''}
      </span>
      <span className="text-base" aria-hidden>
        {present ? '✔' : '❌'}
      </span>
    </div>
  )
}

export function ARDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { selected, loading } = useAppSelector((s) => s.ar)
  const [pdfOpen, setPdfOpen] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    dispatch(fetchARDetail(id))
    return () => {
      dispatch(clearSelected())
    }
  }, [dispatch, id])

  if (!id) {
    return null
  }

  const row = selected && selected.id === id ? selected : null
  const canSendEmail = row ? EMAIL_ALLOWED_STATUSES.has(row.status) : false
  const missingSuffix = t('arDetail.missingSuffix')

  return (
    <div className="space-y-6">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        className="-ml-2 text-neutral-600 dark:text-neutral-300"
      >
        {t('arDetail.back')}
      </Button>

      <Spin spinning={loading && !row}>
        {!row ? (
          <div className="rounded-xl bg-white p-8 text-center text-neutral-500 shadow-sm dark:border dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
            {!loading ? t('arDetail.notFound') : null}
          </div>
        ) : (
          <>
            <header className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    {t('arDetail.invoiceLabel')}
                  </p>
                  <h1 className="mt-1 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                    {row.invoiceNo}
                  </h1>
                  <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(row.amount)}
                  </p>
                  <p className="mt-3 max-w-lg text-xs text-neutral-500 dark:text-neutral-400">
                    {t('arDetail.trackingAtCompanyHint')}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3 sm:min-w-[200px]">
                  <ARStatusTag status={row.status} />
                  <div className="w-full max-w-xs">
                    <p className="mb-1 text-xs text-neutral-500 dark:text-neutral-400">{t('arDetail.confidenceScore')}</p>
                    <Progress percent={row.confidenceScore} />
                  </div>
                </div>
              </div>
            </header>

            <section className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{t('arDetail.documents')}</h2>
              <div className="mt-2 divide-y divide-neutral-100 dark:divide-neutral-800">
                <DocLine label={t('arDetail.docInvoice')} present={row.documents.invoice} missingSuffix={missingSuffix} />
                <DocLine label={t('arDetail.docChecks')} present={row.documents.checks} missingSuffix={missingSuffix} />
                <DocLine label={t('arDetail.docSupporting')} present={row.documents.supporting} missingSuffix={missingSuffix} />
              </div>
            </section>

            <section className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{t('arDetail.pdf')}</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="primary"
                  disabled={!row.pdfUrl}
                  title={!row.pdfUrl ? t('arDetail.previewPdfUnavailable') : undefined}
                  onClick={() => row.pdfUrl && setPdfOpen(true)}
                >
                  {t('arDetail.previewPdf')}
                </Button>
                <Button
                  disabled={!row.pdfUrl}
                  onClick={() => {
                    if (row.pdfUrl) window.open(row.pdfUrl, '_blank', 'noopener,noreferrer')
                  }}
                >
                  {t('arDetail.downloadPdf')}
                </Button>
              </div>
              <p className="mt-3 max-w-xl text-xs text-neutral-500 dark:text-neutral-400">
                {t('arDetail.mergedPdfHint')}
              </p>
            </section>

            <section className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{t('arDetail.actions')}</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="primary"
                  disabled={!canSendEmail}
                  onClick={() => setEmailOpen(true)}
                >
                  {t('arDetail.sendEmail')}
                </Button>
              </div>
              {!canSendEmail ? (
                <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                  {t('arDetail.sendEmailHint')}
                </p>
              ) : null}
            </section>

            <Modal
              title={t('arDetail.pdfPreviewTitle')}
              open={pdfOpen && Boolean(row.pdfUrl)}
              onCancel={() => setPdfOpen(false)}
              footer={null}
              width={880}
              destroyOnHidden
            >
              {row.pdfUrl ? (
                <iframe
                  title={t('arDetail.pdfIframeTitle')}
                  src={row.pdfUrl}
                  className="mt-2 h-[70vh] w-full rounded-lg border border-neutral-200 dark:border-neutral-700"
                />
              ) : null}
            </Modal>

            <EmailDrawer
              open={emailOpen}
              onClose={() => setEmailOpen(false)}
              arId={row.id}
              onSent={() => {
                if (id) dispatch(fetchARDetail(id))
              }}
            />
          </>
        )}
      </Spin>

      <div className="text-center">
        <Link to="/ar" className="text-sm text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300">
          {t('arDetail.backToList')}
        </Link>
      </div>
    </div>
  )
}
