import { GoogleGenerativeAI } from '@google/generative-ai'
import type { RawStory, StoryInsert } from './types'
import { getWeekStart } from './supabase'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

const MAX_STORIES_PER_WEEK = 15
const VALID_TAGS = ['AI Tools', 'Strategy', 'LLMs', 'Product Management', 'Launch', 'Research', 'Funding', 'Workflows', 'Agents', 'AI Design', 'Vibe Coding', 'Dev Tools', 'Skills & Learning']
const REFUSAL_PATTERNS = [
  'unable to generate',
  'cannot provide',
  'do not have access',
  'do not have the ability',
  'knowledge cut-off',
  'knowledge cutoff',
  'as an ai',
  'future information',
  'future news',
]

function looksLikeHistoricalStory(story: {
  title: string
  source: string
  url: string
  summary: string
  tags: string[]
}): boolean {
  const text = `${story.title} ${story.source} ${story.summary}`.toLowerCase()
  const hasRefusalText = REFUSAL_PATTERNS.some((pattern) => text.includes(pattern))
  const tags = story.tags.filter((tag) => VALID_TAGS.includes(tag))

  try {
    const url = new URL(story.url)
    return (
      !hasRefusalText &&
      story.title.trim().length > 0 &&
      story.source.trim().length > 0 &&
      story.summary.trim().length > 0 &&
      tags.length > 0 &&
      url.protocol.startsWith('http') &&
      url.hostname.includes('.')
    )
  } catch {
    return false
  }
}

export async function summarizeAndTagStories(
  rawStories: RawStory[],
  batchDate?: string
): Promise<StoryInsert[]> {
  const weekStart = batchDate ?? getWeekStart()

  if (rawStories.length === 0) return []

  const articleList = rawStories
    .map((s, i) => `${i + 1}. [${s.source}] ${s.title} — ${s.url}`)
    .join('\n')

  const prompt = `You are a curating assistant for a weekly digest called "Helmut's Builder Feed" covering AI and Product Management.

Below is a list of recent articles from tech publications. Your task:
1. Select the 10 to 15 most relevant articles for product managers working with or on AI products.
   Relevance criteria: AI tools for PMs, LLM/model releases, AI product strategy, roadmapping,
   PM best practices in the AI era, industry news on AI products, launches, funding, or acquisitions,
   AI design tools (e.g. Claude Design, Stitch, Figma AI, Galileo), vibe coding trends and frameworks
   (spec-driven development, AI-assisted coding, tools like Cursor, Lovable, Bolt, v0),
   developer tools relevant to product builders, AI team workflows and how teams are restructuring work
   around AI, and skills/learning content for PMs (courses, frameworks, how to upskill for AI product work).
   Prioritise variety — pick from different sources and cover different angles of AI × PM.
2. For each selected article, write a 2–3 sentence summary explaining why it matters specifically for product managers.
3. Assign 2–4 tags per article from ONLY this list: ${VALID_TAGS.join(', ')}

Respond ONLY with a valid JSON array. No markdown, no explanation, no code fences.
Each object must have exactly these fields:
- title (string, the original article title)
- url (string, the original article URL)
- source (string, the publication name)
- summary (string, your 2-3 sentence PM-focused summary)
- tags (array of strings, from the allowed tags list only)

Articles to evaluate:
${articleList}`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(cleaned) as Array<{
      title: string; url: string; source: string; summary: string; tags: string[]
    }>

    return parsed.slice(0, MAX_STORIES_PER_WEEK).map((s) => ({
      title: s.title,
      source: s.source,
      url: s.url,
      summary: s.summary,
      tags: s.tags.filter((t) => VALID_TAGS.includes(t)),
      published_at: rawStories.find((r) => r.url === s.url)?.publishedAt ?? null,
      batch_date: weekStart,
    }))
  } catch (err) {
    console.error('Gemini summarization failed:', err)
    return rawStories.slice(0, MAX_STORIES_PER_WEEK).map((s) => ({
      title: s.title,
      source: s.source,
      url: s.url,
      summary: 'Summary unavailable — click to read the full article.',
      tags: ['AI Tools'],
      published_at: s.publishedAt,
      batch_date: weekStart,
    }))
  }
}

export async function generateDigestIntro(stories: StoryInsert[]): Promise<string> {
  const titles = stories.map((s) => `- ${s.title} (${s.source})`).join('\n')

  const prompt = `You are writing the intro paragraph for "Helmut's Builder Feed", a weekly AI × Product Management digest.

This week's stories cover:
${titles}

Write a 2–3 sentence intro that synthesizes the key themes across this week's stories, speaks directly to product managers working with AI, and has a smart, energetic builder tone. Do NOT list individual articles. Respond with just the paragraph text — no quotes, no markdown.`

  try {
    const result = await model.generateContent(prompt)
    return result.response.text().trim()
  } catch {
    return "This week's Builder Feed brings you the latest across AI tools, product strategy, and what's shaping the future of building with AI. Dive in."
  }
}

/** Generates a curated weekly digest for a past week using Gemini's knowledge */
export async function generateHistoricalWeek(weekStart: string): Promise<StoryInsert[]> {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  const weekEndStr = weekEnd.toISOString().split('T')[0]

  const prompt = `You are curating "Helmut's Builder Feed", a weekly digest of AI × Product Management news.

Generate a curated list of 10–12 real, significant stories from the week of ${weekStart} to ${weekEndStr}.
Focus on: AI model releases, AI tools for PMs, product strategy in AI, launches, funding rounds, and PM best practices in the AI era.
Use only real events and articles you know about from that time period.

For each story, provide:
- A realistic article title
- The actual source publication (TechCrunch, The Verge, MIT Tech Review, Aha.io, Lenny's Newsletter, etc.)
- A real or plausible URL for the article
- A 2–3 sentence summary of why it matters for product managers
- 2–4 tags from: ${VALID_TAGS.join(', ')}

Respond ONLY with a valid JSON array. No markdown, no code fences.
Each object: title, url, source, summary, tags (array).`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(cleaned) as Array<{
      title: string; url: string; source: string; summary: string; tags: string[]
    }>

    return parsed
      .filter(looksLikeHistoricalStory)
      .slice(0, MAX_STORIES_PER_WEEK)
      .map((s) => ({
        title: s.title,
        source: s.source,
        url: s.url,
        summary: s.summary,
        tags: s.tags.filter((t) => VALID_TAGS.includes(t)),
        published_at: weekStart,
        batch_date: weekStart,
      }))
  } catch (err) {
    console.error(`Gemini historical week failed for ${weekStart}:`, err)
    return []
  }
}
