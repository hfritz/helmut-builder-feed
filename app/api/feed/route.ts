import { NextResponse } from 'next/server'
import { getTodaysStories, saveStories, deleteTodaysStories } from '@/lib/supabase'
import { fetchAllFeeds } from '@/lib/rss'
import { summarizeAndTagStories } from '@/lib/gemini'

export const dynamic = 'force-dynamic'

// GET: Serve today's stories (or fetch fresh if cache is empty)
export async function GET() {
  try {
    let stories = await getTodaysStories()

    if (stories.length === 0) {
      const raw = await fetchAllFeeds()
      const summarized = await summarizeAndTagStories(raw)
      await saveStories(summarized)
      stories = await getTodaysStories()
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

// POST: Force a fresh fetch (manual refresh)
export async function POST() {
  try {
    await deleteTodaysStories()
    const raw = await fetchAllFeeds()
    const summarized = await summarizeAndTagStories(raw)
    await saveStories(summarized)
    const stories = await getTodaysStories()

    return NextResponse.json({
      stories,
      lastUpdated: stories[0]?.fetched_at ?? null,
      fromCache: false,
    })
  } catch (err) {
    console.error('Feed POST error:', err)
    return NextResponse.json({ error: 'Failed to refresh feed' }, { status: 500 })
  }
}
