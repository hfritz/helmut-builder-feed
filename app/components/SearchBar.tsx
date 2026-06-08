'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useRef, useTransition } from 'react'

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const query = searchParams.get('q') ?? ''

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

  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
        ⌕
      </span>
      <input
        type="text"
        defaultValue={query}
        onChange={handleChange}
        placeholder="Search titles, summaries, or topics…"
        className="w-full bg-[#111114] border border-white/10 rounded-xl pl-10 pr-4 py-3
          text-white placeholder:text-zinc-400 text-sm
          focus:outline-none focus:border-[#6F00FF]/60 focus:ring-1 focus:ring-[#6F00FF]/30
          transition-colors"
      />
      {isPending && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-[#6F00FF] border-t-transparent rounded-full animate-spin" />
      )}
    </div>
  )
}
