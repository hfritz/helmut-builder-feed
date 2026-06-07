'use client'

import { useState } from 'react'

export function SubscribeForm() {
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

  return (
    <section className="border border-white/8 rounded-2xl bg-white/[0.02] px-6 py-8 text-center w-full">
      <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#6F00FF] mb-2">
        Weekly Digest
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
