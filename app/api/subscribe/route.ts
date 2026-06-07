import { NextRequest, NextResponse } from 'next/server'
import { addSubscriber } from '@/lib/subscribers'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}))

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const result = await addSubscriber(email.toLowerCase().trim())
  if (!result.ok) {
    return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 })
  }

  if (!result.alreadySubscribed && result.token) {
    await sendWelcomeEmail(email, result.token)
  }

  return NextResponse.json({ ok: true, alreadySubscribed: result.alreadySubscribed ?? false })
}
