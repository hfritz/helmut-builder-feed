import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (state !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!code) {
    return NextResponse.json({ error: 'No code returned from LinkedIn' }, { status: 400 })
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${req.nextUrl.origin}/api/linkedin/callback`,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  })

  if (!tokenRes.ok) {
    const err = await tokenRes.text()
    return NextResponse.json({ error: 'Token exchange failed', detail: err }, { status: 500 })
  }

  const tokens = await tokenRes.json()

  // Get person URN
  const userinfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const userinfo = await userinfoRes.json()
  const personUrn = `urn:li:person:${userinfo.sub}`

  return NextResponse.json({
    message: 'Copy these into your Vercel environment variables, then delete these routes.',
    LINKEDIN_ACCESS_TOKEN: tokens.access_token,
    LINKEDIN_REFRESH_TOKEN: tokens.refresh_token ?? '(not issued — token will expire in 60 days)',
    LINKEDIN_PERSON_URN: personUrn,
    expires_in_days: Math.round(tokens.expires_in / 86400),
  })
}
