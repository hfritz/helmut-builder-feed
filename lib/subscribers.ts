import { supabase } from './supabase'

export interface Subscriber {
  id: string
  email: string
  token: string
  subscribed_at: string
}

export async function addSubscriber(email: string): Promise<{ ok: boolean; alreadySubscribed?: boolean; token?: string }> {
  const { data: existing } = await supabase
    .from('subscribers')
    .select('id, token, unsubscribed_at')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    if (!existing.unsubscribed_at) return { ok: true, alreadySubscribed: true, token: existing.token }
    const { error } = await supabase
      .from('subscribers')
      .update({ unsubscribed_at: null })
      .eq('email', email)
    return { ok: !error, token: existing.token }
  }

  const { data, error } = await supabase
    .from('subscribers')
    .insert({ email })
    .select('token')
    .single()
  return { ok: !error, token: data?.token }
}

export async function getActiveSubscribers(): Promise<Subscriber[]> {
  const { data, error } = await supabase
    .from('subscribers')
    .select('id, email, token, subscribed_at')
    .is('unsubscribed_at', null)

  if (error) {
    console.error('Get subscribers error:', error.message)
    return []
  }
  return (data as Subscriber[]) ?? []
}

export async function recordFailedSends(weekStart: string, failed: Array<{ email: string; error: string }>): Promise<void> {
  if (failed.length === 0) return
  const { error } = await supabase
    .from('failed_sends')
    .insert(failed.map((f) => ({ week_start: weekStart, email: f.email, error: f.error })))

  if (error) console.error('Record failed sends error:', error.message)
}

export interface PendingFailedSend {
  id: string
  email: string
  token: string
}

/** Pending failures for a week, joined with the subscriber's current token (subscriber may have unsubscribed since). */
export async function getPendingFailedSends(weekStart: string): Promise<PendingFailedSend[]> {
  const { data, error } = await supabase
    .from('failed_sends')
    .select('id, email')
    .eq('week_start', weekStart)
    .is('resolved_at', null)

  if (error) {
    console.error('Get pending failed sends error:', error.message)
    return []
  }
  if (!data || data.length === 0) return []

  const emails = data.map((d) => d.email)
  const { data: subs, error: subsError } = await supabase
    .from('subscribers')
    .select('email, token')
    .in('email', emails)
    .is('unsubscribed_at', null)

  if (subsError) {
    console.error('Get subscribers for retry error:', subsError.message)
    return []
  }

  const tokenByEmail = new Map((subs ?? []).map((s) => [s.email, s.token]))
  return data
    .filter((d) => tokenByEmail.has(d.email))
    .map((d) => ({ id: d.id, email: d.email, token: tokenByEmail.get(d.email)! }))
}

export async function resolveFailedSends(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const { error } = await supabase
    .from('failed_sends')
    .update({ resolved_at: new Date().toISOString() })
    .in('id', ids)

  if (error) console.error('Resolve failed sends error:', error.message)
}

export async function unsubscribeByToken(token: string): Promise<boolean> {
  const { error } = await supabase
    .from('subscribers')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('token', token)
    .is('unsubscribed_at', null)

  if (error) {
    console.error('Unsubscribe error:', error.message)
    return false
  }
  return true
}
