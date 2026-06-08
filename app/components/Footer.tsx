export function Footer() {
  return (
    <footer className="border-t border-white/10 mt-4">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row gap-8 items-start justify-between">
        <div className="flex-1">
          <a
            href="https://helmutfritz.fyi/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-white hover:text-[#6F00FF] transition-colors"
          >
            Helmut Fritz
          </a>
          <p className="text-sm text-zinc-500 mt-1 leading-relaxed max-w-sm">
            Fractional Head of Product with 10+ years building AI-powered products.
            This is my weekly signal filter for the AI × PM space.
          </p>
          <div className="flex items-center gap-4 mt-3">
            <a
              href="https://linkedin.com/in/hfritz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-500 hover:text-[#6F00FF] transition-colors"
            >
              LinkedIn →
            </a>
            <a
              href="https://helmutfritz.fyi/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-500 hover:text-[#6F00FF] transition-colors"
            >
              Website →
            </a>
          </div>
        </div>

        <div className="text-xs text-zinc-600 sm:text-right shrink-0">
          <p>Drops every Monday</p>
          <p className="mt-1">Built with AI tools · 2026</p>
        </div>
      </div>
    </footer>
  )
}
