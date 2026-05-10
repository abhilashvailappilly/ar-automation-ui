import { ConfigProvider, theme as antdTheme } from 'antd'
import enUS from 'antd/locale/en_US'
import esES from 'antd/locale/es_ES'
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AnalyticsPage } from '../modules/analytics/pages/AnalyticsPage'
import { LoginPage } from '../modules/auth/pages/LoginPage'
import { RegisterPage } from '../modules/auth/pages/RegisterPage'
import { ARDetailPage } from '../modules/ar/pages/ARDetailPage'
import { AREntriesPage } from '../modules/ar/pages/AREntriesPage'
import { CompanyARPage } from '../modules/ar/pages/CompanyARPage'
import { CompaniesPage } from '../modules/company/pages/CompaniesPage'
import { DashboardPage } from '../modules/dashboard/pages/DashboardPage'
import { DocumentsPage } from '../modules/documents/pages/DocumentsPage'
import { SettingsPage } from '../modules/settings/pages/SettingsPage'
import i18n from '../shared/i18n/i18n'
import { useResolvedDark } from '../shared/hooks/useResolvedDark'
import { RootLayout } from '../shared/layout/RootLayout'
import { RequireAuth } from '../shared/routing/RequireAuth'
import { SessionGate } from '../shared/routing/SessionGate'
import { useAppSelector } from '../shared/store/hooks'

const fontStack =
  'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"'

export default function App() {
  const themeMode = useAppSelector((s) => s.ui.themeMode)
  const language = useAppSelector((s) => s.ui.language)
  const isDark = useResolvedDark(themeMode)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  useEffect(() => {
    void i18n.changeLanguage(language)
  }, [language])

  const antdLocale = language === 'es' ? esES : enUS

  return (
    <ConfigProvider
      locale={antdLocale}
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: isDark ? '#fafafa' : '#171717',
          borderRadius: 10,
          fontFamily: fontStack,
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<SessionGate />}>
            <Route element={<RequireAuth />}>
              <Route path="/" element={<RootLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="companies" element={<CompaniesPage />} />
                <Route path="ar" element={<AREntriesPage />} />
                <Route path="ar/company/:canonicalArId" element={<CompanyARPage />} />
                <Route path="ar/:id" element={<ARDetailPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}
