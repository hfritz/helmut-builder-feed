'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'

const QUICK_TAGS = [
  'AI Tools', 'Strategy', 'LLMs', 'Agents', 'Launch', 'Research',
  'Funding', 'Workflows', 'Product Management', 'AI Design', 'Vibe Coding', 'Dev Tools',
]

const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'AI Tools':           { bg: 'bg-blue-500/15',    text: 'text-blue-400',    border: 'border-blue-500/30' },
  'Strategy':           { bg: 'bg-amber-500/15',   text: 'text-amber-400',   border: 'border-amber-500/30' },
  'LLMs':               { bg: 'bg-violet-500/15',  text: 'text-violet-400',  border: 'border-violet-500/30' },
  'Agents':             { bg: 'bg-indigo-500/15',  text: 'text-indigo-400',  border: 'border-indigo-500/30' },
  'Launch':             { bg: 'bg-orange-500/15',  text: 'text-orange-400',  border: 'border-orange-500/30' },
  'Research':           { bg: 'bg-cyan-500/15',    text: 'text-cyan-400',    border: 'border-cyan-500/30' },
  'Funding':            { bg: 'bg-yellow-500/15',  text: 'text-yellow-400',  border: 'border-yellow-500/30' },
  'Workflows':          { bg: 'bg-pink-500/15',    text: 'text-pink-400',    border: 'border-pink-500/30' },
  'Product Management': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'AI Design':          { bg: 'bg-rose-500/15',    text: 'text-rose-400',    border: 'border-rose-500/30' },
  'Vibe Coding':        { bg: 'bg-lime-500/15',    text: 'text-lime-400',    border: 'border-lime-500/30' },
  'Dev Tools':          { bg: 'bg-teal-500/15',    text: 'text-teal-400',    border: 'border-teal-500/30' },
}

const DEFAULT_TAG = { bg: 'bg-[#6F00FF]/15', text: 'text-[#6F00FF]', border: 'border-[#6F00FF]/30' }

export function ArchiveStickyHeader() {
  const [visible, setVisible] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const query = searchParams.get('q') ?? ''
  const activeTag = QUICK_TAGS.find((t) => t === query) ?? null

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Keep input in sync when query changes externally (e.g. tag click)
  useEffect(() => {
    if (inputRef.current) inputRef.current.value = activeTag ? '' : query
  }, [query, activeTag])

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) params.set('q', value)
        else params.delete('q')
        startTransition(() => router.replace(`/archive?${params.toString()}`, { scroll: false }))
      }, 800)
    },
    [router, searchParams]
  )

  function clearTag() {
    router.replace('/archive', { scroll: false })
  }

  const colors = activeTag ? (TAG_COLORS[activeTag] ?? DEFAULT_TAG) : DEFAULT_TAG

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-[#09090b]/90 backdrop-blur-md border-b border-white/8">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">⌕</span>
            <input
              ref={inputRef}
              type="text"
              defaultValue={activeTag ? '' : query}
              onChange={handleChange}
              placeholder="Search archive…"
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2
                text-white placeholder:text-zinc-600 text-sm
                focus:outline-none focus:border-[#6F00FF]/60 transition-colors"
            />
            {isPending && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-[#6F00FF] border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          {activeTag && (
            <button
              onClick={clearTag}
              className={`flex items-center gap-1.5 text-xs ${colors.bg} ${colors.text} ${colors.border} border px-3 py-1.5 rounded-full font-medium shrink-0 hover:opacity-80 transition-opacity`}
            >
              {activeTag}
              <span className="opacity-60 text-sm leading-none">×</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
