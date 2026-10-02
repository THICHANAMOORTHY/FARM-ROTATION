import { useTranslation } from 'react-i18next'

// "Simulated" / "Demo" badge: shown on every sample that is not a real test.
export function DataFlags({ flags }) {
  const { t } = useTranslation()
  if (!flags?.simulated && !flags?.demo) return null
  return (
    <span
      className="inline-flex items-center rounded-md bg-sim-bg px-2 py-0.5 text-xs font-semibold text-sim-text uppercase"
      title={t('common.simulatedHint')}
    >
      {flags.simulated ? t('common.simulated') : t('common.demo')}
    </span>
  )
}

// "Rule-based" or "AI model v1": how this result was produced.
export function MethodTag({ prediction }) {
  const { t } = useTranslation()
  if (!prediction) return null
  const text =
    prediction.method === 'ml'
      ? t('common.aiModel', { version: prediction.model_version || '' })
      : t('common.ruleBased')
  return (
    <span className="inline-flex rounded-md border border-line px-2 py-0.5 text-xs text-ink-2">
      {text}
    </span>
  )
}
