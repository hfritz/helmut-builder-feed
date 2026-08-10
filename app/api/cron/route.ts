import { NextRequest, NextResponse } from 'next/server'
import { deleteWeeksStories, saveStories, saveWeeklySummary, getWeekStart, getRecentlyUsedUrls, DEDUP_WINDOW_DAYS, getLinkedInTokenIssuedAt } from '@/lib/supabase'
import { fetchAllFeeds } from '@/lib/rss'
import { summarizeAndTagStories, generateDigestIntro, generateSubjectTeaser, generateLinkedInHashtags } from '@/lib/gemini'
import { getActiveSubscribers, recordFailedSends } from '@/lib/subscribers'
import { sendWeeklyDigest, sendFailureReport, sendLinkedInFailureReport, sendLinkedInExpiryWarning } from '@/lib/email'
import { postToLinkedIn } from '@/lib/linkedin'
import { citationsToPlainText } from '@/lib/citations'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

// LinkedIn access tokens last ~60 days and this app isn't issued a refresh token —
// warn once we're within this many days of that cliff so re-auth happens before a post is missed.
const LINKEDIN_TOKEN_LIFETIME_DAYS = 60
const LINKEDIN_TOKEN_WARNING_BUFFER_DAYS = 10

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
    const teaser = await generateSubjectTeaser(summarized, summary)
    await saveWeeklySummary(weekStart, summary, teaser)

    console.log(`[Cron] Weekly refresh: ${summarized.length} stories for week of ${weekStart}`)

    const subscribers = await getActiveSubscribers()
    console.log(`[Cron] Active subscribers: ${subscribers.length}`)
    let failedCount = 0
    if (subscribers.length > 0) {
      const failed = await sendWeeklyDigest(summarized, summary, weekStart, subscribers, teaser)
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
      const message = err instanceof Error ? err.message : String(err)
      console.error('[Cron] LinkedIn post failed:', err)
      await sendLinkedInFailureReport(weekStart, message)
    }

    const issuedAt = await getLinkedInTokenIssuedAt()
    if (issuedAt) {
      const daysSinceIssued = (Date.now() - issuedAt.getTime()) / (1000 * 60 * 60 * 24)
      const daysRemaining = Math.round(LINKEDIN_TOKEN_LIFETIME_DAYS - daysSinceIssued)
      if (daysRemaining <= LINKEDIN_TOKEN_WARNING_BUFFER_DAYS) {
        console.log(`[Cron] LinkedIn token expires in ~${daysRemaining} days — sending warning`)
        await sendLinkedInExpiryWarning(daysRemaining)
      }
    }

    return NextResponse.json({ ok: true, count: summarized.length, week: weekStart, subscribers: subscribers.length, failed: failedCount })
  } catch (err) {
    console.error('[Cron] Failed:', err)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
