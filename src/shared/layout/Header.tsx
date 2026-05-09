import {
  BellOutlined,
  LogoutOutlined,
  MoonOutlined,
  SearchOutlined,
  SettingOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Avatar, Button, Dropdown, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../modules/auth/store/authSlice'
import { BrandLogo } from '../components/BrandLogo'
import { useResolvedDark } from '../hooks/useResolvedDark'
import { setThemeMode } from '../store/uiSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

export function Header() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const themeMode = useAppSelector((s) => s.ui.themeMode)
  const isDark = useResolvedDark(themeMode)

  const primaryLabel = user?.name?.trim() || user?.email || t('layout.accountFallback')
  const secondaryLabel =
    user?.name?.trim() && user?.email ? user.email : undefined
  const initials = (
    user?.name?.trim()?.charAt(0) ||
    user?.email?.charAt(0) ||
    '?'
  ).toUpperCase()

  const toggleColorMode = () => {
    dispatch(setThemeMode(isDark ? 'light' : 'dark'))
  }

  const menuItems = [
    {
      key: 'profile-head',
      disabled: true,
      label: (
        <div className="max-w-[220px] py-1">
          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{primaryLabel}</div>
          {secondaryLabel ? (
            <div className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
              {secondaryLabel}
            </div>
          ) : null}
        </div>
      ),
    },
    { type: 'divider' as const },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('layout.settings'),
      onClick: () => navigate('/settings'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('layout.signOut'),
      onClick: () => dispatch(logout()),
    },
  ]

  return (
    <header className="flex h-auto min-h-16 shrink-0 items-center justify-between rounded-xl bg-white px-4 py-2 shadow-sm dark:border dark:border-neutral-800 dark:bg-neutral-900 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center">
        <BrandLogo withHomeLink className="h-11 w-auto max-h-[3rem] max-w-[180px] object-contain sm:h-12 sm:max-w-[200px]" />
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <Tooltip title={isDark ? t('layout.themeSwitchLight') : t('layout.themeSwitchDark')}>
          <Button
            type="text"
            aria-label={isDark ? t('layout.themeSwitchLight') : t('layout.themeSwitchDark')}
            icon={
              isDark ? (
                <SunOutlined className="text-lg text-amber-500" />
              ) : (
                <MoonOutlined className="text-lg text-neutral-600 dark:text-neutral-400" />
              )
            }
            onClick={toggleColorMode}
            className="text-neutral-500"
          />
        </Tooltip>
        <Button
          type="text"
          icon={<SearchOutlined className="text-neutral-500 text-lg dark:text-neutral-400" />}
          aria-label={t('layout.searchAria')}
          className="text-neutral-500"
        />
        <Button
          type="text"
          icon={<BellOutlined className="text-neutral-500 text-lg dark:text-neutral-400" />}
          aria-label={t('layout.notificationsAria')}
          className="text-neutral-500"
        />
        <Dropdown
          menu={{ items: menuItems }}
          trigger={['hover', 'click']}
          mouseEnterDelay={0.12}
          mouseLeaveDelay={0.2}
          placement="bottomRight"
        >
          <button
            type="button"
            aria-label={t('layout.profileMenuAria')}
            aria-haspopup="menu"
            className="ml-1 flex min-w-0 flex-col items-center gap-0.5 border-l border-neutral-200 py-1 pl-3 text-center outline-none transition-opacity hover:opacity-90 dark:border-neutral-700 sm:ml-2 sm:pl-4"
          >
            <Avatar size={32} className="bg-neutral-900 shrink-0 text-white dark:bg-neutral-700">
              {user ? initials : <UserOutlined />}
            </Avatar>
            <span className="max-w-[4.5rem] truncate text-[10px] leading-tight text-neutral-600 dark:text-neutral-400">
              {primaryLabel}
            </span>
          </button>
        </Dropdown>
      </div>
    </header>
  )
}
