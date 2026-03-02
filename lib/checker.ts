import * as diff from 'diff'
import crypto from 'crypto'

export interface CheckResult {
  success: boolean
  contentText: string | null
  contentHash: string | null
  contentLength: number
  error: string | null
}

export function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex')
}

export async function fetchPageContent(url: string, cssSelector?: string | null): Promise<CheckResult> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PageWatch/1.0; +https://pagewatch.app)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })
    clearTimeout(timeout)

    if (!response.ok) {
      return {
        success: false,
        contentText: null,
        contentHash: null,
        contentLength: 0,
        error: `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const html = await response.text()
    const text = extractText(html, cssSelector)
    const hash = hashContent(text)

    return {
      success: true,
      contentText: text.substring(0, 50000),
      contentHash: hash,
      contentLength: text.length,
      error: null,
    }
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return {
      success: false,
      contentText: null,
      contentHash: null,
      contentLength: 0,
      error: error.includes('aborted') ? 'Request timed out' : error,
    }
  }
}

function extractText(html: string, cssSelector?: string | null): string {
  // Strip scripts, styles, and HTML tags for clean text extraction
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

  return text
}

export function computeDiff(oldText: string, newText: string): {
  diffSummary: string
  linesAdded: number
  linesRemoved: number
} {
  const changes = diff.diffWords(oldText, newText)

  let added = 0
  let removed = 0
  const addedSamples: string[] = []
  const removedSamples: string[] = []

  for (const change of changes) {
    if (change.added) {
      added++
      if (addedSamples.length < 3) {
        addedSamples.push(change.value.substring(0, 100))
      }
    } else if (change.removed) {
      removed++
      if (removedSamples.length < 3) {
        removedSamples.push(change.value.substring(0, 100))
      }
    }
  }

  const parts: string[] = []
  if (added > 0) parts.push(`+${added} word${added !== 1 ? 's' : ''} added`)
  if (removed > 0) parts.push(`-${removed} word${removed !== 1 ? 's' : ''} removed`)

  const diffSummary = parts.join(', ') || 'Content changed'

  return { diffSummary, linesAdded: added, linesRemoved: removed }
}
