'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const LOADING_MESSAGES = [
  'Fetching sources…',
  'Scanning the latest content…',
  'Filtering for AI & PM relevance…',
  'Synthesising findings…',
  'Generating summaries…',
  'Tagging stories…',
  'Almost there…',
]

export function RefreshButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    if (!loading) return
    setMessageIndex(0)
    const interval = setInterval(() => {
      setMessageIndex((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1))
    }, 3500)
    return () => clearInterval(interval)
  }, [loading])

  async function handleRefresh() {
    setLoading(true)
    try {
      await fetch('/api/feed', { method: 'POST' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Full-screen loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0A0B]/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6 max-w-sm text-center px-6">
            {/* Animated rings */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-[#6F00FF]/20" />
              <div className="absolute inset-0 rounded-full border-2 border-t-[#6F00FF] border-r-[#6F00FF]/50 animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-t-[#6F00FF]/60 animate-spin [animation-duration:1.5s] [animation-direction:reverse]" />
            </div>

            {/* Rotating message */}
            <div className="min-h-[2rem]">
              <p className="text-white font-medium text-lg transition-opacity duration-500">
                {LOADING_MESSAGES[messageIndex]}
              </p>
            </div>

            <p className="text-zinc-500 text-sm">
              Scanning 9 sources · Gemini AI is reading the web
            </p>
          </div>
        </div>
      )}

      {/* Floating crystal button */}
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="fixed bottom-8 right-8 z-40 flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-medium
          bg-white/8 backdrop-blur-xl border border-white/20
          text-white/80 hover:text-white
          shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]
          hover:bg-white/12 hover:border-white/30 hover:shadow-[0_8px_40px_rgba(111,0,255,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-all duration-300 ease-out"
      >
        <span className="text-base leading-none">↻</span>
        Refresh Feed
      </button>
    </>
  )
}
