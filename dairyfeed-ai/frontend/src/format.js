// Dates and numbers, in the current language's style. Times show in the viewer's time zone.
export function formatDateTime(value, language) {
  if (!value) return ''
  return new Intl.DateTimeFormat(language === 'ta' ? 'ta-IN' : 'en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatShortDate(value, language) {
  return new Intl.DateTimeFormat(language === 'ta' ? 'ta-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(value))
}

export function formatNumber(value, digits = 1) {
  if (value === null || value === undefined) return '–'
  return Number(value).toFixed(digits)
}

// Which status colour a result uses. Text always appears next to it, never colour alone.
export const QUALITY_STATUS = { Good: 'good', Moderate: 'warn', Poor: 'bad' }
export const RISK_STATUS = { Low: 'good', Medium: 'warn', High: 'bad', Unknown: 'unknown' }
export const ADVISORY_STATUS = { ok: 'good', warn: 'warn', danger: 'bad' }
