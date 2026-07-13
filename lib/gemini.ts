import { GoogleGenerativeAI } from '@google/generative-ai'
import type { RawStory, StoryInsert } from './types'
import { getWeekStart } from './supabase'
import { citationsToPlainText } from './citations'

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
4. Order the array with the single most important, attention-worthy story first, then the rest by
   descending importance. "Most important" means most consequential for a PM's actual decisions this
   week — a major model release or a widely-relevant strategy shift outranks a minor tool update.

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

    return parsed.slice(0, MAX_STORIES_PER_WEEK).map((s, i) => ({
      title: s.title,
      source: s.source,
      url: s.url,
      summary: s.summary,
      tags: s.tags.filter((t) => VALID_TAGS.includes(t)),
      published_at: rawStories.find((r) => r.url === s.url)?.publishedAt ?? null,
      batch_date: weekStart,
      rank: i + 1,
    }))
  } catch (err) {
    console.error('Gemini summarization failed:', err)
    return rawStories.slice(0, MAX_STORIES_PER_WEEK).map((s, i) => ({
      title: s.title,
      source: s.source,
      url: s.url,
      summary: 'Summary unavailable — click to read the full article.',
      tags: ['AI Tools'],
      published_at: s.publishedAt,
      batch_date: weekStart,
      rank: i + 1,
    }))
  }
}

/**
 * Resolves "[N]" citation markers (referencing the prompt's numbered story list) to
 * "[N](url)" using the trusted story array — never the model's own URL text — so every
 * citation in the stored summary points at a real, fetched article.
 */
function resolveCitations(text: string, stories: StoryInsert[]): string {
  return text.replace(/\[(\d+)\]/g, (match, numStr) => {
    const story = stories[parseInt(numStr, 10) - 1]
    return story ? `[${numStr}](${story.url})` : ''
  })
}

export async function generateDigestIntro(stories: StoryInsert[]): Promise<string> {
  const context = stories
    .map((s, i) => `${i + 1}. ${s.title} (${s.source}): ${s.summary}`)
    .join('\n')

  const prompt = `You are writing the intro for "Helmut's Builder Feed", a curated Monday snapshot of AI × Product Management news, read by product managers.

This Monday's stories, most important first:
${context}

Write a 4–6 sentence recap covering most of the stories above — not just the top one — with a smart,
energetic builder tone. Requirements:
- After every specific claim, add a citation marker referencing that story's number from the list above,
  in the exact format [N] placed immediately after the claim, e.g. "...GPT-5.6 now powers Copilot 365[1]."
- Be concrete: name actual products, companies, models, or numbers pulled from each story's summary —
  never vague scene-setting like "the AI landscape is evolving."
- Where a real connecting thread exists between stories (a shared theme, a tension, a "meanwhile"),
  group them by it rather than listing flatly.
- Tell the reader what to do or watch for, not just what happened.
- Do not use markdown, bullet points, or actual links — plain prose with [N] markers only.

Respond with just the paragraph text — no quotes, no markdown.`

  try {
    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()
    return resolveCitations(raw, stories)
  } catch {
    return "This week's Builder Feed brings you the latest across AI tools, product strategy, and what's shaping the future of building with AI. Dive in."
  }
}

/** Short (6-10 word) email subject-line teaser summarizing the week's overall theme, not just the top story. */
export async function generateSubjectTeaser(stories: StoryInsert[], intro: string): Promise<string> {
  const prompt = `Here is this week's "Helmut's Builder Feed" recap (an AI × Product Management digest):

${citationsToPlainText(intro)}

Write a single email subject-line teaser, 6-10 words. Requirements:
- Find one real connecting thread that runs across at least two different stories in the recap above
  (a shared theme, a tension, a "meanwhile") — the same kind of thread the recap itself draws out.
  Do not just restate the opening story or lead with only the first thing mentioned.
- Be concrete: name an actual product, company, or number from the recap, but in service of that
  thread, not as a standalone headline.
- No quotes, no markdown, no trailing punctuation, no generic phrases like "this week in AI."

Respond with just the teaser text.`

  try {
    const result = await model.generateContent(prompt)
    const teaser = result.response.text().trim().replace(/^["']|["']$/g, '')
    if (teaser) return teaser
  } catch {
    // fall through to title-based fallback
  }

  const fallback = stories[0]?.title ?? "This week's Builder Feed"
  return fallback.length > 70 ? `${fallback.slice(0, 67)}...` : fallback
}

export async function generateLinkedInHashtags(stories: StoryInsert[]): Promise<string> {
  const context = stories.map((s) => `- ${s.title} [${s.tags.join(', ')}]`).join('\n')

  const prompt = `Based on these AI × Product Management stories, generate 5-6 LinkedIn hashtags.

Stories:
${context}

Rules:
- Mix 2-3 broad hashtags (#AI, #ProductManagement, #ProductStrategy) with 2-3 specific ones based on this week's themes
- No spaces inside hashtags, CamelCase for multi-word ones
- Return only the hashtags separated by spaces, nothing else
- Example: #AI #ProductManagement #LLMs #AgenticAI #VibeCoding`

  try {
    const result = await model.generateContent(prompt)
    return result.response.text().trim()
  } catch {
    return '#AI #ProductManagement #BuilderFeed'
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
      .map((s, i) => ({
        title: s.title,
        source: s.source,
        url: s.url,
        summary: s.summary,
        tags: s.tags.filter((t) => VALID_TAGS.includes(t)),
        published_at: weekStart,
        batch_date: weekStart,
        rank: i + 1,
      }))
  } catch (err) {
    console.error(`Gemini historical week failed for ${weekStart}:`, err)
    return []
  }
}
