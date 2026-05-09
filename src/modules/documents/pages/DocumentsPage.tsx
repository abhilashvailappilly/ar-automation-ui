import { useTranslation } from 'react-i18next'

export function DocumentsPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          {t('documentsPage.title')}
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {t('documentsPage.subtitle')}
        </p>
      </section>
      <div className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          {t('documentsPage.body')}
        </p>
      </div>
    </div>
  )
}
