import { useTranslation } from 'react-i18next'

interface ActionRecommendationProps {
  text: string
}

export function ActionRecommendation({ text }: ActionRecommendationProps) {
  const { t } = useTranslation()
  if (!text.trim()) return null
  return (
    <div className="rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 shadow-inner transition-opacity duration-200 dark:border-sky-900 dark:from-sky-950/40 dark:to-neutral-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-400">
        {t('aiInsights.recommendedActionTitle')}
      </p>
      <p className="mt-2 text-sm font-medium leading-relaxed text-neutral-900 dark:text-neutral-100">{text}</p>
    </div>
  )
}
