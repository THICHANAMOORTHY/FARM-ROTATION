import { useTranslation } from 'react-i18next'

// Shows "Loading…" or an error with a retry button. Renders children once data is there.
export default function LoadState({ loading, error, onRetry, children }) {
  const { t } = useTranslation()
  if (error) {
    return (
      <div className="rounded-xl border border-line bg-surface p-4 text-sm" role="alert">
        <p className="text-ink">{t('common.error', { message: error.message })}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 font-medium text-accent underline"
          >
            {t('common.retry')}
          </button>
        )}
      </div>
    )
  }
  if (loading) return <p className="p-4 text-sm text-muted">{t('common.loading')}</p>
  return children
}
