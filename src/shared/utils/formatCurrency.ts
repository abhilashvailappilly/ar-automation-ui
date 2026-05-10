const APP_LOCALE = 'en-IN'
const APP_CURRENCY = 'INR'

export interface FormatCurrencyOptions {
  maximumFractionDigits?: number
  minimumFractionDigits?: number
}

export function formatCurrency(amount: number, options: FormatCurrencyOptions = {}): string {
  return new Intl.NumberFormat(APP_LOCALE, {
    style: 'currency',
    currency: APP_CURRENCY,
    ...options,
  }).format(amount)
}
