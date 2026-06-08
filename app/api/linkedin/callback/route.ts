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
    message: 'Copy LINKEDIN_ACCESS_TOKEN and LINKEDIN_PERSON_URN into Vercel env vars. Token expires in ~60 days — re-run this flow when it does.',
    LINKEDIN_ACCESS_TOKEN: tokens.access_token,
    LINKEDIN_PERSON_URN: personUrn,
    expires_in_days: Math.round(tokens.expires_in / 86400),
    refresh_token: tokens.refresh_token ?? null,
  })
}
