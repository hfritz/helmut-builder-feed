import { NextRequest, NextResponse } from 'next/server'
import { unsubscribeByToken } from '@/lib/subscribers'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return new NextResponse(page('Missing token', 'The unsubscribe link is invalid.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  const ok = await unsubscribeByToken(token)

  const html = ok
    ? page("You're unsubscribed", "You've been removed from Helmut's Builder Feed. No more emails will be sent to you.")
    : page('Already unsubscribed', "This email is already unsubscribed from Helmut's Builder Feed.")

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
}

function page(title: string, message: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://helmutfritz.fyi'
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${title} — Builder Feed</title>
</head>
<body style="background:#09090b;color:#e4e4e7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="text-align:center;max-width:400px;padding:40px 24px;">
    <p style="color:#6F00FF;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 16px;">Helmut's Builder Feed</p>
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 12px;">${title}</h1>
    <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin:0 0 28px;">${message}</p>
    <a href="${siteUrl}" style="color:#6F00FF;font-size:14px;font-weight:500;text-decoration:none;">← Back to the feed</a>
  </div>
</body>
</html>`
}
