import { getThisWeeksStories, saveStories, getWeeklySummary, getWeekStart } from '@/lib/supabase'
import { fetchAllFeeds } from '@/lib/rss'
import { summarizeAndTagStories } from '@/lib/gemini'
import { Header } from '@/app/components/Header'
import { Footer } from '@/app/components/Footer'
import { StoryCard } from '@/app/components/StoryCard'
import { SubscribeForm } from '@/app/components/SubscribeForm'
import { Story } from '@/lib/types'

export const dynamic = 'force-dynamic'

const SECTION_MAP: Array<{ label: string; tags: string[] }> = [
  { label: 'Build with this', tags: ['AI Tools', 'Agents', 'Dev Tools', 'Vibe Coding', 'Launch'] },
  { label: 'Think with this', tags: ['Strategy', 'Product Management', 'Research', 'Workflows'] },
  { label: 'Understand this', tags: ['LLMs', 'AI Design'] },
  { label: 'Watch this', tags: ['Funding'] },
]

function groupIntoSections(stories: Story[]) {
  const usedIds = new Set<string>()
  const sections: Array<{ label: string; stories: Story[] }> = []

  for (const section of SECTION_MAP) {
    const matching = stories.filter(
      (s) => !usedIds.has(s.id) && s.tags.some((t) => section.tags.includes(t))
    )
    matching.forEach((s) => usedIds.add(s.id))
    if (matching.length > 0) {
      sections.push({ label: section.label, stories: matching })
    }
  }

  const remaining = stories.filter((s) => !usedIds.has(s.id))
  if (remaining.length > 0) {
    sections.push({ label: 'More This Week', stories: remaining })
  }

  return sections
}

export default async function Home() {
  let stories = await getThisWeeksStories()

  if (stories.length === 0) {
    const raw = await fetchAllFeeds()
    const summarized = await summarizeAndTagStories(raw)
    await saveStories(summarized)
    stories = await getThisWeeksStories()
  }

  const lastUpdated = stories[0]?.fetched_at ?? null
  const weekSummary = await getWeeklySummary(getWeekStart())
  const sections = groupIntoSections(stories)

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <Header lastUpdated={lastUpdated} storyCount={stories.length} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 pb-12">
        {weekSummary && (
          <section className="border border-white/8 rounded-2xl bg-white/[0.02] px-6 py-5 mb-6">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#6F00FF] mb-2">
              This Week in AI × PM
            </p>
            <p className="text-zinc-300 text-base leading-relaxed">
              {weekSummary}
            </p>
          </section>
        )}

        <SubscribeForm variant="compact" />

        {stories.length === 0 ? (
          <div className="text-center py-24 text-zinc-500">
            <p className="text-lg">No stories yet.</p>
            <p className="text-sm mt-2">Check back Monday — a fresh snapshot drops every week.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.label}>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#6F00FF]">
                    {section.label}
                  </h2>
                  <div className="flex-1 h-px bg-white/8" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.stories.map((story) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <div className="max-w-5xl w-full mx-auto px-6 pb-10">
        <a
          href="/archive"
          className="group flex items-center justify-between gap-6 rounded-2xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#6F00FF]/30 px-6 py-5 transition-all"
        >
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#6F00FF] mb-1">
              Archive
            </p>
            <p className="text-white font-semibold text-base mb-0.5">
              This isn&apos;t where it starts.
            </p>
            <p className="text-zinc-500 text-sm">
              Every past digest is saved, tagged, and fully searchable — a growing library of AI × PM, week by week.
            </p>
          </div>
          <span className="text-[#6F00FF] text-xl shrink-0 group-hover:translate-x-1 transition-transform">
            →
          </span>
        </a>
      </div>

      <div className="max-w-5xl w-full mx-auto px-6 pb-16">
        <SubscribeForm />
      </div>

      <Footer />
    </div>
  )
}
