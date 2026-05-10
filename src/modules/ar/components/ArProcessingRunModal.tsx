import { Form, Input, Modal, message } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ArTriggerRunPayload } from '../api/arApi.types'

const OBJECT_ID_PATTERN = /^[a-fA-F0-9]{24}$/

interface ArProcessingRunModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (payload: ArTriggerRunPayload) => Promise<void>
}

interface FormValues {
  merchantId: string
  outletId: string
  fromDate?: string
  toDate?: string
}

function dateInputToIsoStartOfDay(d: string | undefined): string | undefined {
  if (!d || !d.trim()) return undefined
  const date = new Date(`${d.trim()}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString()
}

function dateInputToIsoEndOfDay(d: string | undefined): string | undefined {
  if (!d || !d.trim()) return undefined
  const date = new Date(`${d.trim()}T23:59:59.999Z`)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString()
}

export function ArProcessingRunModal({ open, onClose, onSubmit }: ArProcessingRunModalProps) {
  const { t } = useTranslation()
  const [form] = Form.useForm<FormValues>()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    form.resetFields()
  }, [open, form])

  const handleOk = async () => {
    let values: FormValues
    try {
      values = await form.validateFields()
    } catch {
      return
    }

    const fd = values.fromDate?.trim()
    const td = values.toDate?.trim()
    if (fd && td && fd > td) {
      message.error(t('arRun.dateOrderHint'))
      return
    }

    const fromIso = dateInputToIsoStartOfDay(values.fromDate)
    const toIso = dateInputToIsoEndOfDay(values.toDate)

    const payload: ArTriggerRunPayload = {
      merchantId: values.merchantId.trim(),
      outletId: values.outletId.trim(),
      ...(fromIso ? { fromDate: fromIso } : {}),
      ...(toIso ? { toDate: toIso } : {}),
    }

    setSubmitting(true)
    try {
      await onSubmit(payload)
      onClose()
      form.resetFields()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title={t('arRun.modalTitle')}
      open={open}
      onCancel={onClose}
      okText={t('arRun.submit')}
      cancelText={t('arRun.cancel')}
      confirmLoading={submitting}
      onOk={() => void handleOk()}
      destroyOnHidden
      width={520}
    >
      <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">{t('arRun.modalHint')}</p>
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item
          name="merchantId"
          label={t('arRun.merchantId')}
          rules={[
            { required: true, message: t('arRun.fieldRequired') },
            {
              pattern: OBJECT_ID_PATTERN,
              message: t('arRun.invalidObjectId'),
            },
          ]}
        >
          <Input placeholder={t('arRun.merchantIdPlaceholder')} spellCheck={false} />
        </Form.Item>
        <Form.Item
          name="outletId"
          label={t('arRun.outletId')}
          rules={[
            { required: true, message: t('arRun.fieldRequired') },
            {
              pattern: OBJECT_ID_PATTERN,
              message: t('arRun.invalidObjectId'),
            },
          ]}
        >
          <Input placeholder={t('arRun.outletIdPlaceholder')} spellCheck={false} />
        </Form.Item>
        <Form.Item label={t('arRun.dateRangeLabel')}>
          <div className="flex flex-wrap items-center gap-3">
            <Form.Item name="fromDate" noStyle>
              <Input type="date" className="min-w-[160px] flex-1" aria-label={t('arRun.fromDate')} />
            </Form.Item>
            <span className="text-neutral-400">—</span>
            <Form.Item name="toDate" noStyle>
              <Input type="date" className="min-w-[160px] flex-1" aria-label={t('arRun.toDate')} />
            </Form.Item>
          </div>
        </Form.Item>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{t('arRun.dateOptionalHint')}</p>
      </Form>
    </Modal>
  )
}
