import { useTranslation } from 'react-i18next'

// How the score was made: points earned out of each component's weight.
// "visual" is null when there is no usable photo: shown as "not scored", never as zero.
const COMPONENTS = [
  ['ph', 'readings.ph'],
  ['moisture', 'readings.moisture'],
  ['temperature', 'readings.temperature'],
  ['visual', 'detail.photo'],
]

export default function Breakdown({ breakdown, weights }) {
  const { t } = useTranslation()
  return (
    <ul className="space-y-3">
      {COMPONENTS.map(([key, labelKey]) => {
        const earned = breakdown[key]
        const max = weights[key]
        return (
          <li key={key}>
            <div className="mb-1 flex justify-between gap-2 text-sm">
              <span className="text-ink">{t(labelKey)}</span>
              <span className="tabular text-ink-2">
                {earned === null || earned === undefined
                  ? t('detail.noVisual')
                  : t('detail.points', { earned, max })}
              </span>
            </div>
            <div className="h-2 rounded-full bg-surface-2">
              {earned !== null && earned !== undefined && (
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${(earned / max) * 100}%`, background: 'var(--series-1)' }}
                />
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
