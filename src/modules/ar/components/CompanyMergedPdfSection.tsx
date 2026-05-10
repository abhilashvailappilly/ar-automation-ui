import { DownloadOutlined, EyeOutlined, FilePdfOutlined } from '@ant-design/icons'
import { Button, Tag } from 'antd'
import { useTranslation } from 'react-i18next'

interface CompanyMergedPdfSectionProps {
  /** Resolved merged PDF URL for this billing company (cover letter + bundle). */
  finalPdfUrl?: string
  companyLabel: string
  onPreview: (url: string) => void
}

export function CompanyMergedPdfSection({
  finalPdfUrl,
  companyLabel,
  onPreview,
}: CompanyMergedPdfSectionProps) {
  const { t } = useTranslation()

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50/90 px-4 py-4 dark:border-neutral-700 dark:bg-neutral-900/60">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-lg text-red-600 dark:bg-red-950/50 dark:text-red-400">
            <FilePdfOutlined />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {t('arGrouped.companyCoverTitle')}
            </p>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {finalPdfUrl
                ? t('arGrouped.companyCoverReadyHint')
                : t('arGrouped.companyCoverPendingHint')}
            </p>
          </div>
        </div>
        {finalPdfUrl ? (
          <div className="flex flex-wrap items-center gap-2">
            <Tag color="success" className="m-0">
              {t('arGrouped.companyPdfReady')}
            </Tag>
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              aria-label={t('arGrouped.previewCompanyPdfAria', { company: companyLabel })}
              onClick={() => onPreview(finalPdfUrl)}
            >
              {t('arGrouped.previewCompanyPdf')}
            </Button>
            <Button
              size="small"
              icon={<DownloadOutlined />}
              href={finalPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('arGrouped.openCompanyPdf')}
            </Button>
          </div>
        ) : (
          <Tag className="m-0">{t('arGrouped.companyPdfPending')}</Tag>
        )}
      </div>
    </div>
  )
}
