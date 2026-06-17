// Helpers de formato numerico en es-PE (separador de miles).
const NF = new Intl.NumberFormat('es-PE')

export function fmt(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return NF.format(n)
}

export function fmtDecimal(n, decimals = 1) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n)
}

// Convierte un periodo (unidad de 10 min) a etiqueta de tiempo legible.
export function periodToTime(periods) {
  const totalMin = periods * 10
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h${String(m).padStart(2, '0')}`
}
