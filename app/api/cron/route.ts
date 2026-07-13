import { NextRequest, NextResponse } from 'next/server'
import { deleteWeeksStories, saveStories, saveWeeklySummary, getWeekStart, getRecentlyUsedUrls, DEDUP_WINDOW_DAYS } from '@/lib/supabase'
import { fetchAllFeeds } from '@/lib/rss'
import { summarizeAndTagStories, generateDigestIntro, generateLinkedInHashtags } from '@/lib/gemini'
import { getActiveSubscribers, recordFailedSends } from '@/lib/subscribers'
import { sendWeeklyDigest, sendFailureReport } from '@/lib/email'
import { postToLinkedIn } from '@/lib/linkedin'
import { citationsToPlainText } from '@/lib/citations'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const weekStart = getWeekStart()

  try {
    await deleteWeeksStories(weekStart)
    const raw = await fetchAllFeeds()
    const recentUrls = await getRecentlyUsedUrls(DEDUP_WINDOW_DAYS)
    const fresh = raw.filter((s) => !recentUrls.has(s.url))
    console.log(`[Cron] ${raw.length - fresh.length} article(s) already covered in the last ${DEDUP_WINDOW_DAYS} days, excluded`)
    const summarized = await summarizeAndTagStories(fresh)
    await saveStories(summarized)

    const summary = await generateDigestIntro(summarized)
    await saveWeeklySummary(weekStart, summary)

    console.log(`[Cron] Weekly refresh: ${summarized.length} stories for week of ${weekStart}`)

    const subscribers = await getActiveSubscribers()
    console.log(`[Cron] Active subscribers: ${subscribers.length}`)
    let failedCount = 0
    if (subscribers.length > 0) {
      const failed = await sendWeeklyDigest(summarized, summary, weekStart, subscribers)
      failedCount = failed.length
      console.log(`[Cron] Digest sent to ${subscribers.length - failed.length}/${subscribers.length} subscribers`)
      if (failed.length > 0) {
        await recordFailedSends(weekStart, failed)
        await sendFailureReport(weekStart, failed)
      }
    } else {
      console.log('[Cron] No active subscribers — skipping email send')
    }

    try {
      const hashtags = await generateLinkedInHashtags(summarized)
      await postToLinkedIn(citationsToPlainText(summary), hashtags)
      console.log('[Cron] LinkedIn post published')
    } catch (err) {
      console.error('[Cron] LinkedIn post failed:', err)
    }

    return NextResponse.json({ ok: true, count: summarized.length, week: weekStart, subscribers: subscribers.length, failed: failedCount })
  } catch (err) {
    console.error('[Cron] Failed:', err)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
