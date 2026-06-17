# GeoAssay · Demo de Búsqueda Tabú para scheduling de laboratorio

WebApp de demostración (solo visualización) para un proyecto académico de Investigación de
Operaciones. Un solver de **Búsqueda Tabú** programa órdenes de un laboratorio geoquímico
minimizando la **suma de tiempos de finalización (Σ Cₒ)**.

Los resultados están **precalculados** y viven en `src/data.json`. Esta interfaz no ejecuta ningún
solver: solo lee y visualiza ese archivo.

## Qué muestra

- **Selector de instancia** (01..10) con su nº de órdenes.
- **Tarjetas de métricas** de la instancia activa: Σ Cₒ final, promedio, nº de órdenes, nº de
  muestras, referencia (baseline) y Δ vs referencia.
- **Diagrama de Gantt** en SVG: una fila por par (recurso, unidad), barras coloreadas por orden,
  eje X en periodos (1 periodo = 10 min). Los recursos `b=1` se marcan como "(lote)".
- **Curva de convergencia** en SVG para las instancias grandes (7 y 10), con líneas verticales en
  los reinicios del multi-arranque y línea punteada del baseline.
- **Estudio de ablación** (pivote: instancias × 5 configuraciones), con celdas resaltadas según
  mejoren o empeoren la referencia.
- **Explicabilidad** del método (representación + ASAP, vecindarios swap/insertion, lista tabú +
  aspiración + tenure, por qué ASAP, por qué D_FINAL) y un bloque honesto sobre optimalidad.

## Stack

- Vite + React (JavaScript).
- CSS plano (`src/styles.css`), estética dashboard (Linear/Vercel/Stripe), acento teal `#0D9488`.
- Gráficos hechos a mano con **SVG** (sin librerías de charting).

## Requisitos

- Node.js 18+ (probado en Node 23).
- npm 9+.

## Desarrollo local

```bash
npm install && npm run dev
```

Vite imprime la URL local (por defecto `http://localhost:5173`).

## Build de producción

```bash
npm run build      # genera dist/
npm run preview    # sirve dist/ localmente para verificar
```

## Deploy en Vercel

1. Sube esta carpeta `webapp/` a un repositorio (o conéctala como subdirectorio raíz del proyecto
   en Vercel).
2. En Vercel, crea un nuevo proyecto apuntando a esta carpeta:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install` (por defecto)
3. Deploy. No requiere variables de entorno.

> Si el repositorio tiene más carpetas, configura el **Root Directory** del proyecto en Vercel a
> `webapp`.

## Estructura

```
webapp/
├─ index.html
├─ package.json
├─ vite.config.js
├─ README.md
├─ public/                 # figuras de referencia (PNG)
└─ src/
   ├─ main.jsx
   ├─ App.jsx
   ├─ styles.css
   ├─ data.json            # datos precalculados (NO editar)
   ├─ lib/
   │  ├─ colors.js         # paleta categórica por orden + acentos
   │  └─ format.js         # formato numérico es-PE y conversión de periodos
   └─ components/
      ├─ InstanceSelector.jsx
      ├─ MetricCards.jsx
      ├─ GanttChart.jsx
      ├─ ConvergenceChart.jsx
      ├─ AblationTable.jsx
      └─ Explainability.jsx
```
