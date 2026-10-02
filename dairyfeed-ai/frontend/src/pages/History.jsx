import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { query } from '../api'
import Card from '../components/Card'
import LoadState from '../components/LoadState'
import { StatusIcon } from '../components/Status'
import { DataFlags } from '../components/Tags'
import TrendChart from '../components/TrendChart'
import { QUALITY_STATUS, formatDateTime, formatNumber } from '../format'
import { href } from '../router'
import { useApi } from '../useApi'

const PAGE_SIZE = 20
const TREND_SIZE = 100
const FEED_TYPES = ['maize_silage', 'sorghum_silage', 'napier_silage', 'other']
const NO_FILTERS = { device_id: '', feed_type: '', from: '', to: '' }

// Date inputs give "2026-10-02" in the viewer's local time; the API wants full date-times.
function filterParams(filters) {
  return {
    device_id: filters.device_id,
    feed_type: filters.feed_type,
    date_from: filters.from ? new Date(`${filters.from}T00:00:00`).toISOString() : '',
    date_to: filters.to ? new Date(`${filters.to}T23:59:59.999`).toISOString() : '',
  }
}

function Field({ label, children }) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-sm text-ink-2">
      {label}
      {children}
    </label>
  )
}

const inputClass = 'w-full rounded-md border border-line bg-surface px-2 py-1.5 text-sm text-ink'

