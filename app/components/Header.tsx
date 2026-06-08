interface HeaderProps {
  lastUpdated: string | null
  storyCount: number
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Not yet updated'
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

export function Header({ lastUpdated, storyCount }: HeaderProps) {
  return (
    <header className="relative w-full mb-10 overflow-hidden">
      {/* Hero image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero.jpg')" }}
      />
      {/* Gradient overlay — dark at top/bottom, slightly transparent in middle */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B] via-[#0A0A0B]/60 to-[#0A0A0B]" />

      {/* Content */}
      <div className="relative z-10 px-6 pt-16 pb-14 max-w-5xl mx-auto">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#6F00FF] mb-3 block">
              AI × Product Management
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold text-white leading-tight drop-shadow-lg">
              Helmut&apos;s{' '}
              <span className="text-[#6F00FF]">Builder</span>{' '}
              Feed
            </h1>
            <p className="mt-3 text-zinc-300 text-lg drop-shadow">
              Stay ahead of AI × Product Management
            </p>
          </div>
          <div className="text-right text-sm shrink-0 pb-1 flex flex-col items-end gap-2">
            <a
              href="/archive"
              className="text-xs font-medium tracking-widest uppercase text-zinc-400 hover:text-[#6F00FF] transition-colors border border-white/10 hover:border-[#6F00FF]/40 px-3 py-1.5 rounded-lg backdrop-blur-sm bg-black/20"
            >
              Archive →
            </a>
            <div className="text-zinc-400">{storyCount} stories</div>
            <div className="text-zinc-500">Updated {formatDate(lastUpdated)}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
