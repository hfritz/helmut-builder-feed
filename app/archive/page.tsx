import { Suspense } from 'react'
import Link from 'next/link'
import { searchArchive } from '@/lib/supabase'
import { WeekSection } from '@/app/components/WeekSection'
import { SearchBar } from '@/app/components/SearchBar'
import { QuickSearch } from '@/app/components/QuickSearch'
import { ArchiveStickyHeader } from '@/app/components/ArchiveStickyHeader'
import { Footer } from '@/app/components/Footer'
import type { Story } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface ArchivePageProps {
  searchParams: Promise<{ q?: string }>
}

function groupByWeek(stories: Story[]): Map<string, Story[]> {
  const map = new Map<string, Story[]>()
  for (const story of stories) {
    const key = story.batch_date
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(story)
  }
  return map
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const { q } = await searchParams
  const query = q ?? ''
  const stories = await searchArchive(query)
  const grouped = groupByWeek(stories)
  const weeks = [...grouped.keys()].sort((a, b) => b.localeCompare(a))

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <Suspense>
        <ArchiveStickyHeader />
      </Suspense>
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-[#6F00FF] transition-colors mb-10"
        >
          ← This Week&apos;s Feed
        </Link>

        <div className="mb-8">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#6F00FF] block mb-2">
            Archive
          </span>
          <h1 className="text-4xl font-bold text-white mb-2">Past Weeks</h1>
          <p className="text-zinc-400">
            Search through all previously curated AI × Product Management stories.
          </p>
        </div>

        <div className="mb-10 space-y-3">
          <Suspense>
            <SearchBar />
          </Suspense>
          <Suspense>
            <QuickSearch />
          </Suspense>
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-24 text-zinc-500">
            {query ? (
              <>
                <p className="text-lg">No stories found for &ldquo;{query}&rdquo;</p>
                <p className="text-sm mt-2">Try a different search term.</p>
              </>
            ) : (
              <>
                <p className="text-lg">No archived weeks yet.</p>
                <p className="text-sm mt-2">Past weekly digests will appear here.</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {query && (
              <p className="text-sm text-zinc-600">
                {stories.length} {stories.length === 1 ? 'story' : 'stories'} matching{' '}
                <span className="text-zinc-400">&ldquo;{query}&rdquo;</span>
              </p>
            )}
            {weeks.map((weekStart) => (
              <WeekSection
                key={weekStart}
                weekStart={weekStart}
                stories={grouped.get(weekStart)!}
                defaultOpen
              />
            ))}
            <div className="pt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-[#6F00FF] transition-colors"
              >
                ← This Week&apos;s Feed
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
