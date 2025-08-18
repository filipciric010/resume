import React from 'react';
import { motion } from 'framer-motion';
import { ScanSearch, Gauge, BadgeCheck, Upload, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ATSCheckSection() {
  return (
  <section className="relative overflow-hidden py-20 md:py-28">
      {/* Background: subtle animated grid lines */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-gray-900/30 opacity-[0.08] dark:text-white"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Decorative gradient blob to match Cover Letter top-left (bottom-left here) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute bottom-28 left-[-11rem] h-[22rem] w-[22rem] rounded-full bg-gradient-to-tr from-fuchsia-500/20 to-violet-500/15 blur-3xl dark:from-fuchsia-600/30 dark:to-violet-600/20" />
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
            <ScanSearch className="h-4 w-4 text-violet-400" />
            <span>ATS Check</span>
          </div>

          <div className="grid gap-8 md:grid-cols-[1.2fr,0.8fr]">
            {/* Left: headline & form */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-gray-200 bg-white p-6 backdrop-blur md:p-10 dark:border-white/10 dark:bg-zinc-950/60"
            >
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
                Will your resume pass an <span className="text-violet-400">ATS scan</span>?
              </h2>
              <p className="mt-4 text-gray-600 dark:text-zinc-400">
                Paste a job description and upload your resume to see keyword match, formatting issues,
                missing sections, and an overall score—plus one-click fixes.
              </p>

              {/* Input row (fake form for landing) */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  placeholder="Paste a job description URL or text…"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-500 outline-none ring-0 focus:border-violet-500/60 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-200 dark:placeholder-zinc-500"
                />
                <button
          className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-800/60"
                  type="button"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload resume
                </button>
                <Link
                  to="/ats"
                  className="group inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500"
                >
                  Run ATS Check
                  <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* Score preview */}
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
                    <Gauge className="h-4 w-4 text-violet-400" />
                    Score Preview
                  </div>
                  <div className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">82</div>
                  <p className="mt-1 text-xs text-gray-600 dark:text-zinc-400">Great fit. Improve keywords for 90+.</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900/50">
                  <div className="text-sm text-gray-600 dark:text-zinc-400">Top Missing Keywords</div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-lg bg-violet-100 px-2 py-1 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">React</span>
                    <span className="rounded-lg bg-violet-100 px-2 py-1 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">TypeScript</span>
                    <span className="rounded-lg bg-violet-100 px-2 py-1 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">A11y</span>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
                    <BadgeCheck className="h-4 w-4 text-violet-400" />
                    Quick Fixes
                  </div>
                  <ul className="mt-3 space-y-2 text-xs text-gray-700 dark:text-zinc-300">
                    <li>Convert PNG logos to text for ATS</li>
                    <li>Add metrics to 2 bullets</li>
                    <li>Include job title in header</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Right: decorative score ring */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="relative flex items-center justify-center"
            >
              <div className="relative h-64 w-64">
                <svg viewBox="0 0 200 200" className="h-full w-full">
                  <circle cx="100" cy="100" r="84" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
                  <circle
                    cx="100" cy="100" r="84" fill="none" stroke="url(#g)"
                    strokeLinecap="round" strokeWidth="14"
                    strokeDasharray={2.64 * Math.PI * 84}
                    strokeDashoffset={2.64 * Math.PI * 84 * (1 - 0.82)}
                  />
                  <defs>
                    <linearGradient id="g" x1="0" x2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                  <text x="100" y="106" textAnchor="middle" className="fill-white text-4xl font-bold">82</text>
                </svg>
                <div className="absolute inset-0 -z-10 rounded-full bg-violet-600/10 blur-2xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
