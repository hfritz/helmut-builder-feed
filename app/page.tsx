import { getTodaysStories, saveStories } from '@/lib/supabase'
import { fetchAllFeeds } from '@/lib/rss'
import { summarizeAndTagStories } from '@/lib/gemini'
import { Header } from '@/app/components/Header'
import { Footer } from '@/app/components/Footer'
import { StoryCard } from '@/app/components/StoryCard'

export const dynamic = 'force-dynamic'

export default async function Home() {
  let stories = await getTodaysStories()

  if (stories.length === 0) {
    const raw = await fetchAllFeeds()
    const summarized = await summarizeAndTagStories(raw)
    await saveStories(summarized)
    stories = await getTodaysStories()
  }

  const lastUpdated = stories[0]?.fetched_at ?? null

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col">
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <Header lastUpdated={lastUpdated} storyCount={stories.length} />
        </div>


        {stories.length === 0 ? (
          <div className="text-center py-24 text-zinc-500">
            <p className="text-lg">No stories loaded yet.</p>
            <p className="text-sm mt-2">Click &ldquo;Refresh Feed&rdquo; to fetch today&apos;s stories.</p>
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
