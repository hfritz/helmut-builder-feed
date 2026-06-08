const TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken'
const POSTS_URL = 'https://api.linkedin.com/v2/ugcPosts'

async function getAccessToken(): Promise<string> {
  // Use refresh token if available, otherwise fall back to stored access token
  if (process.env.LINKEDIN_REFRESH_TOKEN) {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: process.env.LINKEDIN_REFRESH_TOKEN,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`LinkedIn token refresh failed: ${res.status} — ${err}`)
    }
    const data = await res.json()
    return data.access_token as string
  }

  if (!process.env.LINKEDIN_ACCESS_TOKEN) {
    throw new Error('No LinkedIn credentials configured (LINKEDIN_ACCESS_TOKEN or LINKEDIN_REFRESH_TOKEN required)')
  }

  return process.env.LINKEDIN_ACCESS_TOKEN
}

export async function postToLinkedIn(summary: string): Promise<void> {
  const accessToken = await getAccessToken()
  const personUrn = process.env.LINKEDIN_PERSON_URN!
  const siteUrl = 'https://builder-feed.helmutfritz.fyi'

  const body = {
    author: personUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: `${summary}\n\nThis Monday's full curated feed → ${siteUrl}`,
        },
        shareMediaCategory: 'ARTICLE',
        media: [{ status: 'READY', originalUrl: siteUrl }],
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  }

  const res = await fetch(POSTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`LinkedIn post failed: ${res.status} — ${err}`)
  }
}
