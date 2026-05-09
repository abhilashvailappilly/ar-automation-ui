import { createSlice } from '@reduxjs/toolkit'
import {
  LANGUAGE_STORAGE_KEY,
  THEME_MODE_STORAGE_KEY,
} from '../constants/uiStorage'
import type { ThemeMode } from '../hooks/useResolvedDark'

function loadStoredThemeMode(): ThemeMode {
  try {
    const v = localStorage.getItem(THEME_MODE_STORAGE_KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch {
    /* ignore */
  }
  return 'system'
}

function loadStoredLanguage(): string {
  try {
    const v = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (v === 'en' || v === 'es') return v
  } catch {
    /* ignore */
  }
  return 'en'
}

interface UiState {
  themeMode: ThemeMode
  /** BCP-47-ish codes aligned with i18n resources */
  language: string
}

const initialState: UiState = {
  themeMode: loadStoredThemeMode(),
  language: loadStoredLanguage(),
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setThemeMode(state, action: { payload: ThemeMode }) {
      state.themeMode = action.payload
      try {
        localStorage.setItem(THEME_MODE_STORAGE_KEY, action.payload)
      } catch {
        /* ignore */
      }
    },
    setLanguage(state, action: { payload: string }) {
      state.language = action.payload
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, action.payload)
      } catch {
        /* ignore */
      }
    },
  },
})

export const { setThemeMode, setLanguage } = uiSlice.actions
export default uiSlice.reducer
