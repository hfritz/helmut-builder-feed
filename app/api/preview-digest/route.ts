import { NextResponse } from 'next/server'
import { getThisWeeksStories, getWeeklySummary, getWeekStart } from '@/lib/supabase'
import { buildEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

/** Dev-only: renders the weekly digest HTML in the browser so it can be checked against the live site design. */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  const weekStart = getWeekStart()
  const [stories, summary] = await Promise.all([getThisWeeksStories(), getWeeklySummary(weekStart)])

  if (stories.length === 0 || !summary) {
    return NextResponse.json({ error: 'No stories or summary found for this week' }, { status: 404 })
  }

  const html = buildEmail(stories, summary, weekStart, '#preview-unsubscribe')
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
}
