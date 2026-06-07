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
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/' },
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
  { name: 'The Verge', url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml' },
  { name: 'Hacker News', url: 'https://hnrss.org/frontpage?q=AI' },
  { name: 'Aha.io', url: 'https://www.aha.io/blog/feed.xml' },
  { name: 'ProductBoard', url: 'https://www.productboard.com/feed' },
  { name: 'Atlassian', url: 'https://www.atlassian.com/blog/rss' },
  { name: "Lenny's Newsletter", url: 'https://www.lennysnewsletter.com/feed' },
  { name: 'Product Hunt', url: 'https://www.producthunt.com/feed' },
]

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) => ['item', 'entry'].includes(name),
})

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
        for (const item of items) {
          if (!seen.has(item.url)) {
            seen.add(item.url)
            all.push(item)
          }
        }
      } catch (err) {
        console.warn(`RSS fetch failed for ${name}:`, err)
      }
    })
  )

  // Return up to 30 candidates for Gemini to filter
  return all.slice(0, 30)
}
