import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../../modules/auth/store/authSlice'
import arReducer from '../../modules/ar/store/arSlice'
import companyReducer from '../../modules/company/store/companySlice'
import trackingReducer from '../../modules/tracking/store/trackingSlice'
import emailReducer from '../../modules/email/store/emailSlice'
import uiReducer from './uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ar: arReducer,
    company: companyReducer,
    tracking: trackingReducer,
    email: emailReducer,
    ui: uiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
