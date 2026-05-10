import { Form, Input, Modal, Row, Col } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Company, CompanyCreatePayload } from '../types/company'

interface CompanyFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  company: Company | null
  saving: boolean
  onClose: () => void
  onSubmit: (values: CompanyCreatePayload) => Promise<void>
}

export function CompanyFormModal({
  open,
  mode,
  company,
  saving,
  onClose,
  onSubmit,
}: CompanyFormModalProps) {
  const { t } = useTranslation()
  const [form] = Form.useForm<CompanyCreatePayload>()

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && company) {
      form.setFieldsValue({
        name: company.name,
        email: company.email,
        addressLine1: company.addressLine1,
        addressLine2: company.addressLine2,
        city: company.city,
        state: company.state,
        country: company.country,
        pincode: company.pincode,
        phone: company.phone,
        website: company.website,
        taxId: company.taxId,
        notes: company.notes,
      })
    } else {
      form.resetFields()
    }
  }, [open, mode, company, form])

  const title =
    mode === 'create' ? t('companiesPage.modalCreateTitle') : t('companiesPage.modalEditTitle')

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      confirmLoading={saving}
      okText={t('companiesPage.save')}
      cancelText={t('companiesPage.cancel')}
      onOk={() => void form.submit()}
      width={720}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => onSubmit(values)}
        autoComplete="off"
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label={t('companiesPage.fieldName')}
              rules={[{ required: true, message: t('companiesPage.fieldRequired') }]}
            >
              <Input maxLength={200} showCount />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label={t('companiesPage.fieldEmail')}
              rules={[
                { required: true, message: t('companiesPage.fieldRequired') },
                { type: 'email', message: t('companiesPage.emailInvalid') },
              ]}
            >
              <Input type="email" maxLength={320} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="addressLine1"
          label={t('companiesPage.fieldAddress1')}
          rules={[{ required: true, message: t('companiesPage.fieldRequired') }]}
        >
          <Input maxLength={300} showCount />
        </Form.Item>
        <Form.Item name="addressLine2" label={t('companiesPage.fieldAddress2')}>
          <Input maxLength={300} />
        </Form.Item>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item name="city" label={t('companiesPage.fieldCity')}>
              <Input maxLength={120} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="state" label={t('companiesPage.fieldState')}>
              <Input maxLength={120} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="country" label={t('companiesPage.fieldCountry')}>
              <Input maxLength={120} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item name="pincode" label={t('companiesPage.fieldPincode')}>
              <Input maxLength={20} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="phone" label={t('companiesPage.fieldPhone')}>
              <Input maxLength={40} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="website" label={t('companiesPage.fieldWebsite')}>
              <Input placeholder="https://…" maxLength={500} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="taxId" label={t('companiesPage.fieldTaxId')}>
          <Input maxLength={32} placeholder={t('companiesPage.taxIdHint')} />
        </Form.Item>
        <Form.Item name="notes" label={t('companiesPage.fieldNotes')}>
          <Input.TextArea rows={3} maxLength={5000} showCount />
        </Form.Item>
      </Form>
    </Modal>
  )
}
