'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const QUICK_SEARCHES = [
  { label: 'AI Tools',           query: 'AI Tools' },
  { label: 'Strategy',           query: 'Strategy' },
  { label: 'LLMs',               query: 'LLMs' },
  { label: 'Agents',             query: 'Agents' },
  { label: 'Launch',             query: 'Launch' },
  { label: 'Research',           query: 'Research' },
  { label: 'Funding',            query: 'Funding' },
  { label: 'Workflows',          query: 'Workflows' },
  { label: 'Product Management', query: 'Product Management' },
  { label: 'AI Design',          query: 'AI Design' },
  { label: 'Vibe Coding',        query: 'Vibe Coding' },
  { label: 'Dev Tools',          query: 'Dev Tools' },
]

const TAG_COLORS: Record<string, string> = {
  'AI Tools':           'hover:bg-blue-500/20 hover:text-blue-300 data-[active=true]:bg-blue-500/20 data-[active=true]:text-blue-300 data-[active=true]:border-blue-500/40',
  'Strategy':           'hover:bg-amber-500/20 hover:text-amber-300 data-[active=true]:bg-amber-500/20 data-[active=true]:text-amber-300 data-[active=true]:border-amber-500/40',
  'LLMs':               'hover:bg-violet-500/20 hover:text-violet-300 data-[active=true]:bg-violet-500/20 data-[active=true]:text-violet-300 data-[active=true]:border-violet-500/40',
  'Agents':             'hover:bg-indigo-500/20 hover:text-indigo-300 data-[active=true]:bg-indigo-500/20 data-[active=true]:text-indigo-300 data-[active=true]:border-indigo-500/40',
  'Launch':             'hover:bg-orange-500/20 hover:text-orange-300 data-[active=true]:bg-orange-500/20 data-[active=true]:text-orange-300 data-[active=true]:border-orange-500/40',
  'Research':           'hover:bg-cyan-500/20 hover:text-cyan-300 data-[active=true]:bg-cyan-500/20 data-[active=true]:text-cyan-300 data-[active=true]:border-cyan-500/40',
  'Funding':            'hover:bg-yellow-500/20 hover:text-yellow-300 data-[active=true]:bg-yellow-500/20 data-[active=true]:text-yellow-300 data-[active=true]:border-yellow-500/40',
  'Workflows':          'hover:bg-pink-500/20 hover:text-pink-300 data-[active=true]:bg-pink-500/20 data-[active=true]:text-pink-300 data-[active=true]:border-pink-500/40',
  'Product Management': 'hover:bg-emerald-500/20 hover:text-emerald-300 data-[active=true]:bg-emerald-500/20 data-[active=true]:text-emerald-300 data-[active=true]:border-emerald-500/40',
  'AI Design':          'hover:bg-rose-500/20 hover:text-rose-300 data-[active=true]:bg-rose-500/20 data-[active=true]:text-rose-300 data-[active=true]:border-rose-500/40',
  'Vibe Coding':        'hover:bg-lime-500/20 hover:text-lime-300 data-[active=true]:bg-lime-500/20 data-[active=true]:text-lime-300 data-[active=true]:border-lime-500/40',
  'Dev Tools':          'hover:bg-teal-500/20 hover:text-teal-300 data-[active=true]:bg-teal-500/20 data-[active=true]:text-teal-300 data-[active=true]:border-teal-500/40',
}

export function QuickSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('q') ?? ''

  function select(query: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (current === query) {
      params.delete('q')
    } else {
      params.set('q', query)
    }
    router.replace(`/archive?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {QUICK_SEARCHES.map(({ label, query }) => {
        const isActive = current === query
        const colors = TAG_COLORS[label] ?? 'hover:bg-white/10 hover:text-white'
        return (
          <button
            key={query}
            onClick={() => select(query)}
            data-active={isActive}
            className={`text-xs px-3 py-1.5 rounded-full border border-white/10 text-zinc-500 transition-all cursor-pointer ${colors}`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
