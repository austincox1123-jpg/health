import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://austincox1123-jpg.github.io/health/
  base: '/health/',
  plugins: [react()],
})
