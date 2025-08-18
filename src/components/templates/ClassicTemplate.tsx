import React from 'react';
import { ResumeData } from '@/store/useResume';
import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';

interface ClassicTemplateProps {
  data: ResumeData;
}

export const ClassicTemplate: React.FC<ClassicTemplateProps> = ({ data }) => {
  const { profile, experience, education, skills, projects, certifications } = data;

  const links = profile.links ?? [];
  const firstFourLinks = links.slice(0, 2);
  const linkedinUrl = links.find((l) => /linkedin\.com/i.test(l));

  const safeHostname = (url: string) => {
    try { return new URL(url).hostname; } catch { return url; }
  };

  return (
    <div className="w-full h-full bg-white text-slate-900 font-inter resume-preview">
      <div className="p-6 sm:p-8">
        {/* Name */}
        <header className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">{profile.fullName || 'John Doe'}</h1>
          {/* Top inline contact row */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
            {profile.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {profile.email}
              </span>
            )}
            {profile.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {profile.phone}
              </span>
            )}
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {profile.location}
              </span>
            )}
            {firstFourLinks.map((l, i) => (
              <span key={i} className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                <a href={l} className="hover:underline">{l}</a>
              </span>
            ))}
            {linkedinUrl && (
              <span className="flex items-center gap-1">
                <Linkedin className="w-3.5 h-3.5" />
                <a href={linkedinUrl} className="hover:underline">{linkedinUrl}</a>
              </span>
            )}
          </div>
        </header>

        {/* ----- Summary ----- */}
        {profile.summary && (
          <section className="mt-5 border-t border-slate-200 pt-3">
            <h2 className="text-[13px] font-semibold text-slate-800">Summary</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-700">{profile.summary}</p>
          </section>
        )}

        {/* ----- Experience ----- */}
        {experience.length > 0 && (
          <section className="mt-6 border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-slate-800">Professional Experience</h2>
            </div>

            <div className="mt-3 space-y-6">
              {experience.map((exp) => (
                <div key={exp.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  {/* Title row with date pill on the right */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[12.5px] font-semibold text-slate-900">{exp.role}</p>
                      <span className="text-[12px] text-indigo-700">{exp.company}</span>
                    </div>
                    <span className="shrink-0 text-[11px] text-slate-600 bg-slate-100 rounded-full px-2 py-1">
                      {exp.start} {exp.end ? `- ${exp.end}` : ' - Present'}
                    </span>
                  </div>

                  {/* Bullets */}
                  {exp.bullets?.length ? (
                    <ul className="mt-2 list-disc list-inside space-y-1.5">
                      {exp.bullets.map((b) => (
                        <li key={b.id} className="text-[12px] text-slate-700 leading-relaxed">{b.text}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ----- Education ----- */}
        {education.length > 0 && (
          <section className="mt-6 border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-slate-800">Education</h2>
            </div>

            <div className="mt-3 space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[12.5px] font-semibold text-slate-900">{edu.degree}</p>
                    <p className="text-[12px] text-slate-700">{edu.school}</p>
                  </div>
                  {(edu.start || edu.end) && (
                    <span className="shrink-0 text-[11px] text-slate-600 bg-slate-100 rounded-full px-2 py-1">
                      {edu.start} {edu.end ? `- ${edu.end}` : ''}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ----- Skills ----- */}
        {skills.length > 0 && (
          <section className="mt-6 border-t border-slate-200 pt-3">
            <h2 className="text-[13px] font-semibold text-slate-800">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s.id} className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                  {s.name}{s.level ? ` (${s.level})` : ''}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ----- Projects ----- */}
        {projects.length > 0 && (
          <section className="mt-6 border-t border-slate-200 pt-3">
            <h2 className="text-[13px] font-semibold text-slate-800">Projects</h2>
            <div className="mt-3 space-y-5">
              {projects.map((p) => (
                <div key={p.id} className="border border-slate-100 rounded-lg p-3 bg-slate-50/60">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-[12.5px] font-semibold text-slate-900">{p.name}</h3>
                    {p.url && (
                      <a href={p.url} className="text-[11.5px] text-indigo-700 hover:underline">{safeHostname(p.url)}</a>
                    )}
                  </div>
                  {p.description && (
                    <p className="mt-1.5 text-[12px] text-slate-700 leading-relaxed">{p.description}</p>
                  )}
                  {p.technologies?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {p.technologies.map((t, i) => (
                        <span key={i} className="inline-flex items-center rounded-full bg-white ring-1 ring-slate-200 px-2.5 py-1 text-[11px] text-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ----- Certifications ----- */}
        {certifications?.length ? (
          <section className="mt-6 border-t border-slate-200 pt-3">
            <h2 className="text-[13px] font-semibold text-slate-800">Certifications</h2>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {certifications.map((c, i) => (
                <p key={i} className="text-[12px] text-slate-700">{c}</p>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};
