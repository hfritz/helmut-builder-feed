import { NextRequest, NextResponse } from 'next/server'
import { getThisWeeksStories, getWeeklySummary, getWeekStart } from '@/lib/supabase'
import { getPendingFailedSends, recordFailedSends, resolveFailedSends } from '@/lib/subscribers'
import { sendWeeklyDigest, sendFailureReport } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const weekStart = req.nextUrl.searchParams.get('week') ?? getWeekStart()

  const pending = await getPendingFailedSends(weekStart)
  if (pending.length === 0) {
    return NextResponse.json({ ok: true, retried: 0, message: 'No pending failed sends for this week' })
  }

  const [stories, summary] = await Promise.all([getThisWeeksStories(), getWeeklySummary(weekStart)])
  if (stories.length === 0 || !summary) {
    return NextResponse.json({ error: 'No stories or summary found for this week' }, { status: 404 })
  }

  const failed = await sendWeeklyDigest(stories, summary, weekStart, pending)
  const failedEmails = new Set(failed.map((f) => f.email))
  const succeededIds = pending.filter((p) => !failedEmails.has(p.email)).map((p) => p.id)

  await resolveFailedSends(succeededIds)
  if (failed.length > 0) {
    await recordFailedSends(weekStart, failed)
    await sendFailureReport(weekStart, failed)
  }

  return NextResponse.json({
    ok: true,
    retried: pending.length,
    succeeded: succeededIds.length,
    failed: failed.length,
    week: weekStart,
  })
}
