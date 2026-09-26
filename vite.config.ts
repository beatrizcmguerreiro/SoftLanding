import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { apiMiddleware } from './server/analyze.mjs'

function localApi(env: Record<string, string>): Plugin {
  const middleware = apiMiddleware({ ...process.env, ...env })
  return {
    name: 'softlanding-api',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), localApi(loadEnv(mode, process.cwd(), ''))],
}))
