import { Button, Collapse, Empty } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import type { ARCompanyGroup } from '../types/ar'
import { ARTable } from './ARTable'

interface ARGroupedEntriesProps {
  groups: ARCompanyGroup[]
  loading?: boolean
}

export function ARGroupedEntries({ groups, loading }: ARGroupedEntriesProps) {
  const { t } = useTranslation()

  if (loading && groups.length === 0) {
    return null
  }

  if (!loading && groups.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 shadow-sm dark:border dark:border-neutral-800 dark:bg-neutral-900">
        <Empty description={t('arGrouped.empty')} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Collapse
        bordered={false}
        className="rounded-xl bg-white shadow-sm dark:border dark:border-neutral-800 dark:bg-neutral-900 [&_.ant-collapse-item]:border-neutral-200 dark:[&_.ant-collapse-item]:border-neutral-800"
        expandIconPosition="end"
        items={groups.map((group, gi) => {
          const routeId = group.trackingEntryId
          return {
            key: `company-${gi}`,
            label: (
              <div className="flex flex-wrap items-center justify-between gap-3 pr-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {group.label || t('arGrouped.noCompanyId')}
                  </span>
                  {group.finalPdfUrl ? (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                      {t('arGrouped.companyPdfChip')}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
                    {t('arGrouped.companySummary', {
                      count: group.totalCount,
                      amount: formatCurrency(group.total),
                    })}
                  </span>
                  <span className="inline-flex" onClick={(e) => e.stopPropagation()}>
                    {routeId ? (
                      <Link to={`/ar/company/${routeId}`}>
                        <Button type="primary" size="small">{t('arGrouped.viewCompany')}</Button>
                      </Link>
                    ) : (
                      <Button type="primary" size="small" disabled title={t('arGrouped.viewCompanyDisabled')}>
                        {t('arGrouped.viewCompany')}
                      </Button>
                    )}
                  </span>
                </div>
              </div>
            ),
            children: (
              <div className="space-y-5 pb-1">
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    {t('arGrouped.invoicesByGuest')}
                  </h3>
                  <Collapse
                    bordered={false}
                    ghost
                    className="bg-neutral-50/80 dark:bg-neutral-950/40"
                    expandIconPosition="end"
                    items={group.guests.map((guest, ui) => ({
                      key: `${guest.guestId || 'guest'}:${gi}:${ui}`,
                      label: (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm text-neutral-800 dark:text-neutral-200">
                            {guest.entries[0]?.customer ??
                              (guest.guestId.trim() !== ''
                                ? guest.guestId
                                : t('arGrouped.guestFallback'))}
                          </span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {t('arGrouped.guestSummary', {
                              count: guest.count,
                              amount: formatCurrency(guest.total),
                            })}
                          </span>
                        </div>
                      ),
                      children: (
                        <div className="-mx-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                          <ARTable entries={guest.entries} loading={false} embedded />
                        </div>
                      ),
                    }))}
                  />
                </div>
              </div>
            ),
          }
        })}
      />
    </div>
  )
}
