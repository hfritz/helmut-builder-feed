'use client'

import { useState } from 'react'
import { StoryListItem } from './StoryListItem'
import type { Story } from '@/lib/types'

interface WeekSectionProps {
  weekStart: string
  stories: Story[]
  defaultOpen?: boolean
}

function formatWeekLabel(weekStart: string): string {
  try {
    const date = new Date(weekStart + 'T12:00:00Z')
    const end = new Date(date)
    end.setDate(end.getDate() + 6)
    const fmt = (d: Date) =>
      new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d)
    return `${fmt(date)}, ${end.getFullYear()}`
  } catch {
    return weekStart
  }
}

export function WeekSection({ weekStart, stories, defaultOpen = false }: WeekSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 mb-0 group"
      >
        <h2 className="text-sm font-semibold tracking-widest uppercase text-[#6F00FF] shrink-0">
          {formatWeekLabel(weekStart)}
        </h2>
        <div className="flex-1 h-px bg-white/10 group-hover:bg-[#6F00FF]/20 transition-colors" />
        <span className="text-xs text-zinc-600 shrink-0">{stories.length} stories</span>
        <span className={`text-zinc-600 group-hover:text-[#6F00FF] transition-all duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}>
          ▾
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-[9999px] opacity-100 mt-1' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="divide-y divide-white/5">
          {stories.map((story) => (
            <StoryListItem key={story.id} story={story} />
          ))}
        </div>
      </div>
    </section>
  )
}
