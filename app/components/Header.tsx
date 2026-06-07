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
    <header className="border-b border-white/10 pb-8 mb-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#6F00FF]">
              AI × Product Management
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            Helmut&apos;s{' '}
            <span className="text-[#6F00FF]">Builder</span>{' '}
            Feed
          </h1>
          <p className="mt-2 text-zinc-400 text-lg">
            Stay ahead of AI × Product Management
          </p>
        </div>
        <div className="text-right text-sm text-zinc-500 shrink-0">
          <div>{storyCount} stories today</div>
          <div className="mt-1">Updated {formatDate(lastUpdated)}</div>
        </div>
      </div>
    </header>
  )
}
