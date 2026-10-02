import { useTranslation } from 'react-i18next'

import Card from '../components/Card'
import LoadState from '../components/LoadState'
import ResultSummary from '../components/ResultSummary'
import { StatusIcon } from '../components/Status'
import { QUALITY_STATUS } from '../format'
import { href } from '../router'
import { useApi } from '../useApi'

// Refreshes every 15 s so a new test (or the simulator) shows up without reloading.
const REFRESH_MS = 15000

function StatTile({ label, value, icon }) {
  return (
    <div className="min-w-0 rounded-lg border border-line bg-surface p-3">
      <p className="flex items-center gap-1.5 text-sm [overflow-wrap:anywhere] text-ink-2">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const { t } = useTranslation()
  const latest = useApi('/api/silage/history?page_size=1', { refreshMs: REFRESH_MS })
  const stats = useApi('/api/stats/summary', { refreshMs: REFRESH_MS })
  const sample = latest.data?.items[0]

  return (
    <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">
      <Card
        title={t('dashboard.latest')}
        action={
          sample && (
            <a
              href={href('sample', sample.sample_id)}
              className="text-sm font-medium text-accent underline"
            >
              {t('common.viewDetails')}
            </a>
          )
        }
      >
        <LoadState loading={latest.loading} error={latest.error} onRetry={latest.reload}>
          {sample ? (
            <ResultSummary sample={sample} />
          ) : (
            <p className="text-sm text-muted">{t('common.noData')}</p>
          )}
        </LoadState>
      </Card>

      <Card title={t('dashboard.summary')}>
        <LoadState loading={stats.loading} error={stats.error} onRetry={stats.reload}>
          {stats.data && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <StatTile label={t('dashboard.total')} value={stats.data.total} />
                <StatTile label={t('dashboard.awaiting')} value={stats.data.awaiting_readings} />
                <StatTile label={t('dashboard.labelled')} value={stats.data.labelled} />
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-ink">{t('dashboard.byQuality')}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['Good', 'Moderate', 'Poor'].map((q) => (
                    <StatTile
                      key={q}
                      label={t(`quality.${q}`)}
                      value={stats.data.by_quality[q]}
                      icon={<StatusIcon status={QUALITY_STATUS[q]} size={14} />}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </LoadState>
      </Card>
    </div>
  )
}
