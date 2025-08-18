import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Wand2, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CoverLetterSection() {
  return (
  <section className="relative overflow-x-hidden py-20 md:py-28">
      {/* Background: flowing gradient mesh */}
      <div className="pointer-events-none absolute inset-0 -z-10">
  {/* Bottom-right: smaller, higher, and shifted right so only half shows */}
  <div className="absolute bottom-8 right-[-8rem] h-[16rem] w-[16rem] rounded-full bg-gradient-to-tr from-violet-600/25 to-indigo-600/15 blur-2xl" />
      </div>

      <div className="container mx-auto px-5">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/70 to-zinc-950/70 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] md:p-10"
       >
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <span>Cover Letter, Done For You</span>
          </div>

          <div className="mt-4 grid items-center gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Tailored Cover Letters in <span className="text-violet-400">seconds</span>
              </h2>
              <p className="mt-4 text-zinc-400">
                Paste a job description, pick your tone, and our AI drafts a clean, employer-ready letter
                that mirrors keywords and company voice—no generic fluff.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-zinc-300">
                <li className="flex items-start gap-3">
                  <Wand2 className="mt-0.5 h-5 w-5 text-violet-400" />
                  Smart tone presets (professional, concise, persuasive)
                </li>
                <li className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-5 w-5 text-violet-400" />
                  Pulls achievements from your resume automatically
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-violet-400" />
                  ATS-aware structure + keyword alignment
                </li>
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/cover-letter"
                  className="group inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500"
                >
                  Generate a Cover Letter
                  <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/templates#cover-letter"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-zinc-900/60 px-5 py-3 text-sm font-medium text-zinc-200 hover:bg-zinc-800/60"
                >
                  See examples
                </Link>
              </div>
            </div>

            {/* Right: preview card with subtle motion */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05, duration: 0.5 }}
              className="relative"
            >
              <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/70 p-4 backdrop-blur">
                <div className="rounded-xl bg-white p-5 text-zinc-900">
                  <div className="text-xs text-zinc-500">To: Hiring Manager</div>
                  <h3 className="mt-1 text-lg font-semibold">Front-End Engineer — Cover Letter</h3>
                  <div className="mt-3 space-y-2 text-sm leading-6">
                    <p>
                      I’m excited to apply for the Front-End Engineer role at <span className="font-medium">Acme</span>.
                      In my last role I improved LCP by 35% and shipped a design system used across 7 products…
                    </p>
                    <p className="rounded-md bg-violet-50 px-3 py-2 text-violet-800">
                      Matched keywords: React • TypeScript • Accessibility • Performance
                    </p>
                  </div>
                </div>
              </div>

              {/* floating accent dots */}
              <span className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-violet-600/20 blur-2xl" />
              <span className="absolute -bottom-6 -left-6 h-14 w-14 rounded-full bg-fuchsia-600/20 blur-2xl" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
