import { Card, Radio, Select, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { BrandLogo } from '../../../shared/components/BrandLogo'
import type { ThemeMode } from '../../../shared/hooks/useResolvedDark'
import { setLanguage, setThemeMode } from '../../../shared/store/uiSlice'
import { useAppDispatch, useAppSelector } from '../../../shared/store/hooks'

export function SettingsPage() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { themeMode, language } = useAppSelector((s) => s.ui)

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <section className="flex flex-wrap items-center gap-4">
        <BrandLogo withHomeLink className="h-[3.75rem] w-auto max-w-[200px] shrink-0 object-contain sm:h-16 sm:max-w-[220px]" />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            {t('settingsPage.title')}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {t('settingsPage.subtitle')}
          </p>
        </div>
      </section>

      <Card className="shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <Typography.Title level={5} className="!mb-1 !mt-0 dark:text-neutral-100">
          {t('settingsPage.language')}
        </Typography.Title>
        <Typography.Paragraph type="secondary" className="!mb-4 !text-sm dark:text-neutral-400">
          {t('settingsPage.languageHint')}
        </Typography.Paragraph>
        <Select
          className="w-full max-w-xs"
          value={language}
          options={[
            { value: 'en', label: t('settingsPage.langEnglish') },
            { value: 'es', label: t('settingsPage.langSpanish') },
          ]}
          onChange={(value) => dispatch(setLanguage(value))}
        />
      </Card>

      <Card className="shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <Typography.Title level={5} className="!mb-4 !mt-0 dark:text-neutral-100">
          {t('settingsPage.theme')}
        </Typography.Title>
        <Radio.Group
          value={themeMode}
          onChange={(e) => dispatch(setThemeMode(e.target.value as ThemeMode))}
        >
          <Radio.Button value="light">{t('settingsPage.themeLight')}</Radio.Button>
          <Radio.Button value="dark">{t('settingsPage.themeDark')}</Radio.Button>
          <Radio.Button value="system">{t('settingsPage.themeSystem')}</Radio.Button>
        </Radio.Group>
      </Card>
    </div>
  )
}
