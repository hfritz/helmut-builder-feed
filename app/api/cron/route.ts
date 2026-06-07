import { NextRequest, NextResponse } from 'next/server'
import { deleteWeeksStories, saveStories, getWeekStart } from '@/lib/supabase'
import { fetchAllFeeds } from '@/lib/rss'
import { summarizeAndTagStories, generateDigestIntro } from '@/lib/gemini'
import { getActiveSubscribers } from '@/lib/subscribers'
import { sendWeeklyDigest } from '@/lib/email'

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

    console.log(`[Cron] Weekly refresh: ${summarized.length} stories for week of ${weekStart}`)

    const subscribers = await getActiveSubscribers()
    if (subscribers.length > 0) {
      const intro = await generateDigestIntro(summarized)
      await sendWeeklyDigest(summarized, intro, weekStart, subscribers)
      console.log(`[Cron] Digest sent to ${subscribers.length} subscribers`)
    }

    return NextResponse.json({ ok: true, count: summarized.length, week: weekStart, subscribers: subscribers.length })
  } catch (err) {
    console.error('[Cron] Failed:', err)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
