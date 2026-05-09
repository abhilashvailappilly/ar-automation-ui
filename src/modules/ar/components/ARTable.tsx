import { Button, Progress, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { AREntry } from '../types/ar'
import { ARStatusTag } from './ARStatusTag'

function fmtMoney(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(n)
}

interface ARTableProps {
  entries: AREntry[]
  loading?: boolean
}

export function ARTable({ entries, loading }: ARTableProps) {
  const { t } = useTranslation()

  const columns: ColumnsType<AREntry> = useMemo(
    () => [
      {
        title: t('arTable.invoiceNo'),
        dataIndex: 'invoiceNo',
        key: 'invoiceNo',
        render: (text: string, record) => (
          <Link
            to={`/ar/${record.id}`}
            className="font-medium text-sky-600 hover:text-sky-700"
          >
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
        render: (v: number) => fmtMoney(v),
      },
      {
        title: t('arTable.status'),
        dataIndex: 'status',
        key: 'status',
        render: (s: AREntry['status']) => <ARStatusTag status={s} />,
      },
      {
        title: t('arTable.missingDocs'),
        dataIndex: 'missingDocs',
        key: 'missingDocs',
        render: (v: boolean) => (v ? t('arTable.yes') : t('arTable.no')),
      },
      {
        title: t('arTable.confidenceScore'),
        dataIndex: 'confidenceScore',
        key: 'confidenceScore',
        width: 180,
        render: (pct: number) => (
          <Progress percent={pct} size="small" showInfo />
        ),
      },
      {
        title: t('arTable.action'),
        key: 'action',
        render: (_, record) => (
          <Link to={`/ar/${record.id}`}>
            <Button type="link" className="px-0">
              {t('arTable.view')}
            </Button>
          </Link>
        ),
      },
    ],
    [t],
  )

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border dark:border-neutral-800 dark:bg-neutral-900">
      <Table<AREntry>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={entries}
        pagination={{ pageSize: 8, showSizeChanger: false }}
      />
    </div>
  )
}
