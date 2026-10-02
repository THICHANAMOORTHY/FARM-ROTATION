import { useTranslation } from 'react-i18next'

import Card from '../components/Card'
import LoadState from '../components/LoadState'
import { StatusIcon } from '../components/Status'
import { DataFlags } from '../components/Tags'
import { QUALITY_STATUS, formatDateTime } from '../format'
import { href } from '../router'
import { useApi } from '../useApi'

export default function Devices() {
  const { t, i18n } = useTranslation()
  const devices = useApi('/api/devices', { refreshMs: 15000 })

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-ink">{t('devices.title')}</h1>
      <LoadState loading={devices.loading} error={devices.error} onRetry={devices.reload}>
        {devices.data?.length === 0 ? (
          <p className="text-sm text-muted">{t('devices.none')}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {devices.data?.map((d) => {
              const last = d.last_sample
              return (
                <Card key={d.device_id} title={d.name ? `${d.device_id} · ${d.name}` : d.device_id}>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink-2">{t('devices.lastSeen')}</dt>
                      <dd className="text-right text-ink">
                        {d.last_seen_at
                          ? formatDateTime(d.last_seen_at, i18n.language)
                          : t('common.never')}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink-2">{t('devices.pending')}</dt>
                      <dd className="tabular text-right text-ink">{d.pending_sync}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink-2">{t('devices.lastReading')}</dt>
                      <dd className="text-right">
                        {last ? (
                          <a
                            href={href('sample', last.sample_id)}
                            className="inline-flex items-center gap-1.5 text-ink"
                          >
                            {last.prediction && (
                              <>
                                <StatusIcon
                                  status={QUALITY_STATUS[last.prediction.quality]}
                                  size={14}
                                />
                                <span className="underline">
                                  {t(`quality.${last.prediction.quality}`)} ·{' '}
                                  {last.prediction.score}
                                </span>
                              </>
                            )}
                            <DataFlags flags={last.flags} />
                          </a>
                        ) : (
                          <span className="text-muted">{t('common.none')}</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </Card>
              )
            })}
          </div>
        )}
      </LoadState>
    </div>
  )
}
