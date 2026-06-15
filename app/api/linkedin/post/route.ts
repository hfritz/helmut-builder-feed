import { NextRequest, NextResponse } from 'next/server'
import { getThisWeeksStories, getWeeklySummary, getWeekStart } from '@/lib/supabase'
import { generateLinkedInHashtags } from '@/lib/gemini'
import { postToLinkedIn } from '@/lib/linkedin'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const weekStart = getWeekStart()
  const [stories, summary] = await Promise.all([
    getThisWeeksStories(),
    getWeeklySummary(weekStart),
  ])

  if (stories.length === 0) {
    return NextResponse.json({ error: 'No stories found for this week' }, { status: 404 })
  }
  if (!summary) {
    return NextResponse.json({ error: 'No weekly summary found' }, { status: 404 })
  }

  const hashtags = await generateLinkedInHashtags(stories)
  await postToLinkedIn(summary, hashtags)

  return NextResponse.json({ ok: true, week: weekStart })
}
