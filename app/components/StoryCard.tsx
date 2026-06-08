import type { Story } from '@/lib/types'

interface StoryCardProps {
  story: Story
}

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  'AI Tools':           { bg: 'bg-blue-500/15',    text: 'text-blue-400' },
  'Strategy':           { bg: 'bg-amber-500/15',   text: 'text-amber-400' },
  'LLMs':               { bg: 'bg-violet-500/15',  text: 'text-violet-400' },
  'Product Management': { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  'Launch':             { bg: 'bg-orange-500/15',  text: 'text-orange-400' },
  'Research':           { bg: 'bg-cyan-500/15',    text: 'text-cyan-400' },
  'Funding':            { bg: 'bg-yellow-500/15',  text: 'text-yellow-400' },
  'Workflows':          { bg: 'bg-pink-500/15',    text: 'text-pink-400' },
  'Agents':             { bg: 'bg-indigo-500/15',  text: 'text-indigo-400' },
  'AI Design':          { bg: 'bg-rose-500/15',    text: 'text-rose-400' },
  'Vibe Coding':        { bg: 'bg-lime-500/15',    text: 'text-lime-400' },
  'Dev Tools':          { bg: 'bg-teal-500/15',    text: 'text-teal-400' },
}

const DEFAULT_TAG = { bg: 'bg-[#6F00FF]/15', text: 'text-[#6F00FF]' }

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
  } catch {
    return null
  }
}

export function StoryCard({ story }: StoryCardProps) {
  const date = formatDate(story.published_at)

  return (
    <article className="bg-[#111114] border border-white/10 rounded-xl p-6 flex flex-col gap-3 hover:border-[#6F00FF]/50 transition-colors group">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold tracking-widest uppercase text-violet-400">
          {story.source}
        </span>
        {date && (
          <span className="text-xs text-zinc-600 shrink-0">{date}</span>
        )}
      </div>

      <h2 className="text-lg font-bold leading-snug">
        <a
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-violet-300 transition-colors"
        >
          {story.title}
        </a>
      </h2>

      <p className="text-sm text-zinc-400 leading-relaxed flex-1">
        {story.summary}
      </p>

      {story.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {story.tags.map((tag) => {
            const colors = TAG_COLORS[tag] ?? DEFAULT_TAG
            return (
              <span
                key={tag}
                className={`text-xs ${colors.bg} ${colors.text} px-2.5 py-1 rounded-full font-medium`}
              >
                #{tag}
              </span>
            )
          })}
        </div>
      )}

      <a
        href={story.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-zinc-600 hover:text-violet-400 transition-colors mt-1 self-start"
      >
        Read More →
      </a>
    </article>
  )
}
