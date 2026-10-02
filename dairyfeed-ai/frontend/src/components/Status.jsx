// Status = good / warn / bad / unknown. Always an icon AND text, so meaning never relies on colour.
const COLOURS = {
  good: 'var(--color-good)',
  warn: 'var(--color-warn)',
  bad: 'var(--color-bad)',
  unknown: 'var(--text-muted)',
}

export function StatusIcon({ status, size = 18 }) {
  const colour = COLOURS[status] || COLOURS.unknown
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" className="shrink-0">
      <circle cx="10" cy="10" r="10" fill={colour} />
      {status === 'good' && (
        <path
          d="M5.5 10.5l3 3 6-7"
          stroke="#fff"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {status === 'warn' && (
        <path d="M10 5v6M10 14.5v.5" stroke="#1a1a19" strokeWidth="2.4" strokeLinecap="round" />
      )}
      {status === 'bad' && (
        <path
          d="M6.5 6.5l7 7M13.5 6.5l-7 7"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      )}
      {status === 'unknown' && (
        <path
          d="M7.8 7.6a2.3 2.3 0 1 1 3.2 2.1c-.7.3-1 .8-1 1.5M10 14.5v.5"
          stroke="#fff"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

export function StatusBadge({ status, label, title }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-sm">
      <StatusIcon status={status} size={16} />
      {title && <span className="text-ink-2">{title}:</span>}
      <span className="font-medium text-ink">{label}</span>
    </span>
  )
}
