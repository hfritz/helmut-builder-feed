'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  speed: number
  phase: number
  color: string
}

const COLORS = [
  'rgba(111, 0, 255,',   // electric indigo
  'rgba(139, 92, 246,',  // violet
  'rgba(167, 139, 250,', // lighter violet
  'rgba(255, 255, 255,', // white
]

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    function generateStars() {
      const count = Math.floor((window.innerWidth * window.innerHeight) / 8000)
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.8 + 0.3,
        opacity: Math.random() * 0.5 + 0.1,
        speed: Math.random() * 0.6 + 0.2,
        phase: Math.random() * Math.PI * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }))
    }

    function draw(time: number) {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const star of starsRef.current) {
        const pulse = Math.sin(time * 0.001 * star.speed + star.phase)
        const alpha = star.opacity * (0.4 + 0.6 * ((pulse + 1) / 2))
        const radius = star.size * (0.8 + 0.2 * ((pulse + 1) / 2))

        // Glow
        const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, radius * 4)
        glow.addColorStop(0, `${star.color}${(alpha * 0.8).toFixed(2)})`)
        glow.addColorStop(1, `${star.color}0)`)
        ctx.beginPath()
        ctx.arc(star.x, star.y, radius * 4, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        // Core dot
        ctx.beginPath()
        ctx.arc(star.x, star.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `${star.color}${Math.min(alpha * 1.5, 0.9).toFixed(2)})`
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    resize()
    generateStars()
    animRef.current = requestAnimationFrame(draw)

    window.addEventListener('resize', () => { resize(); generateStars() })
    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[1] pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  )
}
