import { useId, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { fmt } from '../lib/format.js'

const ACCENT = '#2dd4bf'

// Curva de convergencia (mejor Σ Cₒ vs iteración) para las instancias con traza
// registrada (07 y 10). El eje Y se enfoca cerca del óptimo para que la mejora
// final sea legible; la caída inicial brusca entra clipeada desde el tope.
export default function ConvergenceChart({ convergence, baseline, final }) {
  const available = Object.keys(convergence).sort()
  const [sel, setSel] = useState(available[0])
  const clipId = useId()

  const conv = convergence[sel]
  const base = baseline[sel]
  const fin = final[sel]

  const W = 900
  const H = 340
  const M = { top: 26, right: 28, bottom: 46, left: 64 }
  const plotW = W - M.left - M.right
  const plotH = H - M.top - M.bottom

  const calc = useMemo(() => {
    const series = conv.series
    const xMax = Math.max(...series.map((p) => p.it))
    const bests = series.map((p) => p.best)
    const lo = Math.min(...bests) // óptimo final
    const span = Math.max(base - lo, 0) // mejora respecto al plateau de referencia
    // Ventana enfocada y centrada sobre el plateau/óptimo.
    const yMin = lo - Math.max(2, span)
    const yMax = base + Math.max(6, span)
    const entry = bests[0] // valor del que parte la curva (queda sobre el tope)

    const xScale = (it) => M.left + (xMax === 0 ? 0 : (it / xMax) * plotW)
    const yScale = (v) => M.top + (yMax === yMin ? 0 : (1 - (v - yMin) / (yMax - yMin)) * plotH)

    let d = ''
    series.forEach((p, i) => {
      const x = xScale(p.it)
      const y = yScale(p.best)
      if (i === 0) d += `M ${x} ${y}`
      else d += ` L ${x} ${yScale(series[i - 1].best)} L ${x} ${y}`
    })
    const area = `${d} L ${xScale(xMax)} ${M.top + plotH} L ${xScale(0)} ${M.top + plotH} Z`

    const runX = (conv.run_bounds || []).map((b) => xScale(b))
    return {
      path: d, area, xMax, yMin, yMax, entry, xScale, yScale, runX,
      baseY: yScale(base), finX: xScale(xMax), finY: yScale(fin),
    }
  }, [conv, base, fin, plotW, plotH])

  const { path, area, xMax, yMin, yMax, entry, xScale, yScale, runX, baseY, finX, finY } = calc

  const yTicks = []
  for (let i = 0; i <= 4; i++) yTicks.push(Math.round(yMin + ((yMax - yMin) * i) / 4))
  const xTicks = []
  for (let t = 0; t <= xMax; t += 800) xTicks.push(t)

  const improved = fin < base

  return (
    <section className="card" aria-label="Convergencia">
      <div className="card__head">
        <div>
          <h2 className="card__title">Convergencia</h2>
          <p className="card__sub">
            Mejor Σ Cₒ acumulado por iteración. Las verticales marcan los reinicios del
            multi-arranque; la punteada es la referencia ({fmt(base)}). La vista enfoca el tramo
            cercano al óptimo (la curva parte de {fmt(entry)}).
          </p>
        </div>
        <div className="seg" role="group" aria-label="Seleccionar instancia con traza">
          {available.map((id) => (
            <button
              key={id}
              type="button"
              className="seg__btn"
              aria-pressed={id === sel}
              onClick={() => setSel(id)}
            >
              inst {id}
            </button>
          ))}
        </div>
      </div>

      <div className="card__body">
        <svg viewBox={`0 0 ${W} ${H}`} className="conv-svg" role="img" aria-label={`Convergencia de la instancia ${sel}`}>
          <defs>
            <clipPath id={clipId}>
              <rect x={M.left} y={M.top - 2} width={plotW} height={plotH + 2} />
            </clipPath>
            <linearGradient id={`${clipId}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity="0.22" />
              <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
            </linearGradient>
          </defs>

          {yTicks.map((v, i) => {
            const y = yScale(v)
            return (
              <g key={`yt-${i}`}>
                <line x1={M.left} y1={y} x2={W - M.right} y2={y} className="conv-grid" />
                <text x={M.left - 12} y={y + 4} className="conv-axis-label" textAnchor="end">{fmt(v)}</text>
              </g>
            )
          })}

          {xTicks.map((t, i) => (
            <text key={`xt-${i}`} x={xScale(t)} y={H - M.bottom + 22} className="conv-axis-label" textAnchor="middle">
              {fmt(t)}
            </text>
          ))}

          {runX.map((x, i) => (
            <g key={`rb-${i}`}>
              <line x1={x} y1={M.top} x2={x} y2={M.top + plotH} className="conv-run" />
              <text x={x} y={M.top - 8} className="conv-run-label" textAnchor="middle">R{i + 2}</text>
            </g>
          ))}

          <line x1={M.left} y1={baseY} x2={W - M.right} y2={baseY} className="conv-baseline" />
          {improved && (
            <text x={W - M.right} y={baseY - 8} className="conv-baseline-label" textAnchor="end">
              referencia {fmt(base)}
            </text>
          )}

          <g clipPath={`url(#${clipId})`}>
            <motion.path
              key={`area-${sel}`}
              d={area}
              fill={`url(#${clipId}-fill)`}
              stroke="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
            <motion.path
              key={sel}
              d={path}
              fill="none"
              stroke={ACCENT}
              strokeWidth={2.4}
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0.4 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
            />
          </g>

          <motion.g
            key={`fin-${sel}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.4 }}
          >
            <circle cx={finX} cy={finY} r={5} fill={ACCENT} />
            <circle cx={finX} cy={finY} r={9} fill="none" stroke={ACCENT} strokeWidth={1} opacity={0.4} />
            <text x={finX - 10} y={finY + (improved ? 22 : -12)} className="conv-final-label" textAnchor="end">
              {improved ? `final ${fmt(fin)} (${fin - base})` : `piso ${fmt(fin)}`}
            </text>
          </motion.g>

          <text x={M.left + plotW / 2} y={H - 6} className="conv-axis-title" textAnchor="middle">Iteración</text>
          <text transform={`translate(18 ${M.top + plotH / 2}) rotate(-90)`} className="conv-axis-title" textAnchor="middle">
            mejor Σ Cₒ
          </text>
        </svg>
      </div>
    </section>
  )
}
