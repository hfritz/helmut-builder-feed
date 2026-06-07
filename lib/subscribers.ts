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
