import { useTranslation } from 'react-i18next'

// Ring showing the 0-100 score. The ring takes the quality's status colour;
// the number and words stay in normal text colour.
export default function ScoreDial({ score, status }) {
  const { t } = useTranslation()
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const filled = (Math.max(0, Math.min(100, score)) / 100) * circumference
  const colour = { good: 'var(--color-good)', warn: 'var(--color-warn)', bad: 'var(--color-bad)' }[
    status
  ]

  return (
    <div
      className="relative h-28 w-28 shrink-0"
      role="img"
      aria-label={`${t('score.label')} ${score} ${t('score.outOf')}`}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--surface-2)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={colour}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold text-ink">{score}</span>
        <span className="text-xs text-muted">{t('score.outOf')}</span>
      </div>
    </div>
  )
}
