import { NextRequest, NextResponse } from 'next/server'
import { deleteTodaysStories, saveStories } from '@/lib/supabase'
import { fetchAllFeeds } from '@/lib/rss'
import { summarizeAndTagStories } from '@/lib/gemini'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  // Verify the request comes from Vercel Cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await deleteTodaysStories()
    const raw = await fetchAllFeeds()
    const summarized = await summarizeAndTagStories(raw)
    await saveStories(summarized)

    console.log(`[Cron] Refreshed ${summarized.length} stories at ${new Date().toISOString()}`)
    return NextResponse.json({ ok: true, count: summarized.length })
  } catch (err) {
    console.error('[Cron] Failed:', err)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
