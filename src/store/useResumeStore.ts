
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    github?: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
}

export interface ResumeStore {
  resumeData: ResumeData;
  currentTemplate: 'classic' | 'modern' | 'compact';
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  addExperience: (experience: Experience) => void;
  updateExperience: (id: string, updates: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  addEducation: (education: Education) => void;
  updateEducation: (id: string, updates: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  addSkill: (skill: Skill) => void;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  removeSkill: (id: string) => void;
  setTemplate: (template: 'classic' | 'modern' | 'compact') => void;
  resetResume: () => void;
}

const sampleData: ResumeData = {
  personalInfo: {
    fullName: 'Alexandra Chen',
    email: 'alexandra.chen@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    website: 'https://alexandrachen.dev',
    linkedin: 'linkedin.com/in/alexandrachen',
    github: 'github.com/alexandrachen',
    summary: 'Experienced full-stack developer with 5+ years building scalable web applications. Passionate about creating user-centric solutions and leading cross-functional teams to deliver high-quality software products.'
  },
  experience: [
    {
      id: '1',
      company: 'TechCorp Inc.',
      position: 'Senior Full Stack Developer',
      startDate: '2022-03',
      endDate: '',
      current: true,
      description: 'Lead development of enterprise web applications serving 100k+ users',
      achievements: [
        'Reduced page load times by 40% through performance optimization',
        'Led a team of 4 developers in migrating legacy systems to modern architecture',
        'Implemented CI/CD pipelines reducing deployment time by 60%'
      ]
    },
    {
      id: '2',
      company: 'StartupXYZ',
      position: 'Full Stack Developer',
      startDate: '2020-01',
      endDate: '2022-02',
      current: false,
      description: 'Built and maintained multiple client-facing applications',
      achievements: [
        'Developed RESTful APIs handling 10M+ requests per month',
        'Created responsive web applications using React and Node.js',
        'Collaborated with design team to implement pixel-perfect UI components'
      ]
    }
  ],
  education: [
    {
      id: '1',
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2016-09',
      endDate: '2020-05',
      gpa: '3.8'
    }
  ],
  skills: [
    { id: '1', name: 'JavaScript', level: 'Expert', category: 'Programming' },
    { id: '2', name: 'React', level: 'Expert', category: 'Frontend' },
    { id: '3', name: 'Node.js', level: 'Advanced', category: 'Backend' },
    { id: '4', name: 'TypeScript', level: 'Advanced', category: 'Programming' },
    { id: '5', name: 'Python', level: 'Intermediate', category: 'Programming' },
    { id: '6', name: 'AWS', level: 'Intermediate', category: 'Cloud' }
  ],
  projects: [
    {
      id: '1',
      name: 'E-commerce Platform',
      description: 'Built a full-stack e-commerce solution with payment integration and admin dashboard',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      url: 'https://demo-ecommerce.com',
      github: 'https://github.com/alexandrachen/ecommerce'
    }
  ],
  certifications: [
    {
      id: '1',
      name: 'AWS Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2023-08',
      url: 'https://aws.amazon.com/certification/'
    }
  ]
};

const emptyData: ResumeData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    summary: ''
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: []
};

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      resumeData: emptyData,
      currentTemplate: 'modern',
      
      updatePersonalInfo: (info) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            personalInfo: { ...state.resumeData.personalInfo, ...info }
          }
        })),
      
      addExperience: (experience) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            experience: [...state.resumeData.experience, experience]
          }
        })),
      
      updateExperience: (id, updates) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            experience: state.resumeData.experience.map(exp =>
              exp.id === id ? { ...exp, ...updates } : exp
            )
          }
        })),
      
      removeExperience: (id) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            experience: state.resumeData.experience.filter(exp => exp.id !== id)
          }
        })),
      
      addEducation: (education) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            education: [...state.resumeData.education, education]
          }
        })),
      
      updateEducation: (id, updates) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            education: state.resumeData.education.map(edu =>
              edu.id === id ? { ...edu, ...updates } : edu
            )
          }
        })),
      
      removeEducation: (id) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            education: state.resumeData.education.filter(edu => edu.id !== id)
          }
        })),
      
      addSkill: (skill) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            skills: [...state.resumeData.skills, skill]
          }
        })),
      
      updateSkill: (id, updates) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            skills: state.resumeData.skills.map(skill =>
              skill.id === id ? { ...skill, ...updates } : skill
            )
          }
        })),
      
      removeSkill: (id) =>
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            skills: state.resumeData.skills.filter(skill => skill.id !== id)
          }
        })),
      
      setTemplate: (template) => set((state) => {
        // Create clean starter data when selecting a template
        const cleanData: ResumeData = {
          personalInfo: {
            fullName: 'Your Name',
            email: 'your.email@example.com',
            phone: '+1 (555) 123-4567',
            location: 'Your City, State',
            website: 'https://yourwebsite.com',
            linkedin: 'linkedin.com/in/yourname',
            github: 'github.com/yourname',
            summary: 'Write a compelling professional summary that highlights your key skills and experience.'
          },
          experience: [
            {
              id: '1',
              company: 'Your Company',
              position: 'Your Job Title',
              startDate: '2020-01',
              endDate: '',
              current: true,
              description: 'Brief description of your role and responsibilities',
              achievements: [
                'Add your key achievements and impact here',
                'Use specific numbers and metrics when possible',
                'Focus on results and value you delivered'
              ]
            }
          ],
          education: [
            {
              id: '1',
              institution: 'Your University',
              degree: 'Your Degree',
              field: 'Your Major',
              startDate: '2016-09',
              endDate: '2020-05',
              gpa: ''
            }
          ],
          skills: [
            {
              id: '1',
              name: 'Your Skill 1',
              category: 'Technical',
              level: 'Advanced'
            },
            {
              id: '2',
              name: 'Your Skill 2',
              category: 'Technical',
              level: 'Intermediate'
            }
          ],
          projects: [
            {
              id: '1',
              name: 'Your Project Name',
              description: 'Brief description of your project and its impact',
              technologies: ['Technology 1', 'Technology 2'],
              url: 'https://github.com/yourname/project'
            }
          ],
          certifications: [
            {
              id: '1',
              name: 'Your Certification',
              issuer: 'Issuing Organization',
              date: '2023-01',
              url: 'https://certification-url.com'
            }
          ]
        };
        
        return {
          currentTemplate: template,
          resumeData: cleanData
        };
      }),
      
      resetResume: () => set({ resumeData: sampleData })
    }),
    {
      name: 'resume-storage-empty'
    }
  )
);
