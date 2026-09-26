import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { apiMiddleware, aiEnabled } from './analyze.mjs'

const root = fileURLToPath(new URL('../dist/', import.meta.url))
const port = Number(process.env.PORT) || 4173
const api = apiMiddleware()

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
}

async function serveStatic(req, res) {
  const path = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '')
  let file = join(root, path)
  if (!file.startsWith(root)) file = join(root, 'index.html')
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html')
  } catch {
    file = join(root, 'index.html')
  }
  try {
    const data = await readFile(file)
    res.setHeader('content-type', TYPES[extname(file)] ?? 'application/octet-stream')
    res.end(data)
  } catch {
    res.statusCode = 404
    res.end('Not found')
  }
}

createServer((req, res) => api(req, res, () => serveStatic(req, res))).listen(port, () => {
  console.log(`SoftLanding on http://localhost:${port} — AI ${aiEnabled() ? 'on' : 'off (local fallback)'}`)
})
