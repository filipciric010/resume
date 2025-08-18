import React from "react";
import { ResumeData } from "@/store/useResume";
import {
  Mail, Phone, MapPin, Globe,
  UserRound, BriefcaseBusiness, GraduationCap
} from "lucide-react";

interface TimelineTemplateProps {
  data: ResumeData;
}

/**
 * TimelineTemplate
 * - Left sidebar: Contact, Skills, (optional) Languages, (optional) Reference(s)
 * - Right content: Profile, Work Experience (timeline), Education (timeline)
 * - Minimalist, print-friendly, subtle icons, light dividers
 */
export const TimelineTemplate: React.FC<TimelineTemplateProps> = ({ data }) => {
  const { profile, experience, education, skills } = data;

  // Optional fields that may not exist on your type
  const links = profile.links ?? [];
  // Type-safe optional extras from profile
  function getStringArray(obj: unknown, key: string): string[] | undefined {
    if (obj && typeof obj === 'object' && key in (obj as Record<string, unknown>)) {
      const v = (obj as Record<string, unknown>)[key];
      if (Array.isArray(v) && v.every((x) => typeof x === 'string')) return v as string[];
    }
    return undefined;
  }
  type Reference = { name?: string; title?: string; company?: string; phone?: string; email?: string };
  function getReferences(obj: unknown, key: string): Reference[] | undefined {
    if (obj && typeof obj === 'object' && key in (obj as Record<string, unknown>)) {
      const v = (obj as Record<string, unknown>)[key];
      if (Array.isArray(v)) {
        const arr = v.filter(Boolean).map((item) => (typeof item === 'object' ? item : {})) as Reference[];
        return arr;
      }
    }
    return undefined;
  }
  const languages = getStringArray(profile, 'languages');
  const references = getReferences(profile, 'references');

  function getString(obj: unknown, key: string): string | undefined {
    if (obj && typeof obj === 'object' && key in (obj as Record<string, unknown>)) {
      const v = (obj as Record<string, unknown>)[key];
      return typeof v === 'string' ? v : undefined;
    }
    return undefined;
  }

  return (
    <div className="w-full h-full bg-white text-slate-900 font-inter resume-preview">
      <div className="grid grid-cols-12 gap-8 p-8">
        {/* LEFT SIDEBAR */}
        <aside className="col-span-12 md:col-span-4">
          {/* Name / Title header (mobile visible too) */}
          <div className="mb-8 md:hidden">
            <h1 className="text-3xl font-extrabold tracking-tight">{profile.fullName}</h1>
            {profile.headline && (
              <p className="text-sm text-slate-600">{profile.headline}</p>
            )}
            <div className="mt-3 h-px w-full bg-slate-200" />
          </div>

          {/* CONTACT */}
          <section className="mb-8">
            <h3 className="text-xs font-bold tracking-[0.18em] uppercase text-slate-700">Contact</h3>
            <div className="mt-3 space-y-2 text-sm">
              {profile.phone && (
                <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {profile.phone}</p>
              )}
              {profile.email && (
                <p className="flex items-center gap-2 break-all"><Mail className="w-4 h-4" /> {profile.email}</p>
              )}
              {profile.location && (
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {profile.location}</p>
              )}
              {links.map((link, i) => (
                <p key={i} className="flex items-center gap-2 break-all">
                  <Globe className="w-4 h-4" />
                  <a href={link} className="underline">{link}</a>
                </p>
              ))}
            </div>
            <div className="mt-4 h-px w-16 bg-slate-200" />
          </section>

          {/* SKILLS */}
          {skills.length > 0 && (
            <section className="mb-8">
              <h3 className="text-xs font-bold tracking-[0.18em] uppercase text-slate-700">Skills</h3>
              <ul className="mt-3 space-y-1 text-sm">
                {skills.map((s) => (
                  <li key={s.id} className="flex items-start gap-2">
                    <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-slate-500" />
                    <span>
                      {s.name}{s.level ? <span className="text-slate-500"> ({s.level})</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 h-px w-16 bg-slate-200" />
            </section>
          )}

          {/* LANGUAGES (optional) */}
          {languages?.length ? (
            <section className="mb-8">
              <h3 className="text-xs font-bold tracking-[0.18em] uppercase text-slate-700">Languages</h3>
              <ul className="mt-3 space-y-1 text-sm">
                {languages.map((lang, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-slate-500" />
                    <span>{lang}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 h-px w-16 bg-slate-200" />
            </section>
          ) : null}

          {/* REFERENCES (optional) */}
          {references?.length ? (
            <section className="mb-8">
              <h3 className="text-xs font-bold tracking-[0.18em] uppercase text-slate-700">Reference</h3>
              <div className="mt-3 space-y-3 text-sm">
                {references.map((r, i) => (
                  <div key={i}>
                    {r.name && <p className="font-semibold">{r.name}</p>}
                    {(r.title || r.company) && (
                      <p className="text-slate-700">{[r.title, r.company].filter(Boolean).join(" / ")}</p>
                    )}
                    {r.phone && <p className="text-slate-700">Phone: {r.phone}</p>}
                    {r.email && <p className="text-slate-700 break-all">Email: {r.email}</p>}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </aside>

        {/* RIGHT CONTENT */}
        <main className="col-span-12 md:col-span-8">
          {/* Name / Title desktop */}
          <header className="hidden md:block mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight">{profile.fullName}</h1>
            {profile.headline && (
              <p className="text-base text-slate-600">{profile.headline}</p>
            )}
            <div className="mt-4 h-px w-full bg-slate-200" />
          </header>

          {/* PROFILE */}
          {profile.summary && (
            <section className="mb-8">
              <div className="flex items-center gap-2">
                <UserRound className="w-5 h-5 text-slate-700" />
                <h2 className="text-lg font-bold tracking-wide uppercase text-slate-800">
                  Profile
                </h2>
              </div>
              <div className="mt-2 h-px w-full bg-slate-200" />
              <p className="mt-3 text-[0.975rem] leading-relaxed text-slate-800">
                {profile.summary}
              </p>
            </section>
          )}

          {/* WORK EXPERIENCE (Timeline) */}
          {experience.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center gap-2">
                <BriefcaseBusiness className="w-5 h-5 text-slate-700" />
                <h2 className="text-lg font-bold tracking-wide uppercase text-slate-800">
                  Work Experience
                </h2>
              </div>
              <div className="mt-2 h-px w-full bg-slate-200" />

        <div className="relative mt-5 pl-6">
                {/* Vertical line */}
                <div className="absolute left-2 top-0 bottom-0 w-px bg-slate-300" />
                <div className="space-y-6">
                  {experience.map((exp) => (
                    <div key={exp.id} className="relative">
                      <div className="flex items-baseline justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-[1.05rem]">{exp.company}</h3>
                          <p className="text-sm text-slate-700">
                            {exp.role}
                            {(() => { const loc = getString(exp, 'location'); return loc ? ` • ${loc}` : ""; })()}
                          </p>
                        </div>
                        <span className="text-xs text-slate-600 whitespace-nowrap">
                          {exp.start} – {exp.end || "Present"}
                        </span>
                      </div>
                      {exp.bullets?.length ? (
                        <ul className="mt-2 list-disc list-inside text-[0.95rem] text-slate-800 space-y-1">
                          {exp.bullets.map((b) => (
                            <li key={b.id}>{b.text}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* EDUCATION (Timeline) */}
          {education.length > 0 && (
            <section>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-slate-700" />
                <h2 className="text-lg font-bold tracking-wide uppercase text-slate-800">
                  Education
                </h2>
              </div>
              <div className="mt-2 h-px w-full bg-slate-200" />

        <div className="relative mt-5 pl-6">
                <div className="absolute left-2 top-0 bottom-0 w-px bg-slate-300" />
                <div className="space-y-6">
                  {education.map((edu) => (
                    <div key={edu.id} className="relative">
                      <div className="flex items-baseline justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-[1.05rem]">{edu.degree}</h3>
                          <p className="text-sm text-slate-700">{edu.school}</p>
                        </div>
                        {(edu.start || edu.end) && (
                          <span className="text-xs text-slate-600 whitespace-nowrap">
                            {edu.start} – {edu.end}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};
