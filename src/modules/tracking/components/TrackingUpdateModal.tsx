import { Form, Input, Modal, Select } from 'antd'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { TrackingEventStatus } from '../constants/trackingStatus'
import { TRACKING_STATUS_OPTIONS } from '../constants/trackingStatus'

interface TrackingUpdateModalProps {
  open: boolean
  arId: string | null
  submitting: boolean
  onClose: () => void
  onSubmit: (values: { status: TrackingEventStatus; description?: string }) => Promise<void>
}

export function TrackingUpdateModal({
  open,
  arId,
  submitting,
  onClose,
  onSubmit,
}: TrackingUpdateModalProps) {
  const { t } = useTranslation()
  const [form] = Form.useForm<{ status: TrackingEventStatus; description?: string }>()

  const statusOptions = useMemo(
    () =>
      TRACKING_STATUS_OPTIONS.map((o) => ({
        value: o.value,
        label: t(o.labelKey),
      })),
    [t],
  )

  useEffect(() => {
    if (!open) return
    form.resetFields()
  }, [open, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      await onSubmit(values)
      onClose()
      form.resetFields()
    } catch {
      /* validation / submit surfaced elsewhere */
    }
  }

  return (
    <Modal
      title={t('tracking.updateModalTitle')}
      open={open && Boolean(arId)}
      onCancel={onClose}
      okText={t('tracking.updateSubmit')}
      cancelText={t('tracking.updateCancel')}
      confirmLoading={submitting}
      onOk={() => void handleOk()}
      destroyOnHidden
      width={480}
    >
      <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
        {t('tracking.updateModalHint')}
      </p>
      <Form form={form} layout="vertical">
        <Form.Item
          name="status"
          label={t('tracking.fieldStatus')}
          rules={[{ required: true, message: t('tracking.fieldRequired') }]}
        >
          <Select options={statusOptions} showSearch optionFilterProp="label" />
        </Form.Item>
        <Form.Item name="description" label={t('tracking.fieldDescription')}>
          <Input.TextArea rows={4} maxLength={5000} showCount placeholder={t('tracking.descriptionPlaceholder')} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
