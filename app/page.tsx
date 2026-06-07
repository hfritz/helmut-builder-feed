import { getThisWeeksStories, saveStories } from '@/lib/supabase'
import { fetchAllFeeds } from '@/lib/rss'
import { summarizeAndTagStories } from '@/lib/gemini'
import { Header } from '@/app/components/Header'
import { Footer } from '@/app/components/Footer'
import { StoryCard } from '@/app/components/StoryCard'

export const dynamic = 'force-dynamic'

export default async function Home() {
  let stories = await getThisWeeksStories()

  if (stories.length === 0) {
    const raw = await fetchAllFeeds()
    const summarized = await summarizeAndTagStories(raw)
    await saveStories(summarized)
    stories = await getThisWeeksStories()
  }

  const lastUpdated = stories[0]?.fetched_at ?? null

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <Header lastUpdated={lastUpdated} storyCount={stories.length} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 pb-12">
        {stories.length === 0 ? (
          <div className="text-center py-24 text-zinc-500">
            <p className="text-lg">No stories this week yet.</p>
            <p className="text-sm mt-2">Check back Monday — the digest refreshes weekly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
