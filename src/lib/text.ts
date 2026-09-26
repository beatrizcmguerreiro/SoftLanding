export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export function truncateAtWord(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  const base = lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut
  return `${base.replace(/[\s,;:.-]+$/, '')}…`
}

export function capitalize(text: string): string {
  if (!text) return text
  return text.charAt(0).toLocaleUpperCase('en') + text.slice(1)
}

const STOPWORDS = new Set([
  'the', 'and', 'but', 'for', 'with', 'are', 'was', 'were', 'will', 'what', 'that', 'this',
  'you', 'your', 'not', 'don', 'even', 'just', 'have', 'has', 'can', 'its', 'about', 'from',
  'they', 'them', 'there', 'then', 'than', 'been', 'being', 'into', 'out', 'all', 'too',
])

export function contentWords(text: string): string[] {
  return normalize(text)
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
}

/** Share of the label's content words that also appear (by prefix stem) in the source text. */
export function overlapRatio(label: string, source: string): number {
  const words = contentWords(label)
  if (words.length === 0) return 0
  const sourceWords = contentWords(source)
  const stem = (w: string) => w.slice(0, Math.max(4, Math.ceil(w.length * 0.7)))
  const sourceStems = new Set(sourceWords.map(stem))
  const hits = words.filter((w) => sourceStems.has(stem(w))).length
  return hits / words.length
}
