import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project sites are served from /<repo>/, so the base path must
// match the repository name. Override with VITE_BASE if you rename the repo.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/multiplayer-game/',
  // Top-level await in src/backend/index.js keeps Firebase out of the bundle
  // when no config is present; needs a modern target.
  build: { target: 'esnext' },
  esbuild: { target: 'esnext' },
})
