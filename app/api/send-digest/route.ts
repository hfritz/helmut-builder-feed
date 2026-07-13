import { NextRequest, NextResponse } from 'next/server'
import { getThisWeeksStories, getWeeklySummary, getWeeklySummaryTeaser, getWeekStart } from '@/lib/supabase'
import { getActiveSubscribers, recordFailedSends } from '@/lib/subscribers'
import { sendWeeklyDigest, sendFailureReport } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const weekStart = getWeekStart()
  const [stories, summary, teaser, subscribers] = await Promise.all([
    getThisWeeksStories(),
    getWeeklySummary(weekStart),
    getWeeklySummaryTeaser(weekStart),
    getActiveSubscribers(),
  ])

  if (stories.length === 0) {
    return NextResponse.json({ error: 'No stories found for this week' }, { status: 404 })
  }
  if (!summary) {
    return NextResponse.json({ error: 'No weekly summary found' }, { status: 404 })
  }
  if (subscribers.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: 'No active subscribers' })
  }

  const failed = await sendWeeklyDigest(stories, summary, weekStart, subscribers, teaser)
  if (failed.length > 0) {
    await recordFailedSends(weekStart, failed)
    await sendFailureReport(weekStart, failed)
  }
  return NextResponse.json({ ok: true, sent: subscribers.length - failed.length, failed: failed.length, week: weekStart })
}
