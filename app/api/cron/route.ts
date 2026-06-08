import { NextRequest, NextResponse } from 'next/server'
import { deleteWeeksStories, saveStories, saveWeeklySummary, getWeekStart } from '@/lib/supabase'
import { fetchAllFeeds } from '@/lib/rss'
import { summarizeAndTagStories, generateDigestIntro, generateLinkedInHashtags } from '@/lib/gemini'
import { getActiveSubscribers } from '@/lib/subscribers'
import { sendWeeklyDigest } from '@/lib/email'
import { postToLinkedIn } from '@/lib/linkedin'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const weekStart = getWeekStart()

  try {
    await deleteWeeksStories(weekStart)
    const raw = await fetchAllFeeds()
    const summarized = await summarizeAndTagStories(raw)
    await saveStories(summarized)

    const summary = await generateDigestIntro(summarized)
    await saveWeeklySummary(weekStart, summary)

    console.log(`[Cron] Weekly refresh: ${summarized.length} stories for week of ${weekStart}`)

    const subscribers = await getActiveSubscribers()
    if (subscribers.length > 0) {
      await sendWeeklyDigest(summarized, summary, weekStart, subscribers)
      console.log(`[Cron] Digest sent to ${subscribers.length} subscribers`)
    }

    try {
      const hashtags = await generateLinkedInHashtags(summarized)
      await postToLinkedIn(summary, hashtags)
      console.log('[Cron] LinkedIn post published')
    } catch (err) {
      console.error('[Cron] LinkedIn post failed:', err)
    }

    return NextResponse.json({ ok: true, count: summarized.length, week: weekStart, subscribers: subscribers.length })
  } catch (err) {
    console.error('[Cron] Failed:', err)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
