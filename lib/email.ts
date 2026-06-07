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

// Pre-computed star field as inline SVG data URI — safe across all email clients
const STARS_BG = `url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27600%27 height=%27200%27%3E%3Ccircle cx=%2742%27 cy=%2718%27 r=%271.1%27 fill=%27white%27 opacity=%270.5%27/%3E%3Ccircle cx=%27118%27 cy=%2744%27 r=%270.8%27 fill=%27%238b5cf6%27 opacity=%270.6%27/%3E%3Ccircle cx=%27203%27 cy=%2712%27 r=%271.3%27 fill=%27white%27 opacity=%270.4%27/%3E%3Ccircle cx=%27267%27 cy=%2755%27 r=%270.7%27 fill=%27%236F00FF%27 opacity=%270.7%27/%3E%3Ccircle cx=%27334%27 cy=%2728%27 r=%271.0%27 fill=%27white%27 opacity=%270.5%27/%3E%3Ccircle cx=%27389%27 cy=%278%27 r=%270.9%27 fill=%27%23a78bfa%27 opacity=%270.6%27/%3E%3Ccircle cx=%27445%27 cy=%2747%27 r=%271.2%27 fill=%27white%27 opacity=%270.4%27/%3E%3Ccircle cx=%27512%27 cy=%2722%27 r=%270.8%27 fill=%27%236F00FF%27 opacity=%270.5%27/%3E%3Ccircle cx=%27567%27 cy=%2738%27 r=%271.1%27 fill=%27white%27 opacity=%270.45%27/%3E%3Ccircle cx=%2778%27 cy=%2772%27 r=%270.7%27 fill=%27white%27 opacity=%270.35%27/%3E%3Ccircle cx=%27156%27 cy=%2788%27 r=%271.0%27 fill=%27%238b5cf6%27 opacity=%270.5%27/%3E%3Ccircle cx=%27289%27 cy=%2795%27 r=%270.8%27 fill=%27white%27 opacity=%270.4%27/%3E%3Ccircle cx=%27423%27 cy=%2781%27 r=%271.2%27 fill=%27%236F00FF%27 opacity=%270.4%27/%3E%3Ccircle cx=%27534%27 cy=%2776%27 r=%270.9%27 fill=%27white%27 opacity=%270.5%27/%3E%3Ccircle cx=%2719%27 cy=%27110%27 r=%271.0%27 fill=%27%23a78bfa%27 opacity=%270.45%27/%3E%3Ccircle cx=%27167%27 cy=%27138%27 r=%270.7%27 fill=%27white%27 opacity=%270.35%27/%3E%3Ccircle cx=%27312%27 cy=%27122%27 r=%271.3%27 fill=%27white%27 opacity=%270.5%27/%3E%3Ccircle cx=%27478%27 cy=%27145%27 r=%270.8%27 fill=%27%236F00FF%27 opacity=%270.55%27/%3E%3Ccircle cx=%27589%27 cy=%27118%27 r=%271.1%27 fill=%27white%27 opacity=%270.4%27/%3E%3Ccircle cx=%2789%27 cy=%27165%27 r=%270.9%27 fill=%27%238b5cf6%27 opacity=%270.5%27/%3E%3Ccircle cx=%27234%27 cy=%27178%27 r=%271.0%27 fill=%27white%27 opacity=%270.35%27/%3E%3Ccircle cx=%27356%27 cy=%27188%27 r=%270.7%27 fill=%27%236F00FF%27 opacity=%270.45%27/%3E%3Ccircle cx=%27501%27 cy=%27172%27 r=%271.2%27 fill=%27white%27 opacity=%270.4%27/%3E%3C/svg%3E')`

function heroSection(headline: string, sub: string): string {
  return `
  <table width="600" border="0" cellpadding="0" cellspacing="0" style="width:100%;">
    <tr>
      <td height="220" valign="bottom"
          background="${SITE_URL}/hero.jpg"
          bgcolor="#09090b"
          style="background-size:cover;background-position:center;background-repeat:no-repeat;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:20px 32px 26px;
              background:linear-gradient(to bottom, transparent 0%, rgba(5,5,6,0.85) 40%, #09090b 75%);">
              <p style="color:#6F00FF;font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;margin:0 0 6px;padding:0;">
                Helmut's Builder Feed
              </p>
              <h1 style="color:#ffffff;font-size:26px;font-weight:700;margin:0 0 4px;padding:0;line-height:1.2;
                text-shadow:0 1px 6px rgba(0,0,0,1);">${headline}</h1>
              <p style="color:#d4d4d8;font-size:13px;margin:0;padding:0;">${sub}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`
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

function footer(unsubscribeUrl: string): string {
  return `
  <div style="margin-top:40px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08);">
    <p style="color:#52525b;font-size:12px;margin:0 0 4px;">
      You're receiving this because you subscribed to Helmut's Builder Feed.
    </p>
    <p style="color:#52525b;font-size:12px;margin:0;">
      <a href="${SITE_URL}" style="color:#6F00FF;text-decoration:none;">Visit the feed</a>
      &nbsp;·&nbsp;
      <a href="${unsubscribeUrl}" style="color:#52525b;text-decoration:none;">Unsubscribe</a>
    </p>
  </div>`
}

function shell(title: string, heroHtml: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="background:#09090b;color:#e4e4e7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:24px 0;">
  <div style="max-width:600px;margin:0 auto;border-radius:14px;overflow:hidden;border:1px solid rgba(111,0,255,0.2);box-shadow:0 0 40px rgba(111,0,255,0.08);">

    ${heroHtml}

    <div style="padding:28px 32px 32px;background:#09090b;
      background-image:${STARS_BG};background-repeat:no-repeat;background-position:right top;background-size:600px 200px;">
      ${bodyHtml}
    </div>

  </div>
</body>
</html>`
}

function buildEmail(stories: StoryInsert[], intro: string, weekStart: string, unsubscribeUrl: string): string {
  const weekLabel = formatWeekLabel(weekStart)
  const hero = heroSection('Weekly Digest', `Week of ${weekLabel}`)
  const body = `
    <p style="color:#a1a1aa;font-size:15px;line-height:1.7;margin:0 0 28px;">${intro}</p>
    ${stories.map(renderStory).join('')}
    ${footer(unsubscribeUrl)}`
  return shell(`Helmut's Builder Feed — Week of ${weekLabel}`, hero, body)
}

export async function sendWelcomeEmail(email: string, token: string): Promise<void> {
  const unsubscribeUrl = `${SITE_URL}/api/unsubscribe?token=${token}`
  const hero = heroSection("You're in.", 'Your weekly AI × PM digest starts Monday.')
  const body = `
    <p style="color:#a1a1aa;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Welcome to the Builder Feed — a weekly digest cutting through the noise in AI and product management.
    </p>
    <p style="color:#a1a1aa;font-size:15px;line-height:1.7;margin:0 0 28px;">
      Every Monday you'll get a focused set of curated stories that actually matter for product builders — no filler, no fluff.
    </p>
    <a href="${SITE_URL}" style="display:inline-block;background:#6F00FF;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:11px 22px;border-radius:8px;">
      Browse this week's feed →
    </a>
    ${footer(unsubscribeUrl)}`

  const html = shell("Welcome to Helmut's Builder Feed", hero, body)

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
