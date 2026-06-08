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

const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'AI Tools':           { bg: 'bg-blue-500/15',    text: 'text-blue-400',    border: 'border-blue-500/25 hover:border-blue-500/40 data-[active=true]:border-blue-500/60' },
  'Strategy':           { bg: 'bg-amber-500/15',   text: 'text-amber-400',   border: 'border-amber-500/25 hover:border-amber-500/40 data-[active=true]:border-amber-500/60' },
  'LLMs':               { bg: 'bg-violet-500/15',  text: 'text-violet-400',  border: 'border-violet-500/25 hover:border-violet-500/40 data-[active=true]:border-violet-500/60' },
  'Agents':             { bg: 'bg-indigo-500/15',  text: 'text-indigo-400',  border: 'border-indigo-500/25 hover:border-indigo-500/40 data-[active=true]:border-indigo-500/60' },
  'Launch':             { bg: 'bg-orange-500/15',  text: 'text-orange-400',  border: 'border-orange-500/25 hover:border-orange-500/40 data-[active=true]:border-orange-500/60' },
  'Research':           { bg: 'bg-cyan-500/15',    text: 'text-cyan-400',    border: 'border-cyan-500/25 hover:border-cyan-500/40 data-[active=true]:border-cyan-500/60' },
  'Funding':            { bg: 'bg-yellow-500/15',  text: 'text-yellow-400',  border: 'border-yellow-500/25 hover:border-yellow-500/40 data-[active=true]:border-yellow-500/60' },
  'Workflows':          { bg: 'bg-pink-500/15',    text: 'text-pink-400',    border: 'border-pink-500/25 hover:border-pink-500/40 data-[active=true]:border-pink-500/60' },
  'Product Management': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/25 hover:border-emerald-500/40 data-[active=true]:border-emerald-500/60' },
  'AI Design':          { bg: 'bg-rose-500/15',    text: 'text-rose-400',    border: 'border-rose-500/25 hover:border-rose-500/40 data-[active=true]:border-rose-500/60' },
  'Vibe Coding':        { bg: 'bg-lime-500/15',    text: 'text-lime-400',    border: 'border-lime-500/25 hover:border-lime-500/40 data-[active=true]:border-lime-500/60' },
  'Dev Tools':          { bg: 'bg-teal-500/15',    text: 'text-teal-400',    border: 'border-teal-500/25 hover:border-teal-500/40 data-[active=true]:border-teal-500/60' },
}

const DEFAULT_TAG = {
  bg: 'bg-violet-500/15',
  text: 'text-violet-400',
  border: 'border-violet-500/25 hover:border-violet-500/40 data-[active=true]:border-violet-500/60',
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
        const colors = TAG_COLORS[label] ?? DEFAULT_TAG
        return (
          <button
            key={query}
            onClick={() => select(query)}
            data-active={isActive}
            className={`text-xs ${colors.bg} ${colors.text} ${colors.border} px-3 py-1.5 rounded-full border font-medium transition-all cursor-pointer hover:-translate-y-px data-[active=true]:ring-1 data-[active=true]:ring-white/10`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
