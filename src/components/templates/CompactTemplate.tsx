import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ResumeData } from '@/store/useResume';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

interface CompactTemplateProps {
  data: ResumeData;
}

export const CompactTemplate: React.FC<CompactTemplateProps> = ({ data }) => {
  const { profile, experience, education, skills, projects, certifications } = data;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white text-gray-900 font-inter p-6 text-sm resume-preview">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{profile.fullName}</h1>
        <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-2">
          {profile.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {profile.email}
            </span>
          )}
          {profile.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {profile.phone}
            </span>
          )}
          {profile.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {profile.location}
            </span>
          )}
          {profile.links?.map((link, index) => (
            <span key={index} className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <a href={link} className="hover:underline">{link}</a>
            </span>
          ))}
        </div>
        {profile.headline && (
          <p className="text-sm text-gray-700 italic">{profile.headline}</p>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Summary */}
          {profile.summary && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
                Summary
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm">
                {profile.summary}
              </p>
            </section>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
                Experience
              </h2>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900">{exp.role}</h3>
                        <h4 className="text-primary font-medium">{exp.company}</h4>
                      </div>
                      <span className="text-xs text-gray-600 whitespace-nowrap">
                        {exp.start} - {exp.end || 'Present'}
                      </span>
                    </div>
                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-xs ml-2">
                        {(exp.bullets || []).map((bullet) => (
                          <li key={bullet.id}>{bullet.text}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
                Projects
              </h2>
              <div className="space-y-3">
                {projects.map((project) => (
                  <div key={project.id}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      {project.url && (
                        <a href={project.url} className="text-xs text-primary hover:underline">
                          Demo
                        </a>
                      )}
                    </div>
                    <p className="text-gray-700 text-xs mb-2">{project.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, index) => (
                        <Badge key={index} variant="outline" className="text-xs px-1 py-0 text-gray-700">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Education */}
          {education.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
                Education
              </h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <h3 className="font-semibold text-gray-900 text-sm">{edu.degree}</h3>
                    <h4 className="text-primary text-xs">{edu.school}</h4>
                    <span className="text-xs text-gray-600">
                      {edu.start} - {edu.end}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
                Skills
              </h2>
              <div className="flex flex-wrap gap-1">
                {skills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="secondary"
                    className="text-xs px-2 py-1"
                  >
                    {skill.name}
                    {skill.level && ` (${skill.level})`}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
                Certifications
              </h2>
              <div className="space-y-2">
                {certifications.map((cert, index) => (
                  <div key={index}>
                    <p className="text-gray-700 text-xs">{cert}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
