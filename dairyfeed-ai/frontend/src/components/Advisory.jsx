import { useTranslation } from 'react-i18next'

import { ADVISORY_STATUS } from '../format'
import { StatusIcon } from './Status'

// The farmer advisory, in the current language. The backend writes both English and Tamil.
export default function Advisory({ advisory }) {
  const { t, i18n } = useTranslation()
  if (!advisory) return null
  const status = ADVISORY_STATUS[advisory.level]
  const border = { good: 'border-l-good', warn: 'border-l-warn', bad: 'border-l-bad' }[status]
  return (
    <div className={`rounded-lg border border-line border-l-4 ${border} bg-surface-2 p-3`}>
      <div className="mb-1 flex items-center gap-2">
        <StatusIcon status={status} size={16} />
        <h3 className="text-sm font-semibold text-ink">{t('advisory.title')}</h3>
      </div>
      <p className="text-sm leading-relaxed text-ink" lang={i18n.language}>
        {i18n.language === 'ta' ? advisory.ta : advisory.en}
      </p>
    </div>
  )
}
