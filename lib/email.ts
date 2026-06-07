import { Resend } from 'resend'
import type { StoryInsert } from './types'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = "Helmut's Builder Feed <builders-feed@helmutfritz.fyi>"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://helmutfritz.fyi'

const TAG_COLORS: Record<string, string> = {
  'AI Tools': '#7c3aed',
  'LLMs': '#2563eb',
  'Product Management': '#0891b2',
  'Strategy': '#0d9488',
  'Launch': '#d97706',
  'Research': '#6d28d9',
  'Funding': '#b45309',
  'Workflows': '#059669',
  'Agents': '#dc2626',
  'AI Design': '#db2777',
  'Vibe Coding': '#7c3aed',
  'Dev Tools': '#4f46e5',
  'Skills & Learning': '#0284c7',
}

function formatWeekLabel(weekStart: string): string {
  try {
    const date = new Date(weekStart + 'T12:00:00Z')
    const end = new Date(date)
    end.setDate(end.getDate() + 6)
    const fmt = (d: Date) =>
      new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d)
    return `${fmt(date)} – ${fmt(end)}, ${end.getFullYear()}`
  } catch {
    return weekStart
  }
}

function renderStory(story: StoryInsert): string {
  const tags = story.tags
    .map((tag) => {
      const color = TAG_COLORS[tag] ?? '#6F00FF'
      return `<span style="display:inline-block;background:${color}22;color:${color};border:1px solid ${color}44;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:600;margin-right:4px;margin-bottom:4px;letter-spacing:0.05em;">${tag}</span>`
    })
    .join('')

  return `
    <div style="border-bottom:1px solid rgba(255,255,255,0.06);padding:20px 0;">
      <div style="margin-bottom:10px;">${tags}</div>
      <h2 style="color:#ffffff;font-size:16px;font-weight:600;margin:0 0 4px;line-height:1.4;">
        <a href="${story.url}" style="color:#ffffff;text-decoration:none;">${story.title}</a>
      </h2>
      <p style="color:#71717a;font-size:12px;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.05em;">${story.source}</p>
      <p style="color:#a1a1aa;font-size:14px;line-height:1.65;margin:0 0 12px;">${story.summary}</p>
      <a href="${story.url}" style="color:#6F00FF;font-size:13px;font-weight:500;text-decoration:none;">Read more →</a>
    </div>`
}

function buildEmail(stories: StoryInsert[], intro: string, weekStart: string, unsubscribeUrl: string): string {
  const weekLabel = formatWeekLabel(weekStart)
  const storiesHtml = stories.map(renderStory).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Helmut's Builder Feed — Week of ${weekLabel}</title>
</head>
<body style="background:#09090b;color:#e4e4e7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">

    <div style="border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:24px;margin-bottom:28px;">
      <p style="color:#6F00FF;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 8px;">Helmut's Builder Feed</p>
      <h1 style="color:#ffffff;font-size:26px;font-weight:700;margin:0 0 4px;">Weekly Digest</h1>
      <p style="color:#71717a;font-size:13px;margin:0;">Week of ${weekLabel}</p>
    </div>

    <p style="color:#a1a1aa;font-size:15px;line-height:1.7;margin:0 0 32px;">${intro}</p>

    ${storiesHtml}

    <div style="margin-top:40px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08);">
      <p style="color:#52525b;font-size:12px;margin:0 0 4px;">
        You're receiving this because you subscribed to Helmut's Builder Feed.
      </p>
      <p style="color:#52525b;font-size:12px;margin:0;">
        <a href="${SITE_URL}" style="color:#6F00FF;text-decoration:none;">Visit the feed</a>
        &nbsp;·&nbsp;
        <a href="${unsubscribeUrl}" style="color:#52525b;text-decoration:none;">Unsubscribe</a>
      </p>
    </div>

  </div>
</body>
</html>`
}

export async function sendWelcomeEmail(email: string, token: string): Promise<void> {
  const unsubscribeUrl = `${SITE_URL}/api/unsubscribe?token=${token}`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Welcome to Helmut's Builder Feed</title>
</head>
<body style="background:#09090b;color:#e4e4e7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">

    <div style="border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:24px;margin-bottom:28px;">
      <p style="color:#6F00FF;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 8px;">Helmut's Builder Feed</p>
      <h1 style="color:#ffffff;font-size:26px;font-weight:700;margin:0;">You're in.</h1>
    </div>

    <p style="color:#a1a1aa;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Welcome to the Builder Feed — a weekly digest cutting through the noise in AI and product management.
    </p>
    <p style="color:#a1a1aa;font-size:15px;line-height:1.7;margin:0 0 28px;">
      Every Monday you'll get a focused set of curated stories that actually matter for product builders — no filler, no fluff.
    </p>

    <a href="${SITE_URL}" style="display:inline-block;background:#6F00FF;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:10px 20px;border-radius:8px;">
      Browse this week's feed →
    </a>

    <div style="margin-top:40px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08);">
      <p style="color:#52525b;font-size:12px;margin:0 0 4px;">You're receiving this because you just subscribed to Helmut's Builder Feed.</p>
      <p style="color:#52525b;font-size:12px;margin:0;">
        <a href="${unsubscribeUrl}" style="color:#52525b;text-decoration:none;">Unsubscribe</a>
      </p>
    </div>

  </div>
</body>
</html>`

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: "You're subscribed to Helmut's Builder Feed",
    html,
  })

  if (error) console.error('[Email] Welcome email failed:', error)
}

export async function sendWeeklyDigest(
  stories: StoryInsert[],
  intro: string,
  weekStart: string,
  subscribers: Array<{ email: string; token: string }>
): Promise<void> {
  if (subscribers.length === 0) return

  const results = await Promise.allSettled(
    subscribers.map(({ email, token }) => {
      const unsubscribeUrl = `${SITE_URL}/api/unsubscribe?token=${token}`
      const html = buildEmail(stories, intro, weekStart, unsubscribeUrl)
      const weekLabel = formatWeekLabel(weekStart)
      return resend.emails.send({
        from: FROM,
        to: email,
        subject: `Builder Feed — Week of ${weekLabel}`,
        html,
      })
    })
  )

  const failed = results.filter((r) => r.status === 'rejected').length
  console.log(`[Email] Sent to ${subscribers.length - failed}/${subscribers.length} subscribers`)
  if (failed > 0) {
    results.forEach((r, i) => {
      if (r.status === 'rejected') console.error(`[Email] Failed for subscriber ${i}:`, r.reason)
    })
  }
}
