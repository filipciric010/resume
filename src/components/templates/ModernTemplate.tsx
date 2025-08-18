import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ResumeData } from '@/store/useResume';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

interface ModernTemplateProps {
  data: ResumeData;
}

export const ModernTemplate: React.FC<ModernTemplateProps> = ({ data }) => {
  const { profile, experience, education, skills, projects, certifications } = data;

  return (
    <div className="w-full h-full bg-white text-gray-900 font-inter resume-preview flex flex-col m-0 p-0">
      {/* Header with gradient background - full width */}
  <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-4 flex-shrink-0 mt-0">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">{profile.fullName}</h1>
          {profile.headline && (
            <p className="text-base opacity-90 mb-3">{profile.headline}</p>
          )}
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {profile.email && (
              <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                <Mail className="w-3 h-3" />
                {profile.email}
              </span>
            )}
            {profile.phone && (
              <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                <Phone className="w-3 h-3" />
                {profile.phone}
              </span>
            )}
            {profile.location && (
              <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                <MapPin className="w-3 h-3" />
                {profile.location}
              </span>
            )}
            {profile.links?.map((link, index) => (
              <span key={index} className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                <Globe className="w-3 h-3" />
                <a href={link} className="hover:underline">{link}</a>
              </span>
            ))}
          </div>
        </div>
      </header>

  <div className="px-5 py-4 space-y-4 flex-1 min-h-0 h-full mt-0">
        {/* Summary */}
        {profile.summary && (
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2 border-l-4 border-purple-500 pl-4">
              Summary
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm">
              {profile.summary}
            </p>
          </section>
        )}

        {/* Experience - same design, smaller text */}
        {experience.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 border-l-4 border-purple-500 pl-4">
              Professional Experience
            </h2>
      <div className="space-y-3">
              {experience.map((exp) => (
                <div key={exp.id} className="pl-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{exp.role}</h3>
                      <h4 className="text-sm text-purple-600 font-medium">{exp.company}</h4>
                    </div>
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      {exp.start} - {exp.end || 'Present'}
                    </span>
                  </div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2 text-sm">
                      {(exp.bullets || []).map((bullet) => (
                        <li key={bullet.id} className="leading-relaxed">
                          {bullet.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education - same design, smaller text */}
        {education.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 border-l-4 border-purple-500 pl-4">
              Education
            </h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="pl-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {edu.degree}
                      </h3>
                      <h4 className="text-purple-600 font-medium text-sm">{edu.school}</h4>
                    </div>
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      {edu.start} - {edu.end}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills - same design, smaller text */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 border-l-4 border-purple-500 pl-4">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge
                  key={skill.id}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 text-sm"
                >
                  {skill.name} {skill.level && `(${skill.level})`}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Projects - same design, smaller text */}
        {projects && projects.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 border-l-4 border-purple-500 pl-4">
              Projects
            </h2>
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-semibold text-gray-900">{project.name}</h3>
                    <div className="flex gap-2 text-sm">
                      {project.url && <a href={project.url} className="text-purple-600 hover:underline">Demo</a>}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2 leading-relaxed text-sm">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <Badge key={index} variant="outline" className="text-sm border-purple-300 text-purple-700">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications - same design, smaller text */}
        {certifications && certifications.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3 border-l-4 border-purple-500 pl-4">
              Certifications
            </h2>
            <div className="space-y-2">
              {certifications.map((cert, index) => (
                <div key={index} className="pl-0">
                  <p className="text-gray-700 text-sm">{cert}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
