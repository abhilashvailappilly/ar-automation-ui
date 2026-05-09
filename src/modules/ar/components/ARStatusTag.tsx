import { Tag } from 'antd'
import type { ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import type { ARStatus } from '../types/ar'

const STATUS_COLORS: Record<ARStatus, ComponentProps<typeof Tag>['color']> = {
  PENDING: 'gold',
  INVOICE_NOT_FOUND: 'magenta',
  READY_FOR_PDF: 'blue',
  PDF_GENERATED: 'green',
  MISSING_DOCUMENTS: 'red',
  EMAIL_SENT: 'cyan',
}

export function ARStatusTag({ status }: { status: ARStatus }) {
  const { t } = useTranslation()
  const label = t(`arStatus.${status}`)
  return (
    <Tag color={STATUS_COLORS[status]} className="m-0 capitalize">
      {label}
    </Tag>
  )
}
