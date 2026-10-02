import { useTranslation } from 'react-i18next'

import { imageUrl } from '../api'
import Breakdown from '../components/Breakdown'
import Card from '../components/Card'
import LoadState from '../components/LoadState'
import ResultSummary from '../components/ResultSummary'
import { formatDateTime, formatNumber } from '../format'
import { href } from '../router'
import { useApi } from '../useApi'

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3 border-b border-line py-2 text-sm last:border-0">
      <dt className="text-ink-2">{label}</dt>
      <dd className="tabular text-right text-ink">{value}</dd>
    </div>
  )
}

export default function SampleDetail({ sampleId }) {
  const { t, i18n } = useTranslation()
  const sample = useApi(`/api/silage/${encodeURIComponent(sampleId)}`)
  const scoring = useApi('/api/scoring')
  const s = sample.data
  const r = s?.readings

  return (
    <div className="space-y-5">
      <a href={href('history')} className="text-sm font-medium text-accent underline">
        ← {t('common.back')}
      </a>
      <h1 className="text-xl font-semibold text-ink">{t('detail.title')}</h1>

      <LoadState
        loading={sample.loading}
        error={sample.error?.status === 404 ? new Error(t('detail.notFound')) : sample.error}
        onRetry={sample.reload}
      >
        {s && (
          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <ResultSummary sample={s} />
            </Card>

            <Card title={t('detail.photo')}>
              {s.image.path ? (
                <img
                  src={imageUrl(s.sample_id)}
                  alt={`${t('detail.photo')} ${s.sample_id}`}
                  className="w-full rounded-lg border border-line"
                />
              ) : (
                <p className="text-sm text-muted">{t('detail.noPhoto')}</p>
              )}
            </Card>

            <Card title={t('readings.title')}>
              {r ? (
                <dl>
                  <Row
                    label={t('detail.time')}
                    value={`${formatDateTime(s.created_at, i18n.language)} (${t(s.time_source === 'ntp' ? 'detail.timeDevice' : 'detail.timeServer')})`}
                  />
                  <Row label={t('history.device')} value={s.device_id} />
                  <Row label={t('readings.ph')} value={formatNumber(r.ph, 2)} />
                  <Row label={t('readings.moisture')} value={`${formatNumber(r.moisture_pct)}%`} />
                  <Row
                    label={t('readings.sampleTemp')}
                    value={`${formatNumber(r.sample_temp_c)} °C`}
                  />
                  <Row
                    label={t('readings.ambientTemp')}
                    value={`${formatNumber(r.ambient_temp_c)} °C`}
                  />
                  <Row
                    label={t('readings.colour')}
                    value={
                      r.rgb ? (
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="inline-block h-4 w-4 rounded border border-line"
                            style={{ background: `rgb(${r.rgb.r}, ${r.rgb.g}, ${r.rgb.b})` }}
                            aria-hidden="true"
                          />
                          {r.rgb.r}, {r.rgb.g}, {r.rgb.b}
                        </span>
                      ) : (
                        '–'
                      )
                    }
                  />
                </dl>
              ) : (
                <p className="text-sm text-muted">{t('readings.notReceived')}</p>
              )}
            </Card>

            <Card title={t('detail.breakdown')}>
              {s.prediction && scoring.data ? (
                <Breakdown breakdown={s.prediction.breakdown} weights={scoring.data.weights} />
              ) : (
                <p className="text-sm text-muted">{t('readings.notReceived')}</p>
              )}
            </Card>

            <Card
              title={t('detail.label')}
              className="lg:col-span-2"
              action={
                <a
                  href={href('label', s.sample_id)}
                  className="text-sm font-medium text-accent underline"
                >
                  {t('detail.labelThis')}
                </a>
              }
            >
              {s.label ? (
                <dl>
                  <Row label={t('label.quality')} value={t(`quality.${s.label.quality}`)} />
                  <Row
                    label={t('label.mould')}
                    value={s.label.mould ? t(`risk.${s.label.mould}`) : t('label.notAssessed')}
                  />
                  <Row
                    label={t('label.spoilage')}
                    value={
                      s.label.spoilage ? t(`risk.${s.label.spoilage}`) : t('label.notAssessed')
                    }
                  />
                  <Row label={t('label.labelledBy')} value={s.label.labelled_by} />
                  <Row label={t('label.reference')} value={s.label.reference} />
                </dl>
              ) : (
                <p className="text-sm text-muted">{t('detail.notLabelled')}</p>
              )}
            </Card>
          </div>
        )}
      </LoadState>
    </div>
  )
}
