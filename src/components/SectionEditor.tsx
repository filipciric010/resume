
import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PersonalInfoEditor } from './editors/PersonalInfoEditor';
import { ExperienceEditor } from './editors/ExperienceEditor';
import { EducationEditor } from './editors/EducationEditor';
import { SkillsEditor } from './editors/SkillsEditor';
import { ProjectsEditor } from './editors/ProjectsEditor';
import { CertificationsEditor } from './editors/CertificationsEditor';
import { User, Briefcase, GraduationCap, Code, FolderOpen, Award } from 'lucide-react';

export const SectionEditor: React.FC = () => {
  return (
    <Card className="w-full">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-6 p-1">
          <TabsTrigger value="personal" className="flex items-center gap-1 text-xs">
            <User className="w-3 h-3" />
            <span className="hidden sm:inline">Personal</span>
          </TabsTrigger>
          <TabsTrigger value="experience" className="flex items-center gap-1 text-xs">
            <Briefcase className="w-3 h-3" />
            <span className="hidden sm:inline">Work</span>
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-1 text-xs">
            <GraduationCap className="w-3 h-3" />
            <span className="hidden sm:inline">Education</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-1 text-xs">
            <Code className="w-3 h-3" />
            <span className="hidden sm:inline">Skills</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-1 text-xs">
            <FolderOpen className="w-3 h-3" />
            <span className="hidden sm:inline">Projects</span>
          </TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-1 text-xs">
            <Award className="w-3 h-3" />
            <span className="hidden sm:inline">Certs</span>
          </TabsTrigger>
        </TabsList>
        
  <div className="p-6">
          <TabsContent value="personal" className="mt-0 h-full">
            <PersonalInfoEditor />
          </TabsContent>
          <TabsContent value="experience" className="mt-0 h-full">
            <ExperienceEditor />
          </TabsContent>
          <TabsContent value="education" className="mt-0 h-full">
            <EducationEditor />
          </TabsContent>
          <TabsContent value="skills" className="mt-0 h-full">
            <SkillsEditor />
          </TabsContent>
          <TabsContent value="projects" className="mt-0 h-full">
            <ProjectsEditor />
          </TabsContent>
          <TabsContent value="certifications" className="mt-0 h-full">
            <CertificationsEditor />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
};
