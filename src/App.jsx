import { useState } from 'react'
import { motion } from 'framer-motion'
import data from './data.json'
import GanttChart from './components/GanttChart.jsx'
import ConvergenceChart from './components/ConvergenceChart.jsx'
import { fmt } from './lib/format.js'

const INSTANCE_IDS = Object.keys(data.instances).sort()

const reveal = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

export default function App() {
  // Instancia 07: única donde el método mejora la referencia (774 -> 770).
  const [active, setActive] = useState('07')

  const instance = data.instances[active]
  const baseline = data.baseline[active]
  const final = data.final[active]
  const delta = final - baseline

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__inner">
          <div className="brand">
            <span className="brand__mark" aria-hidden="true">G</span>
            <div>
              <div className="brand__name">GeoAssay · Búsqueda Tabú</div>
              <div className="brand__sub">Scheduling de laboratorio geoquímico</div>
            </div>
          </div>
          <span className="topbar__tag">Investigación de Operaciones · 2026</span>
        </div>
      </header>

      <main>
        <div className="container">
          <motion.section
            className="hero"
            initial="hidden"
            animate="show"
            variants={reveal}
          >
            <p className="hero__eyebrow">Minimización de Σ Cₒ</p>
            <h1 className="hero__title">Cronograma y convergencia del solver</h1>
            <p className="hero__lead">
              Búsqueda Tabú con vecindarios mixtos y multi-arranque sobre una permutación de
              prioridad. La interfaz visualiza el cronograma factible y cómo converge el método.
            </p>

            <div className="hero__stats">
              <div className="stat stat--accent">
                <div className="stat__label">Σ Cₒ propuesto</div>
                <div className="stat__value">
                  {fmt(final)}
                  {delta < 0 && <span className="stat__delta">{delta}</span>}
                </div>
                <div className="stat__hint">instancia {active}</div>
              </div>
              <div className="stat">
                <div className="stat__label">Referencia</div>
                <div className="stat__value num">{fmt(baseline)}</div>
                <div className="stat__hint">oráculo C++</div>
              </div>
              <div className="stat">
                <div className="stat__label">Órdenes</div>
                <div className="stat__value num">{instance.n_orders}</div>
                <div className="stat__hint">{instance.n_samples} muestras</div>
              </div>
            </div>
          </motion.section>

          <motion.div initial="hidden" animate="show" variants={reveal} transition={{ delay: 0.08 }}>
            <GanttChart
              instance={instance}
              resources={data.resources}
              instanceId={active}
              instanceIds={INSTANCE_IDS}
              onSelect={setActive}
            />
          </motion.div>

          <motion.div initial="hidden" animate="show" variants={reveal} transition={{ delay: 0.16 }}>
            <ConvergenceChart convergence={data.convergence} baseline={data.baseline} final={data.final} />
          </motion.div>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>
            Resultados precalculados (oráculo C++ como referencia y método propuesto en Julia).
            Esta interfaz solo visualiza; no ejecuta ningún solver.
          </p>
        </div>
      </footer>
    </div>
  )
}
