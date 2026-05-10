import {
  BankOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { Button, Input, Popconfirm, Space, Table, message } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CompanyFormModal } from '../components/CompanyFormModal'
import {
  createCompany,
  deleteCompany,
  fetchCompanies,
  updateCompany,
} from '../store/companySlice'
import type { Company, CompanyCreatePayload } from '../types/company'
import { useAppDispatch, useAppSelector } from '../../../shared/store/hooks'

export function CompaniesPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { items, total, page, limit, loading, saving } = useAppSelector((s) => s.company)

  const [searchDraft, setSearchDraft] = useState('')
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; company: Company | null } | null>(
    null,
  )

  useEffect(() => {
    void dispatch(fetchCompanies({ page: 1, limit: 20, q: '' }))
  }, [dispatch])

  const refetch = useCallback(
    (nextPage: number, nextLimit: number, query: string) => {
      void dispatch(fetchCompanies({ page: nextPage, limit: nextLimit, q: query }))
    },
    [dispatch],
  )

  const queryTrimmed = searchDraft.trim()

  const handleSubmit = async (values: CompanyCreatePayload) => {
    try {
      if (!modal) return
      if (modal.mode === 'create') {
        await dispatch(createCompany(values)).unwrap()
        message.success(t('companiesPage.created'))
        setModal(null)
        refetch(1, limit, '')
        setSearchDraft('')
      } else if (modal.company) {
        await dispatch(updateCompany({ id: modal.company.id, patch: values })).unwrap()
        message.success(t('companiesPage.updated'))
        setModal(null)
        refetch(page, limit, queryTrimmed)
      }
    } catch (err) {
      message.error(typeof err === 'string' ? err : t('companiesPage.saveFailed'))
    }
  }

  const handleDelete = useCallback(
    async (record: Company) => {
      try {
        await dispatch(deleteCompany(record.id)).unwrap()
        message.success(t('companiesPage.deleted'))
        const nextPage = items.length === 1 && page > 1 ? page - 1 : page
        refetch(nextPage, limit, queryTrimmed)
      } catch (err) {
        message.error(typeof err === 'string' ? err : t('companiesPage.deleteFailed'))
      }
    },
    [dispatch, items.length, limit, page, queryTrimmed, refetch, t],
  )

  const columns: ColumnsType<Company> = useMemo(
    () => [
      {
        title: t('companiesPage.colName'),
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        render: (text: string) => (
          <span className="font-medium text-neutral-900 dark:text-neutral-100">{text}</span>
        ),
      },
      {
        title: t('companiesPage.colEmail'),
        dataIndex: 'email',
        key: 'email',
        ellipsis: true,
      },
      {
        title: t('companiesPage.colCity'),
        dataIndex: 'city',
        key: 'city',
        ellipsis: true,
        width: 140,
      },
      {
        title: t('companiesPage.colPhone'),
        dataIndex: 'phone',
        key: 'phone',
        width: 140,
      },
      {
        title: t('companiesPage.colTaxId'),
        dataIndex: 'taxId',
        key: 'taxId',
        ellipsis: true,
        width: 140,
      },
      {
        title: t('companiesPage.colActions'),
        key: 'actions',
        width: 140,
        fixed: 'right',
        render: (_, record) => (
          <Space size="small">
            <Button
              type="link"
              size="small"
              className="px-1"
              icon={<EditOutlined />}
              onClick={() => setModal({ mode: 'edit', company: record })}
            >
              {t('companiesPage.edit')}
            </Button>
            <Popconfirm
              title={t('companiesPage.deleteConfirmTitle')}
              description={t('companiesPage.deleteConfirmDesc')}
              okText={t('companiesPage.deleteOk')}
              cancelText={t('companiesPage.cancel')}
              onConfirm={() => void handleDelete(record)}
            >
              <Button type="link" size="small" danger className="px-1" icon={<DeleteOutlined />}>
                {t('companiesPage.delete')}
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleDelete, t],
  )

  const pagination: TablePaginationConfig = {
    current: page,
    pageSize: limit,
    total,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    showTotal: (subTotal, range) =>
      t('companiesPage.paginationTotal', { start: range[0], end: range[1], total: subTotal }),
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-lg text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
            <BankOutlined />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              {t('companiesPage.title')}
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {t('companiesPage.subtitle')}
            </p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModal({ mode: 'create', company: null })}>
          {t('companiesPage.addCompany')}
        </Button>
      </section>

      <div className="flex flex-wrap gap-3">
        <Input.Search
          allowClear
          placeholder={t('companiesPage.searchPlaceholder')}
          enterButton={<SearchOutlined />}
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          onSearch={(value) => {
            setSearchDraft(value)
            refetch(1, limit, value.trim())
          }}
          className="max-w-md"
        />
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm dark:border dark:border-neutral-800 dark:bg-neutral-900">
        <Table<Company>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={items}
          pagination={pagination}
          scroll={{ x: 900 }}
          locale={{ emptyText: t('companiesPage.empty') }}
          onChange={(pag) => {
            const nextPage = pag.current ?? 1
            const nextSize = pag.pageSize ?? limit
            refetch(nextPage, nextSize, queryTrimmed)
          }}
        />
      </div>

      <CompanyFormModal
        open={modal !== null}
        mode={modal?.mode ?? 'create'}
        company={modal?.company ?? null}
        saving={saving}
        onClose={() => setModal(null)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
