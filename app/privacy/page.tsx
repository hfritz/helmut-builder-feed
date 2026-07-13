import Link from 'next/link'
import { Footer } from '@/app/components/Footer'

export const metadata = {
  title: 'Privacy Policy — Helmut’s Builder Feed',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-[#6F00FF] transition-colors mb-10"
        >
          ← This Monday&apos;s Feed
        </Link>

        <div className="mb-10">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#6F00FF] block mb-2">
            Privacy Policy
          </span>
          <h1 className="text-4xl font-bold text-white mb-2">How your data is handled</h1>
          <p className="text-zinc-400">Last updated July 13, 2026</p>
        </div>

        <div className="space-y-8 text-zinc-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-base mb-2">Who runs this</h2>
            <p>
              Helmut&apos;s Builder Feed is a personal, non-commercial newsletter run by Helmut Fritz,
              based in Berlin, Germany. For any question about this policy or your data, email{' '}
              <a href="mailto:helmut.fritz.v@gmail.com" className="text-[#6F00FF] hover:underline">
                helmut.fritz.v@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">What is collected</h2>
            <p>
              Just your email address, when you submit it through the subscribe form. That&apos;s the
              only personal data this site collects — there is no account system, no analytics, and
              no tracking cookies of any kind.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Why it&apos;s collected</h2>
            <p>
              Solely to send you the weekly digest email you signed up for. Your email is never used
              for anything else, and it is never sold, rented, or shared with advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Where it&apos;s stored</h2>
            <p>
              Your email is stored in a Supabase-hosted database and used by{' '}
              <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-[#6F00FF] hover:underline">
                Resend
              </a>{' '}
              to deliver the digest. These are the only two service providers with access to it — both
              act strictly as data processors for this purpose, not as independent data controllers.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">How long it&apos;s kept</h2>
            <p>
              For as long as you&apos;re subscribed. Every email includes an unsubscribe link, which
              immediately stops future sends. If you&apos;d like your email fully deleted from the
              database rather than just marked unsubscribed, email the address above and it will be
              removed.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Your rights</h2>
            <p>
              You can ask to see, correct, or delete the data held about you at any time — just email{' '}
              <a href="mailto:helmut.fritz.v@gmail.com" className="text-[#6F00FF] hover:underline">
                helmut.fritz.v@gmail.com
              </a>{' '}
              and it&apos;ll be handled directly.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-2">Changes</h2>
            <p>
              If this policy changes in a meaningful way, the date at the top of this page will be
              updated to reflect it.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
