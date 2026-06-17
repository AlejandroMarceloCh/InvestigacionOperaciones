import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build estandar Vite + React (JS). Output en dist/. Preset Vite en Vercel.
export default defineConfig({
  plugins: [react()],
})
