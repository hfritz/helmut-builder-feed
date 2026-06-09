import Image from 'next/image'

export function AboutSection() {
  return (
    <section id="behind-the-digest" className="max-w-5xl w-full mx-auto px-6 pb-10 scroll-mt-16">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-8 md:p-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-5 bg-[#6F00FF] rounded-full" />
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-400">
            Behind the Digest
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="shrink-0">
            <Image
              src="/helmut.jpg"
              alt="Helmut Fritz"
              width={160}
              height={160}
              className="w-28 h-28 md:w-40 md:h-40 rounded-xl object-cover border border-white/10 shadow-lg"
            />
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Hi, I&apos;m Helmut.</h2>
              <p className="text-base text-zinc-300 leading-relaxed">
                17 years building digital products across marketplaces, e-commerce, and platform businesses.
                I combine customer obsession and data-driven thinking with hands-on execution
                and I use AI to move faster, build smarter, and stay ahead of the curve.
              </p>
              <br />
              <p className="text-base text-zinc-300 leading-relaxed">
                This digest is how I keep my builder edge sharp, every week.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-1">
              <p className="text-xs text-zinc-400">Learn more about me here:</p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://helmutfritz.fyi/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-[#6F00FF] border border-white/20 hover:border-[#6F00FF]/40 rounded-lg px-4 py-2 transition-all"
              >
                helmutfritz.fyi →
              </a>
              <a
                href="https://linkedin.com/in/hfritz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-[#6F00FF] border border-white/20 hover:border-[#6F00FF]/40 rounded-lg px-4 py-2 transition-all"
              >
                LinkedIn →
              </a>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
