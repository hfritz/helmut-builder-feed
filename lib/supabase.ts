import { createClient } from '@supabase/supabase-js'
import type { Story, StoryInsert } from './types'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function getTodaysStories(): Promise<Story[]> {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('batch_date', today)
    .order('published_at', { ascending: false, nullsFirst: false })

  if (error) {
    console.error('Supabase read error:', error.message)
    return []
  }
  return (data as Story[]) ?? []
}

export async function saveStories(stories: StoryInsert[]): Promise<void> {
  const { error } = await supabase
    .from('stories')
    .upsert(stories, { onConflict: 'url,batch_date' })

  if (error) {
    console.error('Supabase write error:', error.message)
  }
}

export async function deleteTodaysStories(): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('batch_date', today)

  if (error) {
    console.error('Supabase delete error:', error.message)
  }
}
