import { NextRequest, NextResponse } from 'next/server'
import { saveStories, getWeekStart } from '@/lib/supabase'
import { generateHistoricalWeek } from '@/lib/gemini'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/**
 * GET /api/seed?secret=CRON_SECRET&weeks=4
 * Seeds the past N weeks of historical stories using Gemini's knowledge.
 * Run once to populate the archive.
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const weeksParam = req.nextUrl.searchParams.get('weeks')
  const weeks = Math.min(parseInt(weeksParam ?? '4', 10), 8)

  const thisWeekStart = getWeekStart()
  const results: { week: string; count: number }[] = []

  for (let i = 1; i <= weeks; i++) {
    const d = new Date(thisWeekStart)
    d.setDate(d.getDate() - i * 7)
    const weekStart = d.toISOString().split('T')[0]

    const stories = await generateHistoricalWeek(weekStart)
    if (stories.length > 0) {
      await saveStories(stories)
      results.push({ week: weekStart, count: stories.length })
    }
  }

  return NextResponse.json({ ok: true, seeded: results })
}
