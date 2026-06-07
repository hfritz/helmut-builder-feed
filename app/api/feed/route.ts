import { NextResponse } from 'next/server'
import { getThisWeeksStories, saveStories, deleteWeeksStories, getWeekStart } from '@/lib/supabase'
import { fetchAllFeeds } from '@/lib/rss'
import { summarizeAndTagStories } from '@/lib/gemini'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    let stories = await getThisWeeksStories()

    if (stories.length === 0) {
      const raw = await fetchAllFeeds()
      const summarized = await summarizeAndTagStories(raw)
      await saveStories(summarized)
      stories = await getThisWeeksStories()
    }

    return NextResponse.json({
      stories,
      lastUpdated: stories[0]?.fetched_at ?? null,
      fromCache: true,
    })
  } catch (err) {
    console.error('Feed GET error:', err)
    return NextResponse.json({ error: 'Failed to load feed' }, { status: 500 })
  }
}
