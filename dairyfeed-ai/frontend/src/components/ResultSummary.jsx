import { useTranslation } from 'react-i18next'

import { QUALITY_STATUS, RISK_STATUS, formatDateTime } from '../format'
import Advisory from './Advisory'
import ScoreDial from './ScoreDial'
import { StatusBadge, StatusIcon } from './Status'
import { DataFlags, MethodTag } from './Tags'

// The big result block: quality, score dial, three risk badges, advisory.
export default function ResultSummary({ sample }) {
  const { t, i18n } = useTranslation()
  const p = sample.prediction

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
        <span className="font-mono text-ink">{sample.sample_id}</span>
        <DataFlags flags={sample.flags} />
        <MethodTag prediction={p} />
      </div>
      <p className="text-sm text-ink-2">
        {formatDateTime(sample.created_at, i18n.language)} · {t(`feed.${sample.feed_type}`)}
      </p>

      {!p ? (
        <p className="text-sm text-muted">{t('readings.notReceived')}</p>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-ink-2">{t('quality.label')}</p>
              <p className="mt-1 flex items-center gap-2 text-3xl font-semibold text-ink">
                <StatusIcon status={QUALITY_STATUS[p.quality]} size={28} />
                {t(`quality.${p.quality}`)}
              </p>
            </div>
            <ScoreDial score={p.score} status={QUALITY_STATUS[p.quality]} />
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge
              status={QUALITY_STATUS[p.quality]}
              title={t('quality.label')}
              label={t(`quality.${p.quality}`)}
            />
            <StatusBadge
              status={RISK_STATUS[p.spoilage_risk]}
              title={t('risk.spoilage')}
              label={t(`risk.${p.spoilage_risk}`)}
            />
            <StatusBadge
              status={RISK_STATUS[p.mould_risk]}
              title={t('risk.mould')}
              label={t(`risk.${p.mould_risk}`)}
            />
          </div>
          <Advisory advisory={sample.advisory} />
        </>
      )}
    </div>
  )
}
