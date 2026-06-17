import { useMemo, useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { colorForOrder } from '../lib/colors.js'
import { periodToTime } from '../lib/format.js'

export default function GanttChart({ instance, resources, instanceId, instanceIds, onSelect }) {
  const [tip, setTip] = useState(null)
  const [containerW, setContainerW] = useState(980)
  const scrollRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setContainerW(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { rows, maxFin, orders } = useMemo(() => {
    const sched = instance.schedule
    const rowKeys = [...new Set(sched.map((s) => `${s.recurso}|${s.unidad}`))]
    rowKeys.sort((a, b) => {
      const [ra, ua] = a.split('|').map(Number)
      const [rb, ub] = b.split('|').map(Number)
      return ra - rb || ua - ub
    })
    const rows = rowKeys.map((k) => {
      const [recurso, unidad] = k.split('|').map(Number)
      const ops = sched.filter((s) => s.recurso === recurso && s.unidad === unidad)
      const res = resources[String(recurso)]
      return { recurso, unidad, ops, isBatch: res ? res.b === 1 : false }
    })
    const maxFin = Math.max(...sched.map((s) => s.fin))
    const orders = [...new Set(sched.map((s) => s.orden))].sort((a, b) => a - b)
    return { rows, maxFin, orders }
  }, [instance, resources])

  const ROW_H = 28
  const LABEL_W = 124
  const PAD_TOP = 26
  const PAD_BOTTOM = 34
  const availableW = Math.max(400, containerW - LABEL_W - 16)
  const PERIOD_W = Math.max(10, Math.min(32, Math.floor(availableW / maxFin)))
  const plotW = maxFin * PERIOD_W
  const svgW = LABEL_W + plotW + 16
  const svgH = PAD_TOP + rows.length * ROW_H + PAD_BOTTOM

  const tickStep = maxFin > 50 ? 10 : maxFin > 25 ? 5 : 2
  const ticks = []
  for (let t = 0; t <= maxFin; t += tickStep) ticks.push(t)

  function showTip(e, op) {
    setTip({ op, x: e.clientX, y: e.clientY })
  }

  return (
    <section className="card" aria-label="Diagrama de Gantt">
      <div className="card__head">
        <div>
          <h2 className="card__title">Diagrama de Gantt</h2>
          <p className="card__sub">
            Cronograma factible · {rows.length} unidades de recurso · horizonte de {maxFin} periodos
            (1 periodo = 10 min). Pasa el cursor sobre una barra para ver el detalle.
          </p>
        </div>
        <div className="chips" role="group" aria-label="Seleccionar instancia">
          <span className="chips__label">Instancia</span>
          {instanceIds.map((id) => (
            <button
              key={id}
              type="button"
              className="chip"
              aria-pressed={id === instanceId}
              onClick={() => onSelect(id)}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      <div className="gantt-scroll" ref={scrollRef}>
        <svg
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="gantt-svg"
          role="img"
          aria-label={`Cronograma de la instancia ${instanceId}`}
        >
          {ticks.map((t) => {
            const x = LABEL_W + t * PERIOD_W
            return (
              <g key={`tick-${t}`}>
                <line x1={x} y1={PAD_TOP - 4} x2={x} y2={PAD_TOP + rows.length * ROW_H} className="gantt-grid" />
                <text x={x} y={PAD_TOP - 10} className="gantt-axis-label" textAnchor="middle">{t}</text>
              </g>
            )
          })}

          {rows.map((row, ri) => {
            const y = PAD_TOP + ri * ROW_H
            return (
              <g key={`row-${row.recurso}-${row.unidad}`}>
                {ri % 2 === 1 && (
                  <rect x={LABEL_W} y={y} width={plotW} height={ROW_H} className="gantt-row-bg" />
                )}
                <text x={LABEL_W - 10} y={y + ROW_H / 2 + 4} className="gantt-row-label" textAnchor="end">
                  R{row.recurso}{row.isBatch ? '·L' : ''} u{row.unidad}
                </text>
              </g>
            )
          })}

          {/* barras: key por instancia para re-animar al cambiar de instancia */}
          <g key={instanceId}>
            {rows.map((row, ri) => {
              const y = PAD_TOP + ri * ROW_H
              return row.ops.map((op, oi) => {
                const bx = LABEL_W + op.inicio * PERIOD_W
                const bw = Math.max(3, (op.fin - op.inicio) * PERIOD_W)
                const delay = Math.min(0.6, (op.inicio / maxFin) * 0.55)
                return (
                  <motion.rect
                    key={`op-${ri}-${oi}`}
                    x={bx}
                    y={y + 4}
                    width={bw}
                    height={ROW_H - 8}
                    rx={3}
                    fill={colorForOrder(op.orden)}
                    className="gantt-bar"
                    style={{ transformBox: 'fill-box', transformOrigin: 'left center' }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                    onMouseEnter={(e) => showTip(e, op)}
                    onMouseMove={(e) => showTip(e, op)}
                    onMouseLeave={() => setTip(null)}
                  />
                )
              })
            })}
          </g>

          <line
            x1={LABEL_W}
            y1={PAD_TOP + rows.length * ROW_H}
            x2={LABEL_W + plotW}
            y2={PAD_TOP + rows.length * ROW_H}
            className="gantt-axis"
          />
          <text x={LABEL_W + plotW / 2} y={svgH - 6} className="gantt-axis-title" textAnchor="middle">
            Periodos (1 = 10 min) · L = recurso por lotes
          </text>
        </svg>
      </div>

      <div className="legend">
        <span className="legend__title">Órdenes</span>
        <div className="legend__items">
          {orders.map((o) => (
            <span key={`leg-${o}`} className="legend__item">
              <span className="legend__swatch" style={{ background: colorForOrder(o) }} />
              O{o}
            </span>
          ))}
        </div>
      </div>

      {tip && (
        <div
          className="tooltip"
          style={{ left: Math.min(tip.x + 14, window.innerWidth - 250), top: tip.y + 14 }}
        >
          <div className="tooltip__title">
            <span className="tooltip__dot" style={{ background: colorForOrder(tip.op.orden) }} />
            Orden {tip.op.orden} · muestra {tip.op.muestra}
          </div>
          <div className="tooltip__row">tarea {tip.op.tarea} · R{tip.op.recurso} u{tip.op.unidad}</div>
          <div className="tooltip__row">
            [{tip.op.inicio}, {tip.op.fin}] · {periodToTime(tip.op.fin - tip.op.inicio)}
          </div>
        </div>
      )}
    </section>
  )
}
