import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Typography, message } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { BrandLogo } from '../../../shared/components/BrandLogo'
import { useAppDispatch, useAppSelector } from '../../../shared/store/hooks'
import { register } from '../store/authSlice'

export function RegisterPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const token = useAppSelector((s) => s.auth.token)

  useEffect(() => {
    if (token) {
      navigate('/', { replace: true })
    }
  }, [token, navigate])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f7fb] p-4 dark:bg-neutral-950">
      <Card className="w-full max-w-md shadow-sm" styles={{ body: { padding: 28 } }}>
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex w-full justify-center px-2">
            <BrandLogo
              withHomeLink
              className="h-[5.25rem] w-auto max-w-[min(100%,18rem)] object-contain sm:h-[6.25rem] sm:max-w-[20rem]"
            />
          </div>
          <Typography.Title level={3} className="!mb-1 !mt-5">
            {t('auth.registerTitle')}
          </Typography.Title>
        </div>
        <Typography.Paragraph type="secondary" className="!mt-0 !mb-6 text-center">
          {t('auth.registerSubtitle')}
        </Typography.Paragraph>
        <Form
          layout="vertical"
          requiredMark={false}
          onFinish={async (values: {
            email: string
            password: string
            name?: string
          }) => {
            try {
              await dispatch(
                register({
                  email: values.email,
                  password: values.password,
                  name: values.name?.trim() || undefined,
                }),
              ).unwrap()
              message.success(t('auth.registerSuccess'))
            } catch (err) {
              message.error(typeof err === 'string' ? err : t('auth.registerFailed'))
            }
          }}
        >
          <Form.Item name="name" label={t('auth.nameOptional')}>
            <Input prefix={<UserOutlined className="text-neutral-400" />} placeholder={t('auth.namePlaceholder')} />
          </Form.Item>
          <Form.Item
            name="email"
            label={t('auth.email')}
            rules={[
              { required: true, message: t('auth.emailRequired') },
              { type: 'email', message: t('auth.emailInvalid') },
            ]}
          >
            <Input prefix={<MailOutlined className="text-neutral-400" />} placeholder={t('auth.emailPlaceholder')} />
          </Form.Item>
          <Form.Item
            name="password"
            label={t('auth.password')}
            rules={[
              { required: true, message: t('auth.passwordRequired') },
              { min: 8, message: t('auth.passwordMin') },
            ]}
          >
            <Input.Password prefix={<LockOutlined className="text-neutral-400" />} placeholder={t('auth.passwordPlaceholder')} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" className="mt-2">
            {t('auth.registerCta')}
          </Button>
        </Form>
        <Typography.Paragraph className="!mt-6 !mb-0 text-center text-neutral-600 dark:text-neutral-400">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300">
            {t('auth.signInLink')}
          </Link>
        </Typography.Paragraph>
      </Card>
    </div>
  )
}
