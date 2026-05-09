import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { BRAND_LOGO_SRC } from '../constants/branding'

interface BrandLogoProps {
  className?: string
  /** Wrap logo in a link to the app home */
  withHomeLink?: boolean
}

export function BrandLogo({ className = '', withHomeLink = false }: BrandLogoProps) {
  const { t } = useTranslation()

  const img = (
    <img
      src={BRAND_LOGO_SRC}
      alt={t('layout.brandLogoAlt')}
      className={`object-contain ${className}`}
      decoding="async"
      fetchPriority="high"
    />
  )

  if (withHomeLink) {
    return (
      <Link
        to="/"
        title={t('layout.dashboard')}
        className="inline-flex shrink-0 items-center justify-center rounded-lg outline-none ring-offset-2 ring-offset-[#f5f7fb] transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-neutral-400 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-500"
      >
        {img}
      </Link>
    )
  }

  return img
}
