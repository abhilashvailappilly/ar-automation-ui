import type { ReactNode } from 'react'

interface InsightCardProps {
  title: string
  children: ReactNode
  className?: string
}

export function InsightCard({ title, children, className = '' }: InsightCardProps) {
  return (
    <div
      className={`rounded-lg border border-neutral-100 bg-neutral-50/60 p-4 transition-colors duration-200 dark:border-neutral-700 dark:bg-neutral-900/50 ${className}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {title}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  )
}
