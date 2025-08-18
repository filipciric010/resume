import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ResumeData } from '@/store/useResume';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

interface ModernCompactTemplateProps {
  data: ResumeData;
}

export const ModernCompactTemplate: React.FC<ModernCompactTemplateProps> = ({ data }) => {
  const { profile, experience, education, skills, projects, certifications } = data;

  return (
    <div className="w-full h-full bg-gray-50 text-gray-900 font-inter resume-preview grid grid-cols-3 min-h-full">
      {/* Sidebar */}
  <aside className="col-span-1 bg-primary text-white p-6 flex flex-col items-start min-h-full h-full">
        <h1 className="text-2xl font-bold mb-1">{profile.fullName}</h1>
        {profile.headline && <p className="italic mb-4 text-sm">{profile.headline}</p>}

        <div className="space-y-2 text-sm">
          {profile.email && (
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> {profile.email}
            </p>
          )}
          {profile.phone && (
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> {profile.phone}
            </p>
          )}
          {profile.location && (
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {profile.location}
            </p>
          )}
          {profile.links?.map((link, index) => (
            <p key={index} className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <a href={link} className="underline">{link}</a>
            </p>
          ))}
        </div>

        {/* Skills in sidebar */}
        {skills.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill.id} variant="secondary" className="text-xs bg-white text-primary">
                  {skill.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Certifications</h2>
            <ul className="list-disc list-inside text-sm space-y-1">
              {certifications.map((cert, idx) => (
                <li key={idx}>{cert}</li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="col-span-2 p-6">
        {/* Summary */}
        {profile.summary && (
          <section className="mb-6">
            <h2 className="text-xl font-bold border-b-2 border-gray-200 pb-1 mb-3">Summary</h2>
            <p className="text-gray-700 text-sm leading-relaxed">{profile.summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-bold border-b-2 border-gray-200 pb-1 mb-3">Experience</h2>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{exp.role}</h3>
                      <p className="text-sm text-primary">{exp.company}</p>
                    </div>
                    <span className="text-xs text-gray-600">
                      {exp.start} – {exp.end || 'Present'}
                    </span>
                  </div>
                  {exp.bullets?.length > 0 && (
                    <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                      {exp.bullets.map((bullet) => (
                        <li key={bullet.id}>{bullet.text}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-bold border-b-2 border-gray-200 pb-1 mb-3">Education</h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{edu.degree}</h3>
                    <p className="text-sm text-gray-600">{edu.school}</p>
                  </div>
                  <span className="text-xs text-gray-600">
                    {edu.start} – {edu.end}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-bold border-b-2 border-gray-200 pb-1 mb-3">Projects</h2>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{proj.name}</h3>
                    {proj.url && (
                      <a
                        href={proj.url}
                        className="text-primary text-sm underline hover:text-primary/80"
                      >
                        Live Demo
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{proj.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {proj.technologies.map((tech, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs text-gray-700">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
