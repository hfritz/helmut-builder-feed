export interface Story {
  id: string
  title: string
  source: string
  url: string
  summary: string
  tags: string[]
  published_at: string | null
  fetched_at: string
  batch_date: string
}

export interface RawStory {
  title: string
  url: string
  source: string
  publishedAt: string | null
}

export interface StoryInsert {
  title: string
  source: string
  url: string
  summary: string
  tags: string[]
  published_at: string | null
  batch_date: string
}
