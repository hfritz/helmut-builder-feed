import { createClient } from '@supabase/supabase-js'
import type { Story, StoryInsert } from './types'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

/** Returns the Monday of the given date's week as YYYY-MM-DD */
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export async function getThisWeeksStories(weekStart: string = getWeekStart()): Promise<Story[]> {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('batch_date', weekStart)
    .order('rank', { ascending: true, nullsFirst: false })
    .limit(15)

  if (error) {
    console.error('Supabase read error:', error.message)
    return []
  }
  return (data as Story[]) ?? []
}

// Slow-publishing sources can keep the same item in their "latest" feed for weeks —
// exclude anything already published in a recent batch to avoid repeating stories.
export const DEDUP_WINDOW_DAYS = 21

/** URLs already published in any batch within the last `days` days, so a week's fetch can exclude repeats. */
export async function getRecentlyUsedUrls(days: number): Promise<Set<string>> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('stories')
    .select('url')
    .gte('batch_date', cutoffStr)

  if (error) {
    console.error('Get recently used URLs error:', error.message)
    return new Set()
  }
  return new Set((data ?? []).map((d) => d.url as string))
}

export async function saveStories(stories: StoryInsert[]): Promise<void> {
  const { error } = await supabase
    .from('stories')
    .upsert(stories, { onConflict: 'url,batch_date' })

  if (error) {
    console.error('Supabase write error:', error.message)
  }
}

export async function deleteWeeksStories(weekStart: string): Promise<void> {
  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('batch_date', weekStart)

  if (error) {
    console.error('Supabase delete error:', error.message)
  }
}

export async function saveWeeklySummary(weekStart: string, summary: string, teaser: string): Promise<void> {
  const { error } = await supabase
    .from('weekly_summaries')
    .upsert({ week_start: weekStart, summary, teaser }, { onConflict: 'week_start' })

  if (error) {
    console.error('Supabase weekly summary write error:', error.message)
  }
}

export async function getWeeklySummary(weekStart: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('weekly_summaries')
    .select('summary')
    .eq('week_start', weekStart)
    .single()

  if (error) return null
  return data?.summary ?? null
}

export async function getWeeklySummaryTeaser(weekStart: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('weekly_summaries')
    .select('teaser')
    .eq('week_start', weekStart)
    .single()

  if (error) return null
  return data?.teaser ?? null
}

export async function searchArchive(query: string): Promise<Story[]> {
  const weekStart = getWeekStart()
  const q = query.trim()

  let builder = supabase
    .from('stories')
    .select('*')
    .lt('batch_date', weekStart)
    .order('batch_date', { ascending: false })
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(60)

  if (q) {
    const VALID_TAGS = ['AI Tools', 'Strategy', 'LLMs', 'Product Management', 'Launch', 'Research', 'Funding', 'Workflows', 'Agents', 'AI Design', 'Vibe Coding', 'Dev Tools', 'Skills & Learning']
    const matchingTags = VALID_TAGS.filter((t) => t.toLowerCase().includes(q.toLowerCase()))
    const conditions = [
      `title.ilike.%${q}%`,
      `summary.ilike.%${q}%`,
      ...matchingTags.map((t) => `tags.cs.{${t}}`),
    ].join(',')
    builder = builder.or(conditions)
  }

  const { data, error } = await builder
  if (error) {
    console.error('Supabase archive search error:', error.message)
    return []
  }
  return (data as Story[]) ?? []
}
