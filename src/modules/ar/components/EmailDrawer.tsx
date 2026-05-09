import { Button, Drawer, Form, Input, Select, message } from 'antd'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch } from '../../../shared/store/hooks'
import { sendEmail } from '../store/arSlice'

interface EmailDrawerProps {
  open: boolean
  onClose: () => void
  arId: string | null
  onSent?: () => void
}

export function EmailDrawer({ open, onClose, arId, onSent }: EmailDrawerProps) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [form] = Form.useForm<{
    to?: string
    subject: string
    body: string
    tone: string
  }>()

  const tones = useMemo(
    () => [
      { value: 'professional', label: t('arEmail.toneProfessional') },
      { value: 'friendly', label: t('arEmail.toneFriendly') },
      { value: 'formal', label: t('arEmail.toneFormal') },
    ],
    [t],
  )

  useEffect(() => {
    if (open && arId) {
      form.setFieldsValue({
        subject: t('arEmail.defaultSubject'),
        body: t('arEmail.defaultBody'),
        tone: 'professional',
      })
    }
  }, [open, arId, form, t])

  const handleRegenerate = () => {
    const tone = form.getFieldValue('tone') ?? 'professional'
    const toneWords: Record<string, string> = {
      professional: t('arEmail.toneWordProfessional'),
      friendly: t('arEmail.toneWordFriendly'),
      formal: t('arEmail.toneWordFormal'),
    }
    const toneWord = toneWords[tone] ?? tone
    form.setFieldsValue({
      body: t('arEmail.regenerateBody', { tone: toneWord }),
    })
    message.success(t('arEmail.draftRegenerated'))
  }

  const handleSend = async () => {
    if (!arId) return
    let values: { to?: string; subject: string; body: string; tone: string }
    try {
      values = await form.validateFields()
    } catch {
      return
    }
    try {
      const to = values.to?.trim()
      await dispatch(
        sendEmail({
          id: arId,
          to: to || undefined,
          subject: values.subject,
          body: values.body,
          tone: values.tone,
        }),
      ).unwrap()
      message.success(t('arEmail.queued'))
      onSent?.()
      onClose()
    } catch {
      message.error(t('arEmail.sendFailed'))
    }
  }

  return (
    <Drawer
      title={t('arEmail.drawerTitle')}
      placement="right"
      width={420}
      open={open}
      onClose={onClose}
      destroyOnHidden
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleRegenerate}>{t('arEmail.regenerate')}</Button>
          <Button type="primary" onClick={() => void handleSend()}>
            {t('arEmail.send')}
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" className="mt-2">
        <Form.Item name="to" label={t('arEmail.recipientOptional')}>
          <Input type="email" placeholder={t('arEmail.recipientPlaceholder')} />
        </Form.Item>
        <Form.Item
          name="subject"
          label={t('arEmail.subject')}
          rules={[{ required: true, message: t('arEmail.subjectRequired') }]}
        >
          <Input placeholder={t('arEmail.subjectPlaceholder')} />
        </Form.Item>
        <Form.Item
          name="body"
          label={t('arEmail.body')}
          rules={[{ required: true, message: t('arEmail.bodyRequired') }]}
        >
          <Input.TextArea rows={10} placeholder={t('arEmail.bodyPlaceholder')} />
        </Form.Item>
        <Form.Item name="tone" label={t('arEmail.tone')} rules={[{ required: true }]}>
          <Select options={tones} />
        </Form.Item>
      </Form>
    </Drawer>
  )
}
