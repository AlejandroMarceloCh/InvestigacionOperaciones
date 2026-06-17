// Paleta categorica para colorear barras por orden en el Gantt.
// Hasta 24 ordenes por instancia => necesitamos >=24 colores bien diferenciados.
// Colores estables: el mismo id de orden siempre recibe el mismo color.
const ORDER_PALETTE = [
  '#0D9488', // teal (acento)
  '#2563EB', // azul
  '#DB2777', // rosa
  '#D97706', // ambar
  '#7C3AED', // violeta
  '#059669', // esmeralda
  '#DC2626', // rojo
  '#0891B2', // cian
  '#CA8A04', // dorado
  '#9333EA', // purpura
  '#16A34A', // verde
  '#E11D48', // rosa fuerte
  '#0284C7', // azul cielo
  '#EA580C', // naranja
  '#4F46E5', // indigo
  '#65A30D', // lima
  '#BE185D', // magenta
  '#0F766E', // teal oscuro
  '#B45309', // marron
  '#6D28D9', // violeta oscuro
  '#15803D', // verde bosque
  '#1D4ED8', // azul real
  '#A21CAF', // fucsia
  '#92400E', // tierra
]

export function colorForOrder(orderId) {
  // orderId es numerico (1..n). Mapeo deterministico al rango de la paleta.
  const idx = (Number(orderId) - 1) % ORDER_PALETTE.length
  return ORDER_PALETTE[idx < 0 ? 0 : idx]
}

export const ACCENT = '#2DD4BF'
export const ACCENT_DEEP = '#0D9488'
export const ACCENT_SOFT = '#99F6E4'
export const DANGER = '#F87171'
export const DANGER_SOFT = '#FCA5A5'
