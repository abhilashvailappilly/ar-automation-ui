import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { LANGUAGE_STORAGE_KEY } from '../constants/uiStorage'
import en from './locales/en'
import es from './locales/es'

function guessLng(): string {
  try {
    const v = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (v === 'en' || v === 'es') return v
  } catch {
    /* ignore */
  }
  return 'en'
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: guessLng(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
