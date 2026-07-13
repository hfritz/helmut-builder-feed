import { XMLParser } from 'fast-xml-parser'
import type { RawStory } from './types'

function decodeEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

const RSS_SOURCES = [
  // AI & Tech news
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/' },
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/ai/index.xml' },
  { name: 'Hacker News', url: 'https://hnrss.org/frontpage?q=AI&count=20' },
  // Product management
  { name: 'Aha.io', url: 'https://www.aha.io/blog/feed.xml' },
  { name: 'ProductBoard', url: 'https://www.productboard.com/feed' },
  { name: "Lenny's Newsletter", url: 'https://www.lennysnewsletter.com/feed' },
  { name: 'Product Hunt', url: 'https://www.producthunt.com/feed' },
  // Vibe coding & AI dev tools
  { name: 'Vercel Blog', url: 'https://vercel.com/atom' },
  { name: 'GitHub Blog', url: 'https://github.blog/feed/' },
  { name: 'Simon Willison', url: 'https://simonwillison.net/atom/entries/' },
  { name: 'The Pragmatic Engineer', url: 'https://newsletter.pragmaticengineer.com/feed' },
  // AI design
  { name: 'Smashing Magazine', url: 'https://www.smashingmagazine.com/feed/' },
  { name: 'UX Collective', url: 'https://uxdesign.cc/feed' },
]

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) => ['item', 'entry'].includes(name),
})

// Digest covers "last week" — a small buffer past 7 days absorbs cron/timezone drift
// and slower-publishing sources without letting genuinely stale articles back in.
const MAX_ARTICLE_AGE_MS = 8 * 24 * 60 * 60 * 1000
const FUTURE_TOLERANCE_MS = 60 * 60 * 1000 // clock skew allowance

function isRecent(publishedAt: string | null): boolean {
  if (!publishedAt) return false
  const publishedMs = new Date(publishedAt).getTime()
  if (Number.isNaN(publishedMs)) return false
  const age = Date.now() - publishedMs
  return age >= -FUTURE_TOLERANCE_MS && age <= MAX_ARTICLE_AGE_MS
}

function extractItems(parsed: Record<string, unknown>, sourceName: string): RawStory[] {
  const stories: RawStory[] = []

  // RSS 2.0 format
  const rss = parsed.rss as Record<string, unknown> | undefined
  if (rss?.channel) {
    const channel = rss.channel as Record<string, unknown>
    const items = (channel.item as Record<string, unknown>[] | undefined) ?? []
    for (const item of items) {
      const title = decodeEntities(String(item.title ?? ''))
      const url = String(item.link ?? item.guid ?? '').trim()
      const pubDate = item.pubDate ? String(item.pubDate) : null
      if (title && url) {
        stories.push({ title, url, source: sourceName, publishedAt: pubDate })
      }
    }
    return stories
  }

  // Atom format (e.g. The Verge)
  const feed = parsed.feed as Record<string, unknown> | undefined
  if (feed) {
    const entries = (feed.entry as Record<string, unknown>[] | undefined) ?? []
    for (const entry of entries) {
      const title = decodeEntities(String((entry.title as Record<string, unknown>)?.['#text'] ?? entry.title ?? ''))
      const linkObj = entry.link as Record<string, unknown> | Record<string, unknown>[] | undefined
      const url = Array.isArray(linkObj)
        ? String(linkObj[0]?.['@_href'] ?? '')
        : String((linkObj as Record<string, unknown>)?.['@_href'] ?? '')
      const pubDate = entry.updated ? String(entry.updated) : null
      if (title && url) {
        stories.push({ title, url, source: sourceName, publishedAt: pubDate })
      }
    }
    return stories
  }

  return stories
}

export async function fetchAllFeeds(): Promise<RawStory[]> {
  const seen = new Set<string>()
  const all: RawStory[] = []

  await Promise.allSettled(
    RSS_SOURCES.map(async ({ name, url }) => {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'HelmutBuilderFeed/1.0' },
          cache: 'no-store',
          signal: AbortSignal.timeout(8000),
        })
        if (!res.ok) return
        const xml = await res.text()
        const parsed = parser.parse(xml) as Record<string, unknown>
        const items = extractItems(parsed, name)
        const recent = items.filter((item) => isRecent(item.publishedAt))
        for (const item of recent.slice(0, 7)) {
          if (!seen.has(item.url)) {
            seen.add(item.url)
            all.push(item)
          }
        }
        if (recent.length < items.length) {
          console.log(`[RSS] ${name}: dropped ${items.length - recent.length} stale/undated of ${items.length} items`)
        }
      } catch (err) {
        console.warn(`RSS fetch failed for ${name}:`, err)
      }
    })
  )

  console.log(`[RSS] ${all.length} recent articles across ${RSS_SOURCES.length} sources`)
  // Give Gemini a large pool of *recent* articles — it decides what's relevant within that
  return all
}
