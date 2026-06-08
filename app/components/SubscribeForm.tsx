'use client'

import { useState } from 'react'

interface SubscribeFormProps {
  variant?: 'default' | 'compact'
}

export function SubscribeForm({ variant = 'default' }: SubscribeFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
      } else if (data.alreadySubscribed) {
        setStatus('duplicate')
      } else {
        setStatus('success')
        setEmail('')
      }
    } catch {
      setStatus('error')
    }
  }

  if (variant === 'compact') {
    return (
      <div className="relative border border-[#6F00FF]/40 rounded-xl bg-gradient-to-r from-[#6F00FF]/8 to-[#6F00FF]/4 px-6 py-5 mb-8 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#6F00FF] to-[#6F00FF]/0 rounded-l-xl" />
        {status === 'success' ? (
          <p className="text-sm text-emerald-400">You&apos;re in! Expect the first digest next Monday.</p>
        ) : status === 'duplicate' ? (
          <p className="text-sm text-zinc-400">You&apos;re already subscribed.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 relative z-10">
            <p className="text-sm font-medium text-[#6F00FF] shrink-0 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6F00FF] shrink-0" />
              Get it in your inbox every Monday
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 sm:w-52 bg-white/8 border border-[#6F00FF]/20 hover:border-[#6F00FF]/40 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#6F00FF] focus:bg-white/10 transition-all"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-4 py-2 bg-[#6F00FF] hover:bg-[#7d1aff] active:scale-95 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-[#6F00FF]/20 shrink-0"
              >
                {status === 'loading' ? '...' : 'Subscribe'}
              </button>
            </div>
            {status === 'error' && (
              <p className="text-xs text-red-400">Something went wrong.</p>
            )}
          </form>
        )}
      </div>
    )
  }

  return (
    <section className="border border-white/8 rounded-2xl bg-white/[0.02] px-6 py-8 text-center w-full">
      <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#6F00FF] mb-2">
        Monday Snapshot
      </p>
      <h2 className="text-lg font-bold text-white mb-1">Get it in your inbox</h2>
      <p className="text-sm text-zinc-500 mb-6">
        The AI × PM space moves fast and the noise is relentless. Every Monday I cut through it —
        one focused digest of what actually matters for product builders.
      </p>

      {status === 'success' ? (
        <p className="text-sm text-emerald-400">You&apos;re in! Expect the first digest next Monday.</p>
      ) : status === 'duplicate' ? (
        <p className="text-sm text-zinc-400">You&apos;re already subscribed.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#6F00FF]/60 transition-colors"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 py-2 bg-[#6F00FF] hover:bg-[#5a00cc] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
          >
            {status === 'loading' ? '...' : 'Subscribe'}
          </button>
        </form>
      )}

      {status === 'error' && (
        <p className="text-xs text-red-400 mt-2">Something went wrong. Please try again.</p>
      )}
    </section>
  )
}
