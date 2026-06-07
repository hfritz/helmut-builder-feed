import type { Story } from '@/lib/types'

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
}

const DEFAULT_TAG = { bg: 'bg-[#6F00FF]/15', text: 'text-[#6F00FF]' }

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(dateStr))
  } catch {
    return null
  }
}

export function StoryListItem({ story }: { story: Story }) {
  const date = formatDate(story.published_at)

  return (
    <a
      href={story.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-4 py-4 border-b border-white/5 hover:border-[#6F00FF]/20 transition-colors"
    >
      {/* Left: source + date */}
      <div className="shrink-0 w-28 pt-0.5 text-right hidden sm:block">
        <span className="text-xs font-semibold text-[#6F00FF] block truncate">{story.source}</span>
        {date && <span className="text-xs text-zinc-600 mt-0.5 block">{date}</span>}
      </div>

      {/* Divider */}
      <div className="shrink-0 w-px self-stretch bg-white/10 group-hover:bg-[#6F00FF]/30 transition-colors hidden sm:block" />

      {/* Right: title + summary + tags */}
      <div className="flex-1 min-w-0">
        <div className="sm:hidden flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-[#6F00FF]">{story.source}</span>
          {date && <span className="text-xs text-zinc-600">{date}</span>}
        </div>
        <h3 className="text-sm font-semibold text-white group-hover:text-[#6F00FF]/90 transition-colors leading-snug mb-1">
          {story.title}
        </h3>
        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 mb-2">
          {story.summary}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {story.tags.map((tag) => {
            const colors = TAG_COLORS[tag] ?? DEFAULT_TAG
            return (
              <span key={tag} className={`text-xs ${colors.bg} ${colors.text} px-2 py-0.5 rounded-full`}>
                #{tag}
              </span>
            )
          })}
        </div>
      </div>

      {/* Arrow */}
      <span className="shrink-0 text-zinc-700 group-hover:text-[#6F00FF] transition-colors text-sm pt-0.5">→</span>
    </a>
  )
}
