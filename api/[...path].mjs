import { apiMiddleware } from '../server/analyze.mjs'

const api = apiMiddleware()

export default async function handler(req, res) {
  const url = req.url ?? '/'
  if (!url.startsWith('/api')) req.url = `/api${url.startsWith('/') ? url : `/${url}`}`
  await api(req, res, () => {
    res.statusCode = 404
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.setHeader('cache-control', 'no-store')
    res.end(JSON.stringify({ error: 'not_found' }))
  })
}

export const config = {
  api: { bodyParser: false },
  maxDuration: 30,
}
