import { NextRequest, NextResponse } from 'next/server'
import { getThisWeeksStories, saveWeeklySummary, getWeekStart } from '@/lib/supabase'
import { generateDigestIntro } from '@/lib/gemini'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const weekStart = getWeekStart()
  const stories = await getThisWeeksStories()

  if (stories.length === 0) {
    return NextResponse.json({ error: 'No stories found for current week' }, { status: 404 })
  }

  const summary = await generateDigestIntro(stories)
  await saveWeeklySummary(weekStart, summary)

  return NextResponse.json({ ok: true, week: weekStart, summary })
}
