import {
  BankOutlined,
  BarChartOutlined,
  DashboardOutlined,
  FileSearchOutlined,
  FolderOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { BrandLogo } from '../components/BrandLogo'

function linkClass(active: boolean) {
  return [
    'flex h-11 w-11 items-center justify-center rounded-xl transition-all',
    active
      ? 'bg-neutral-900 text-white shadow-sm dark:bg-neutral-100 dark:text-neutral-900'
      : 'text-neutral-500 hover:bg-neutral-100 hover:shadow-md dark:text-neutral-400 dark:hover:bg-neutral-800',
  ].join(' ')
}

export function Sidebar() {
  const { t } = useTranslation()

  const items = useMemo(
    () =>
      [
        { to: '/', icon: <DashboardOutlined />, labelKey: 'layout.dashboard', end: true },
        { to: '/companies', icon: <BankOutlined />, labelKey: 'layout.companies', end: false },
        { to: '/ar', icon: <FileSearchOutlined />, labelKey: 'layout.arEntries', end: false },
        { to: '/documents', icon: <FolderOutlined />, labelKey: 'layout.documents', end: true },
        {
          to: '/analytics',
          icon: <BarChartOutlined />,
          labelKey: 'layout.analytics',
          end: true,
        },
        {
          to: '/settings',
          icon: <SettingOutlined />,
          labelKey: 'layout.settings',
          end: true,
        },
      ] as const,
    [],
  )

  return (
    <aside className="flex w-[5.25rem] shrink-0 flex-col items-center gap-5 rounded-2xl bg-white px-2 py-6 shadow-sm dark:border dark:border-neutral-800 dark:bg-neutral-900">
      <BrandLogo withHomeLink className="h-[3.25rem] w-auto max-w-[4.25rem] object-contain" />
      <nav className="flex flex-col items-center gap-3" aria-label={t('layout.navAriaLabel')}>
        {items.map(({ to, icon, labelKey, end }) => {
          const label = t(labelKey)
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={label}
              className={({ isActive }) => linkClass(isActive)}
            >
              <span className="text-lg">{icon}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
