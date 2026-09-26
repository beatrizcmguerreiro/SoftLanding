import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
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

function servePitch(): Plugin {
  const file = resolve('pitch/index.html')
  const send = (_req: unknown, res: { setHeader: (name: string, value: string) => void; end: (body: string) => void }, next: () => void, url?: string) => {
    if (url !== '/pitch' && url !== '/pitch/' && url !== '/pitch/index.html') return next()
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(readFileSync(file, 'utf8'))
  }
  return {
    name: 'softlanding-pitch',
    configureServer(server) {
      server.middlewares.use((req, res, next) => send(req, res, next, req.url?.split('?')[0]))
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => send(req, res, next, req.url?.split('?')[0]))
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), localApi(loadEnv(mode, process.cwd(), '')), servePitch()],
}))
