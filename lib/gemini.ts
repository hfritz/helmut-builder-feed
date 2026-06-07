import { GoogleGenerativeAI } from '@google/generative-ai'
import type { RawStory, StoryInsert } from './types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

const VALID_TAGS = ['AI Tools', 'Strategy', 'LLMs', 'Product Management', 'Launch', 'Research', 'Funding', 'Workflows', 'Agents']

export async function summarizeAndTagStories(rawStories: RawStory[]): Promise<StoryInsert[]> {
  const today = new Date().toISOString().split('T')[0]

  if (rawStories.length === 0) return []

  const articleList = rawStories
    .map((s, i) => `${i + 1}. [${s.source}] ${s.title} — ${s.url}`)
    .join('\n')

  const prompt = `You are a curating assistant for a news feed called "Helmut's Builder Feed" that covers AI and Product Management.

Below is a list of recent articles from tech publications. Your task:
1. Select the 5 to 10 most relevant articles for product managers working with or on AI products.
   Relevance criteria: AI tools for PMs, LLM/model releases, AI product strategy, roadmapping,
   PM best practices in the AI era, industry news on AI products, launches, funding, or acquisitions.
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

    // Strip any accidental markdown code fences
    const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(cleaned) as Array<{
      title: string
      url: string
      source: string
      summary: string
      tags: string[]
    }>

    return parsed.map((s) => ({
      title: s.title,
      source: s.source,
      url: s.url,
      summary: s.summary,
      tags: s.tags.filter((t) => VALID_TAGS.includes(t)),
      published_at: rawStories.find((r) => r.url === s.url)?.publishedAt ?? null,
      batch_date: today,
    }))
  } catch (err) {
    console.error('Gemini summarization failed:', err)
    // Fallback: return top 7 raw stories without AI summary
    return rawStories.slice(0, 7).map((s) => ({
      title: s.title,
      source: s.source,
      url: s.url,
      summary: 'Summary unavailable — click to read the full article.',
      tags: ['AI Tools'],
      published_at: s.publishedAt,
      batch_date: today,
    }))
  }
}
