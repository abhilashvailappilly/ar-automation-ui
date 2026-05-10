import { CloudSyncOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button, Space } from 'antd'
import { useTranslation } from 'react-i18next'

interface EmailHeaderProps {
  loading?: boolean
  syncing?: boolean
  onRefresh: () => void
  onSync: () => void
}

export function EmailHeader({ loading, syncing, onRefresh, onSync }: EmailHeaderProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4 dark:border-neutral-800">
      <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
        {t('emailThread.title')}
      </h2>
      <Space size="small" wrap>
        <Button
          type="primary"
          size="small"
          icon={<CloudSyncOutlined />}
          loading={syncing}
          disabled={loading}
          onClick={onSync}
        >
          {t('emailThread.sync')}
        </Button>
        <Button
          type="default"
          size="small"
          icon={<ReloadOutlined />}
          loading={loading}
          disabled={syncing}
          onClick={onRefresh}
        >
          {t('emailThread.refresh')}
        </Button>
      </Space>
    </div>
  )
}
