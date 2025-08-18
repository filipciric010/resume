import React from 'react';
import { Mail, Phone, MapPin, Globe, UserRound, BriefcaseBusiness, GraduationCap } from 'lucide-react';

interface TemplatePreviewProps {
  templateId: 'modern' | 'classic' | 'compact' | 'modern-compact' | 'punk' | 'timeline';
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ templateId }) => {
  const renderModernPreview = () => (
    <div className="w-full h-full bg-white p-2 text-[11px] flex flex-col gap-2 rounded-xl">
      {/* Gradient header */}
      <div className="rounded-xl px-3 py-2 text-white bg-gradient-to-r from-indigo-500 to-fuchsia-600">
        <div className="text-sm font-semibold leading-tight truncate">John Doe</div>
        <div className="mt-0.5 text-[11px]/4 opacity-90 flex items-center gap-1 truncate">
          <Mail className="w-3 h-3" />
          <span className="truncate">john@email.com</span>
        </div>
        <div className="text-[11px] opacity-90 flex items-center gap-1 truncate">
          <Phone className="w-3 h-3" />
          <span className="truncate">(555) 123-4567</span>
        </div>
      </div>

      {/* Body placeholder */}
      <div className="flex-1 rounded-xl bg-zinc-50 p-2">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Experience</div>
        <div className="mt-1 space-y-1.5">
          <div className="h-2.5 bg-zinc-200/90 rounded" />
          <div className="h-2 bg-zinc-200/90 rounded w-9/12" />
          <div className="h-2 bg-zinc-200/70 rounded w-7/12" />
        </div>
        <div className="my-2 h-px bg-zinc-200 rounded" />
        <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Education</div>
        <div className="mt-1 space-y-1.5">
          <div className="h-2.5 bg-zinc-200/90 rounded w-10/12" />
          <div className="h-2 bg-zinc-200/80 rounded w-6/12" />
        </div>
        <div className="my-2 h-px bg-zinc-200 rounded" />
        <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Skills</div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="h-3.5 w-10 rounded-full bg-zinc-200/90" />
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <div className="h-3 rounded-lg bg-zinc-100" />
    </div>
  );

  const renderClassicPreview = () => (
    <div className="w-full h-full bg-white p-2 text-[11px] flex flex-col rounded-xl">
      {/* Header: centered name and compact contact row */}
      <header className="text-center">
        <div className="text-sm font-semibold tracking-tight text-slate-900">John Doe</div>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /><span>john@email.com</span></span>
          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /><span>(555) 123-4567</span></span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /><span>City, ST</span></span>
          <span className="flex items-center gap-1"><Globe className="w-3 h-3" /><span>site.com</span></span>
        </div>
      </header>

      {/* Summary */}
      <section className="mt-2 border-t border-slate-200 pt-1.5">
        <div className="text-[10px] font-semibold text-slate-800">Summary</div>
        <div className="mt-1 space-y-1.5">
          <div className="h-2.5 bg-slate-100 rounded" />
          <div className="h-2 bg-slate-100 rounded w-10/12" />
        </div>
      </section>

      {/* Experience */}
      <section className="mt-2 border-t border-slate-200 pt-1.5">
        <div className="text-[10px] font-semibold text-slate-800">Professional Experience</div>
        <div className="mt-1 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[11px] font-semibold text-slate-900 leading-none">Senior Developer</div>
              <div className="text-[10px] text-indigo-700 leading-none">Tech Company <span className="text-slate-500">• Remote</span></div>
            </div>
            <span className="shrink-0 text-[9px] text-slate-600 bg-slate-100 rounded-full px-1.5 py-0.5">2020 - Present</span>
          </div>
          <div className="space-y-1">
            <div className="h-2 bg-slate-100 rounded w-11/12" />
            <div className="h-2 bg-slate-100 rounded w-9/12" />
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="mt-2 border-t border-slate-200 pt-1.5">
        <div className="text-[10px] font-semibold text-slate-800">Education</div>
        <div className="mt-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[11px] font-semibold text-slate-900 leading-none">B.Sc. Computer Science</div>
              <div className="text-[10px] text-slate-700 leading-none">State University</div>
            </div>
            <span className="shrink-0 text-[9px] text-slate-600 bg-slate-100 rounded-full px-1.5 py-0.5">2016 - 2020</span>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="mt-2 border-t border-slate-200 pt-1.5">
        <div className="text-[10px] font-semibold text-slate-800">Skills</div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="inline-flex h-3.5 items-center rounded-full bg-slate-100 px-2 text-[9.5px] text-slate-700">
              Skill
            </span>
          ))}
        </div>
      </section>
    </div>
  );

  const renderModernCompactPreview = () => (
    <div className="w-full h-full bg-white p-2 text-[11px] rounded-xl overflow-hidden">
      <div className="grid grid-cols-12 h-full gap-2">
        {/* Left sidebar */}
        <aside className="col-span-5 bg-violet-700 text-white rounded-lg p-2 flex flex-col">
          <div className="text-sm font-semibold leading-tight">John Doe</div>
          <div className="mt-1 space-y-1 text-[10px] opacity-90">
            <div className="flex items-center gap-1"><Mail className="w-3 h-3" /><span>john@email.com</span></div>
            <div className="flex items-center gap-1"><Phone className="w-3 h-3" /><span>(555) 123-4567</span></div>
          </div>
          <div className="mt-2">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-white/90">Skills</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="h-3.5 w-10 rounded-full bg-white/15 ring-1 ring-white/20" />
              ))}
            </div>
          </div>
        </aside>
        {/* Right content */}
        <main className="col-span-7 rounded-lg bg-zinc-50 p-2 flex flex-col">
          <div className="text-[10px] font-semibold text-zinc-700">Summary</div>
          <div className="mt-1 space-y-1.5">
            <div className="h-2.5 bg-zinc-200/90 rounded" />
            <div className="h-2 bg-zinc-200/80 rounded w-9/12" />
          </div>
          <div className="my-2 h-px bg-zinc-200 rounded" />
          <div className="text-[10px] font-semibold text-zinc-700">Experience</div>
          <div className="mt-1 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] font-semibold text-zinc-900 leading-none">Senior Developer</div>
                <div className="text-[10px] text-indigo-700 leading-none">Tech Company</div>
              </div>
              <span className="shrink-0 text-[9px] text-zinc-600 bg-zinc-200 rounded-full px-1.5 py-0.5">2020 - Present</span>
            </div>
            <div className="h-2 bg-zinc-200 rounded w-11/12" />
            <div className="h-2 bg-zinc-200 rounded w-9/12" />
          </div>
        </main>
      </div>
    </div>
  );

  const renderPunkPreview = () => (
    <div className="w-full h-full bg-white p-2 text-[11px] rounded-xl overflow-hidden">
      <div className="grid grid-cols-12 h-full gap-2">
        {/* Left content */}
        <main className="col-span-7 rounded-lg bg-white p-2">
          <div className="mb-1">
            <div className="text-base font-black uppercase tracking-tight text-fuchsia-700 truncate">John Doe</div>
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wide text-fuchsia-700">Summary</div>
            <div className="mt-1 h-1 w-14 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded" />
            <div className="mt-1.5 space-y-1">
              <div className="h-2.5 bg-zinc-100 rounded" />
              <div className="h-2 bg-zinc-100 rounded w-9/12" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-[10px] font-extrabold uppercase tracking-wide text-fuchsia-700">Work History</div>
            <div className="mt-1 h-1 w-14 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded" />
            <div className="mt-1.5 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-semibold text-zinc-900 leading-none">Senior Developer</div>
                  <div className="text-[10px] text-violet-700 leading-none">Tech Company</div>
                </div>
                <span className="shrink-0 text-[9px] text-fuchsia-700 bg-fuchsia-50 rounded px-1.5 py-0.5">2020 – Present</span>
              </div>
              <div className="h-2 bg-zinc-100 rounded w-10/12" />
            </div>
          </div>
        </main>
        {/* Right sidebar */}
        <aside className="col-span-5 rounded-lg p-2 text-white bg-gradient-to-b from-fuchsia-800 via-violet-800 to-purple-900">
          <div className="text-[10px] font-extrabold uppercase tracking-wide text-white/90">Contact</div>
          <div className="mt-1 space-y-1 text-[10px] opacity-95">
            <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> <span>City, ST</span></div>
            <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> <span>(555) 123-4567</span></div>
            <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> <span>john@email.com</span></div>
          </div>
          <div className="mt-2">
            <div className="text-[10px] font-extrabold uppercase tracking-wide text-white/90">Skills</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="h-3.5 w-10 rounded-full bg-white/10 ring-1 ring-white/20" />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );

  const renderTimelinePreview = () => (
    <div className="w-full h-full bg-white p-2 text-[11px] rounded-xl overflow-hidden">
      <div className="grid grid-cols-12 h-full gap-2">
        {/* Left sidebar */}
        <aside className="col-span-5 rounded-lg p-2 border border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Contact</div>
          <div className="mt-1 space-y-1.5 text-[10px]">
            <div className="flex items-center gap-1 text-slate-700"><Phone className="w-3 h-3 text-slate-500" /> (555) 123-4567</div>
            <div className="flex items-center gap-1 text-slate-700"><Mail className="w-3 h-3 text-slate-500" /> john@email.com</div>
            <div className="flex items-center gap-1 text-slate-700"><MapPin className="w-3 h-3 text-slate-500" /> City, ST</div>
            <div className="flex items-center gap-1 text-slate-700"><Globe className="w-3 h-3 text-slate-500" /> site.com</div>
          </div>
          <div className="my-2 h-px w-12 bg-slate-200" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Skills</div>
            <ul className="mt-1 space-y-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-700">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <span>Skill</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Right content */}
        <main className="col-span-7 rounded-lg p-2">
          {/* Name */}
          <div className="text-base font-bold tracking-tight text-slate-900">John Doe</div>
          <div className="mt-1 h-px w-full bg-slate-200" />

          {/* Profile */}
          <section className="mt-2">
            <div className="flex items-center gap-1.5">
              <UserRound className="w-4 h-4 text-slate-700" />
              <div className="text-[10px] font-extrabold uppercase tracking-wide text-slate-800">Profile</div>
            </div>
            <div className="mt-1 h-px w-full bg-slate-200" />
            <div className="mt-1.5 space-y-1">
              <div className="h-2.5 bg-slate-100 rounded" />
              <div className="h-2 bg-slate-100 rounded w-9/12" />
            </div>
          </section>

          {/* Work Experience */}
          <section className="mt-3">
            <div className="flex items-center gap-1.5">
              <BriefcaseBusiness className="w-4 h-4 text-slate-700" />
              <div className="text-[10px] font-extrabold uppercase tracking-wide text-slate-800">Work Experience</div>
            </div>
            <div className="mt-1 h-px w-full bg-slate-200" />
            <div className="mt-1.5 rounded-md border border-slate-200 bg-slate-50/60 p-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-semibold text-slate-900 leading-none">Tech Company</div>
                  <div className="text-[10px] text-slate-600 leading-none">Senior Developer</div>
                </div>
                <span className="shrink-0 text-[9px] text-slate-600 bg-slate-100 rounded-full px-1.5 py-0.5">2020 – Present</span>
              </div>
              <div className="mt-1 h-2 bg-slate-100 rounded w-10/12" />
            </div>
          </section>

          {/* Education */}
          <section className="mt-3">
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-slate-700" />
              <div className="text-[10px] font-extrabold uppercase tracking-wide text-slate-800">Education</div>
            </div>
            <div className="mt-1 h-px w-full bg-slate-200" />
            <div className="mt-1.5 rounded-md border border-slate-200 bg-slate-50/60 p-2 flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] font-semibold text-slate-900 leading-none">B.Sc. Computer Science</div>
                <div className="text-[10px] text-slate-700 leading-none">State University</div>
              </div>
              <span className="shrink-0 text-[9px] text-slate-600 bg-slate-100 rounded-full px-1.5 py-0.5">2016 – 2020</span>
            </div>
          </section>
        </main>
      </div>
    </div>
  );

  const renderCompactPreview = () => (
    <div className="w-full h-full bg-white p-2 text-[11px] rounded-xl">
      {/* Header */}
      <header>
        <div className="text-sm font-semibold tracking-tight text-slate-900">John Doe</div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> john@email.com</span>
          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> (555) 123-4567</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> City, ST</span>
          <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> site.com</span>
        </div>
      </header>

      <div className="mt-2 grid grid-cols-12 gap-2">
        {/* Left column: Summary, Experience, Projects */}
        <div className="col-span-12 md:col-span-8">
          <section className="border-t border-slate-200 pt-1.5">
            <div className="text-[10px] font-semibold text-slate-800">Summary</div>
            <div className="mt-1 space-y-1.5">
              <div className="h-2.5 bg-slate-100 rounded" />
              <div className="h-2 bg-slate-100 rounded w-10/12" />
            </div>
          </section>
          <section className="mt-2 border-t border-slate-200 pt-1.5">
            <div className="text-[10px] font-semibold text-slate-800">Experience</div>
            <div className="mt-1 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-semibold text-slate-900 leading-none">Senior Developer</div>
                  <div className="text-[10px] text-indigo-700 leading-none">Tech Company <span className="text-slate-500">• Remote</span></div>
                </div>
                <span className="shrink-0 text-[9px] text-slate-600 bg-slate-100 rounded-full px-1.5 py-0.5">2020 - Present</span>
              </div>
              <div className="space-y-1">
                <div className="h-2 bg-slate-100 rounded w-11/12" />
                <div className="h-2 bg-slate-100 rounded w-9/12" />
              </div>
            </div>
          </section>
          <section className="mt-2 border-t border-slate-200 pt-1.5">
            <div className="text-[10px] font-semibold text-slate-800">Projects</div>
            <div className="mt-1 space-y-1.5">
              <div className="h-2 bg-slate-100 rounded w-8/12" />
              <div className="h-2 bg-slate-100 rounded w-10/12" />
              <div className="flex gap-1.5 mt-0.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <span key={i} className="h-3.5 w-10 rounded-full bg-white ring-1 ring-slate-200" />
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right column: Education, Skills, Certifications */}
        <aside className="col-span-12 md:col-span-4">
          <section className="border-t md:border-t-0 md:pt-0 pt-1.5">
            <div className="text-[10px] font-semibold text-slate-800">Education</div>
            <div className="mt-1 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-semibold text-slate-900 leading-none">B.Sc. Computer Science</div>
                  <div className="text-[10px] text-slate-700 leading-none">State University</div>
                </div>
                <span className="shrink-0 text-[9px] text-slate-600 bg-slate-100 rounded-full px-1.5 py-0.5">2016 - 2020</span>
              </div>
            </div>
          </section>
          <section className="mt-2">
            <div className="text-[10px] font-semibold text-slate-800">Skills</div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="inline-flex h-3.5 items-center rounded-full bg-slate-100 px-2 text-[9.5px] text-slate-700">Skill</span>
              ))}
            </div>
          </section>
          <section className="mt-2">
            <div className="text-[10px] font-semibold text-slate-800">Certifications</div>
            <div className="mt-1 space-y-1">
              <div className="h-2 bg-slate-100 rounded w-9/12" />
              <div className="h-2 bg-slate-100 rounded w-7/12" />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );

  switch (templateId) {
    case 'modern':
      return renderModernPreview();
    case 'classic':
      return renderClassicPreview();
    case 'compact':
      return renderCompactPreview();
    case 'modern-compact':
  return renderModernCompactPreview();
    case 'punk':
  return renderPunkPreview();
    case 'timeline':
  return renderTimelinePreview();
    default:
      return renderModernPreview();
  }
};
