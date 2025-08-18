import React from "react";
import { Badge } from "@/components/ui/badge";
import { ResumeData } from "@/store/useResume";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

interface PunkTemplateProps {
  data: ResumeData;
}

function getString(obj: unknown, key: string): string | undefined {
  if (obj && typeof obj === 'object' && key in (obj as Record<string, unknown>)) {
    const v = (obj as Record<string, unknown>)[key];
    return typeof v === 'string' ? v : undefined;
  }
  return undefined;
}

function getStringArray(obj: unknown, key: string): string[] {
  if (obj && typeof obj === 'object' && key in (obj as Record<string, unknown>)) {
    const v = (obj as Record<string, unknown>)[key];
    if (Array.isArray(v) && v.every((x) => typeof x === 'string')) return v as string[];
  }
  return [];
}

export const PunkTemplate: React.FC<PunkTemplateProps> = ({ data }) => {
  const { profile, experience, education, skills, projects, certifications } = data;

  const links = profile.links ?? [];
  const affiliations: string[] = getStringArray(profile, 'affiliations');

  return (
    <div className="w-full h-full font-inter text-gray-900 resume-preview bg-white print:bg-white">
  <div className="grid grid-cols-12 min-h-full">
        {/* MAIN (left) */}
        <div className="col-span-8 md:col-span-8 p-8">
          {/* Nameplate */}
          <header className="mb-6 border-b-4 border-fuchsia-600/80">
            <h1 className="text-4xl font-black uppercase tracking-tight text-fuchsia-700 leading-none">
              {profile.fullName || "Your Name"}
            </h1>
            {profile.headline && (
              <p className="mt-2 text-sm text-gray-700">{profile.headline}</p>
            )}
          </header>

          {/* Summary */}
          {profile.summary && (
            <section className="mb-6">
              <h2 className="text-sm font-extrabold tracking-wider uppercase text-fuchsia-700">
                Professional Summary
              </h2>
              <div className="mt-2 h-1 w-16 bg-gradient-to-r from-fuchsia-600 to-violet-700" />
              <p className="mt-3 text-[0.925rem] leading-relaxed text-gray-800">
                {profile.summary}
              </p>
            </section>
          )}

          {/* Work History */}
          {experience.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-extrabold tracking-wider uppercase text-fuchsia-700">
                Work History
              </h2>
              <div className="mt-2 h-1 w-16 bg-gradient-to-r from-fuchsia-600 to-violet-700" />

              <div className="mt-4 space-y-5">
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-[1.025rem] text-gray-900">
                          {exp.role}
                        </h3>
                        <p className="text-sm text-gray-700">
                          {exp.company}
                          {(() => { const loc = getString(exp, 'location'); return loc ? `, ${loc}` : ""; })()}
                        </p>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 rounded bg-fuchsia-50 text-fuchsia-700">
                        {exp.start} – {exp.end || "Present"}
                      </span>
                    </div>

                    {exp.bullets?.length ? (
                      <ul className="mt-2 list-disc list-inside text-[0.925rem] text-gray-800 space-y-1">
                        {exp.bullets.map((b) => (
                          <li key={b.id}>{b.text}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects (optional) */}
          {projects && projects.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-extrabold tracking-wider uppercase text-fuchsia-700">
                Projects
              </h2>
              <div className="mt-2 h-1 w-16 bg-gradient-to-r from-fuchsia-600 to-violet-700" />
              <div className="mt-4 space-y-4">
                {projects.map((proj) => (
                  <div key={proj.id}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{proj.name}</h3>
                      {proj.url && (
                        <a
                          href={proj.url}
                          className="text-sm underline text-fuchsia-700 hover:text-fuchsia-600"
                        >
                          Live / Repo
                        </a>
                      )}
                    </div>
                    {proj.description && (
                      <p className="mt-1 text-[0.925rem] text-gray-800">
                        {proj.description}
                      </p>
                    )}
                    {proj.technologies?.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {proj.technologies.map((t, i) => (
                          <Badge key={i} variant="outline" className="text-xs text-gray-800">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* SIDEBAR (right) */}
  <aside className="col-span-4 md:col-span-4 p-8 text-white bg-gradient-to-b from-fuchsia-700 via-violet-700 to-purple-800 min-h-full h-full">
          {/* Contact */}
          <section className="mb-8">
            <h3 className="text-sm font-extrabold tracking-wider uppercase text-white/90">
              Contact
            </h3>
            <div className="mt-3 space-y-2 text-sm">
              {profile.location && (
                <p className="flex items-center gap-2 text-white/90">
                  <MapPin className="w-4 h-4 text-white" />
                  {profile.location}
                </p>
              )}
              {profile.phone && (
                <p className="flex items-center gap-2 text-white/90">
                  <Phone className="w-4 h-4 text-white" />
                  {profile.phone}
                </p>
              )}
              {profile.email && (
                <p className="flex items-center gap-2 text-white/90 break-all">
                  <Mail className="w-4 h-4 text-white" />
                  {profile.email}
                </p>
              )}
              {links.map((link, i) => (
                <p key={i} className="flex items-center gap-2 text-white/90 break-all">
                  <Globe className="w-4 h-4 text-white" />
                  <a className="underline decoration-white/60 hover:decoration-white" href={link}>
                    {link}
                  </a>
                </p>
              ))}
            </div>
          </section>

          {/* Skills */}
          {skills.length > 0 && (
            <section className="mb-8">
              <h3 className="text-sm font-extrabold tracking-wider uppercase text-white/90">
                Skills
              </h3>
              <ul className="mt-3 space-y-1 text-sm">
                {skills.map((s) => (
                  <li key={s.id} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-fuchsia-300" />
                    <span>
                      {s.name}
                      {s.level ? (
                        <span className="opacity-80">{` (${s.level})`}</span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <section className="mb-8">
              <h3 className="text-sm font-extrabold tracking-wider uppercase text-white/90">
                Education
              </h3>
              <div className="mt-3 space-y-3 text-sm">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <p className="font-semibold">{edu.degree}</p>
                    <p className="opacity-90">{edu.school}</p>
                    {(edu.start || edu.end) && (
                      <p className="text-white/80 text-xs mt-0.5">
                        {edu.start} – {edu.end}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications (optional) */}
          {certifications?.length ? (
            <section className="mb-8">
              <h3 className="text-sm font-extrabold tracking-wider uppercase text-white/90">
                Certifications
              </h3>
              <ul className="mt-3 space-y-1 text-sm">
                {certifications.map((c, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-fuchsia-300" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Affiliations (optional) */}
          {affiliations.length > 0 ? (
            <section className="mb-2">
              <h3 className="text-sm font-extrabold tracking-wider uppercase text-white/90">
                Affiliations
              </h3>
              <ul className="mt-3 space-y-1 text-sm">
                {affiliations.map((a, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-fuchsia-300" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
};
