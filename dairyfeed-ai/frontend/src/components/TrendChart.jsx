import { useTranslation } from 'react-i18next'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { formatDateTime, formatNumber, formatShortDate } from '../format'

// Hover tooltip: the date, then each line's value. Text stays in normal ink colours;
// the short coloured line beside each value says which series it is.
function TrendTooltip({ active, payload, series, unit, digits, language }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 text-ink-2">{formatDateTime(payload[0].payload.t, language)}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="flex items-center gap-1.5 text-ink">
          <span className="inline-block h-0.5 w-3" style={{ background: item.color }} />
          {series.length > 1 && <span className="text-ink-2">{item.name}</span>}
          <span className="tabular font-semibold">
            {formatNumber(item.value, digits)}
            {unit}
          </span>
        </p>
      ))}
    </div>
  )
}

// With two lines, each is named at its last point as well as in the legend.
function endLabel({ x, y, index }, name, lastIndex) {
  if (index !== lastIndex) return null
  return (
    <text x={x + 6} y={y} dy={4} fontSize={11} fill="var(--text-secondary)">
      {name}
    </text>
  )
}

// One measure over time. `series` is 1 or 2 lines: [{ key, name, short, colour }].
// `short` is the brief name drawn at the end of the line (the legend shows the full name).
// `ideal` = [low, high] draws the ideal range as a light grey band.
// Colours: series 1 blue, series 2 orange — validated for colour-blind separation.
export default function TrendChart({
  title,
  data,
  series,
  ideal,
  unit = '',
  digits = 1,
  idealLabel,
}) {
  const { i18n } = useTranslation()
  const axis = { fill: 'var(--text-muted)', fontSize: 11 }
  const lastIndex = data.length - 1

  return (
    <figure className="rounded-lg border border-line bg-surface p-3">
      <figcaption className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-ink">
          {title}
          {unit && <span className="font-normal text-muted"> ({unit.trim()})</span>}
        </span>
        {series.length > 1 && (
          <span className="flex gap-3 text-xs text-ink-2">
            {series.map((s) => (
              <span key={s.key} className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-4" style={{ background: s.colour }} />
                {s.name}
              </span>
            ))}
          </span>
        )}
      </figcaption>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: series.length > 1 ? 56 : 12, bottom: 0, left: -12 }}
          >
            <CartesianGrid vertical={false} stroke="var(--grid)" />
            {ideal && (
              <ReferenceArea
                y1={ideal[0]}
                y2={ideal[1]}
                fill="var(--surface-2)"
                fillOpacity={1}
                ifOverflow="extendDomain"
              />
            )}
            <XAxis
              dataKey="t"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value) => formatShortDate(value, i18n.language)}
              tick={axis}
              stroke="var(--axis)"
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              tick={axis}
              stroke="var(--axis)"
              tickLine={false}
              axisLine={false}
              width={44}
              domain={['auto', 'auto']}
            />
            <Tooltip
              content={(props) => (
                <TrendTooltip
                  {...props}
                  series={series}
                  unit={unit}
                  digits={digits}
                  language={i18n.language}
                />
              )}
              cursor={{ stroke: 'var(--axis)', strokeWidth: 1 }}
            />
            {series.map((s) => (
              <Line
                key={s.key}
                dataKey={s.key}
                name={s.name}
                stroke={s.colour}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, stroke: 'var(--surface-1)', strokeWidth: 2 }}
                isAnimationActive={false}
                label={
                  series.length > 1
                    ? (props) => endLabel(props, s.short || s.name, lastIndex)
                    : false
                }
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {idealLabel && <p className="mt-1 text-xs text-muted">{idealLabel}</p>}
    </figure>
  )
}