export default function History() {
  const { t, i18n } = useTranslation()
  const [filters, setFilters] = useState(NO_FILTERS)
  const [page, setPage] = useState(1)

  const params = filterParams(filters)
  const devices = useApi('/api/devices')
  const table = useApi(`/api/silage/history${query({ ...params, page, page_size: PAGE_SIZE })}`)
  const trend = useApi(`/api/silage/history${query({ ...params, page_size: TREND_SIZE })}`)
  const scoring = useApi('/api/scoring')

  function update(name, value) {
    setFilters((f) => ({ ...f, [name]: value }))
    setPage(1)
  }

  const pages = table.data ? Math.max(1, Math.ceil(table.data.total / PAGE_SIZE)) : 1
  // Charts read oldest to newest; samples without readings (photo only) are skipped.
  const points = (trend.data?.items || [])
    .filter((s) => s.readings)
    .map((s) => ({
      t: new Date(s.created_at).getTime(),
      ph: s.readings.ph,
      moisture: s.readings.moisture_pct,
      sampleTemp: s.readings.sample_temp_c,
      ambientTemp: s.readings.ambient_temp_c,
      score: s.prediction?.score,
    }))
    .reverse()
  const ideal = scoring.data?.ideal

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-ink">{t('history.title')}</h1>

      {/* Filters: one row above the charts and table, which both follow them */}
      <Card>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label={t('history.device')}>
            <select
              className={inputClass}
              value={filters.device_id}
              onChange={(e) => update('device_id', e.target.value)}
            >
              <option value="">{t('history.all')}</option>
              {(devices.data || []).map((d) => (
                <option key={d.device_id} value={d.device_id}>
                  {d.device_id}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('history.feedType')}>
            <select
              className={inputClass}
              value={filters.feed_type}
              onChange={(e) => update('feed_type', e.target.value)}
            >
              <option value="">{t('history.all')}</option>
              {FEED_TYPES.map((f) => (
                <option key={f} value={f}>
                  {t(`feed.${f}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('history.from')}>
            <input
              type="date"
              className={inputClass}
              value={filters.from}
              onChange={(e) => update('from', e.target.value)}
            />
          </Field>
          <Field label={t('history.to')}>
            <input
              type="date"
              className={inputClass}
              value={filters.to}
              onChange={(e) => update('to', e.target.value)}
            />
          </Field>
        </div>
        {Object.values(filters).some(Boolean) && (
          <button
            type="button"
            className="mt-3 text-sm font-medium text-accent underline"
            onClick={() => {
              setFilters(NO_FILTERS)
              setPage(1)
            }}
          >
            {t('history.clear')}
          </button>
        )}
      </Card>

      <Card title={t('history.trends')}>
        <LoadState loading={trend.loading} error={trend.error} onRetry={trend.reload}>
          {points.length === 0 ? (
            <p className="text-sm text-muted">{t('common.noData')}</p>
          ) : (
            <>
              <p className="mb-3 text-xs text-muted">
                {t('history.trendNote', { count: points.length })}
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <TrendChart
                  title={t('readings.ph')}
                  data={points}
                  series={[{ key: 'ph', name: t('readings.ph'), colour: 'var(--series-1)' }]}
                  ideal={ideal?.ph}
                  digits={2}
                  idealLabel={ideal && t('history.idealRange')}
                />
                <TrendChart
                  title={t('readings.moisture')}
                  data={points}
                  series={[
                    { key: 'moisture', name: t('readings.moisture'), colour: 'var(--series-1)' },
                  ]}
                  ideal={ideal?.moisture_pct}
                  unit="%"
                  idealLabel={ideal && t('history.idealRange')}
                />
                <TrendChart
                  title={t('readings.temperature')}
                  data={points}
                  series={[
                    {
                      key: 'sampleTemp',
                      name: t('readings.sampleTemp'),
                      short: t('readings.sampleShort'),
                      colour: 'var(--series-1)',
                    },
                    {
                      key: 'ambientTemp',
                      name: t('readings.ambientTemp'),
                      short: t('readings.ambientShort'),
                      colour: 'var(--series-2)',
                    },
                  ]}
                  unit=" °C"
                />
                <TrendChart
                  title={t('score.label')}
                  data={points}
                  series={[{ key: 'score', name: t('score.label'), colour: 'var(--series-1)' }]}
                  digits={0}
                />
              </div>
            </>
          )}
        </LoadState>
      </Card>

      {/* The table is also the accessible, text-only view of the chart data */}
      <Card title={t('history.table')}>
        <LoadState loading={table.loading} error={table.error} onRetry={table.reload}>
          {table.data?.items.length === 0 ? (
            <p className="text-sm text-muted">{t('common.noData')}</p>
          ) : (
            <>
              {/* Phones: a simple list. Wider screens: the full table. */}
              <ul className="divide-y divide-line sm:hidden">
                {table.data?.items.map((s) => (
                  <li key={s.sample_id}>
                    <a href={href('sample', s.sample_id)} className="block py-3">
                      <span className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1.5 font-medium text-ink">
                          {s.prediction ? (
                            <>
                              <StatusIcon status={QUALITY_STATUS[s.prediction.quality]} size={16} />
                              {t(`quality.${s.prediction.quality}`)} · {s.prediction.score}
                            </>
                          ) : (
                            <span className="text-muted">{t('readings.notReceived')}</span>
                          )}
                        </span>
                        <DataFlags flags={s.flags} />
                      </span>
                      <span className="mt-1 block text-xs text-ink-2">
                        {formatDateTime(s.created_at, i18n.language)}
                        {s.readings &&
                          ` · pH ${formatNumber(s.readings.ph, 2)} · ${formatNumber(s.readings.moisture_pct)}% · ${formatNumber(s.readings.sample_temp_c)} °C`}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-xs text-accent underline">
                        {s.sample_id}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="hidden overflow-x-auto sm:block">
                <table className="tabular w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-line text-xs text-ink-2">
                    <tr>
                      <th className="py-2 pr-3 font-medium">{t('history.time')}</th>
                      <th className="py-2 pr-3 font-medium">{t('history.sample')}</th>
                      <th className="py-2 pr-3 font-medium">{t('quality.label')}</th>
                      <th className="py-2 pr-3 text-right font-medium">{t('score.label')}</th>
                      <th className="py-2 pr-3 text-right font-medium">{t('readings.ph')}</th>
                      <th className="py-2 pr-3 text-right font-medium">{t('readings.moisture')}</th>
                      <th className="py-2 text-right font-medium">{t('readings.sampleTemp')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.data?.items.map((s) => (
                      <tr key={s.sample_id} className="border-b border-line last:border-0">
                        <td className="py-2 pr-3 whitespace-nowrap text-ink-2">
                          {formatDateTime(s.created_at, i18n.language)}
                        </td>
                        <td className="py-2 pr-3">
                          <a
                            href={href('sample', s.sample_id)}
                            className="font-mono text-xs text-accent underline"
                          >
                            {s.sample_id}
                          </a>{' '}
                          <DataFlags flags={s.flags} />
                        </td>
                        <td className="py-2 pr-3">
                          {s.prediction ? (
                            <span className="flex items-center gap-1.5 text-ink">
                              <StatusIcon status={QUALITY_STATUS[s.prediction.quality]} size={14} />
                              {t(`quality.${s.prediction.quality}`)}
                            </span>
                          ) : (
                            <span className="text-muted">–</span>
                          )}
                        </td>
                        <td className="py-2 pr-3 text-right text-ink">
                          {s.prediction?.score ?? '–'}
                        </td>
                        <td className="py-2 pr-3 text-right text-ink">
                          {formatNumber(s.readings?.ph, 2)}
                        </td>
                        <td className="py-2 pr-3 text-right text-ink">
                          {s.readings ? `${formatNumber(s.readings.moisture_pct)}%` : '–'}
                        </td>
                        <td className="py-2 text-right text-ink">
                          {s.readings ? `${formatNumber(s.readings.sample_temp_c)} °C` : '–'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-md border border-line px-3 py-1.5 text-ink disabled:opacity-40"
                >
                  {t('history.previous')}
                </button>
                <span className="text-ink-2">{t('history.page', { page, pages })}</span>
                <button
                  type="button"
                  disabled={page >= pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-md border border-line px-3 py-1.5 text-ink disabled:opacity-40"
                >
                  {t('history.next')}
                </button>
              </div>
            </>
          )}
        </LoadState>
      </Card>
    </div>
  )
}
