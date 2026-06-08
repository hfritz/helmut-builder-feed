'use client'

import { useEffect, useState } from 'react'

function slugify(label: string) {
  return label.toLowerCase().replace(/\s+/g, '-')
}

interface HomeStickyNavProps {
  sections: string[]
}

export function HomeStickyNav({ sections }: HomeStickyNavProps) {
  const [visible, setVisible] = useState(false)
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px' }
    )

    sections.forEach((label) => {
      const el = document.getElementById(slugify(label))
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [sections])

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-[#09090b]/90 backdrop-blur-md border-b border-white/8">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {sections.map((label) => {
            const id = slugify(label)
            const isActive = active === id
            return (
              <a
                key={id}
                href={`#${id}`}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                    : 'text-zinc-400 border-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                {label}
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
