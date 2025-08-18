
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Bullet = { 
  id: string; 
  text: string; 
};

export type Experience = { 
  id: string; 
  role: string; 
  company: string; 
  start: string; 
  end?: string; 
  bullets: Bullet[]; 
};

export type Education = { 
  id: string; 
  school: string; 
  degree: string; 
  start: string; 
  end?: string; 
};

export type Skill = { 
  id: string; 
  name: string; 
  level?: 'basic' | 'intermediate' | 'advanced' | 'expert'; 
};

export type ResumeData = {
  profile: { 
    fullName: string; 
    email: string; 
    phone?: string; 
    location?: string; 
    headline?: string; 
    links?: string[]; 
    summary?: string;
  };
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  certifications?: string[];
  projects?: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  templateKey: 'classic' | 'modern' | 'compact' | 'modern-compact' | 'punk' | 'timeline';
};

export interface ResumeStore {
  data: ResumeData;
  isReadOnly: boolean;
  
  // Profile actions
  setProfile: (profile: Partial<ResumeData['profile']>) => void;
  
  // Experience actions
  addExperience: (experience: Omit<Experience, 'id'>) => void;
  updateExperience: (id: string, updates: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  
  // Bullet actions
  addBullet: (experienceId: string, bullet: Omit<Bullet, 'id'>) => void;
  updateBullet: (experienceId: string, bulletId: string, text: string) => void;
  removeBullet: (experienceId: string, bulletId: string) => void;
  
  // Education actions
  addEducation: (education: Omit<Education, 'id'>) => void;
  updateEducation: (id: string, updates: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  
  // Skills actions
  addSkill: (skill: Omit<Skill, 'id'>) => void;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  removeSkill: (id: string) => void;
  
  // Projects actions
  addProject: (project: Omit<ResumeData['projects'][0], 'id'>) => void;
  updateProject: (id: string, updates: Partial<ResumeData['projects'][0]>) => void;
  removeProject: (id: string) => void;
  
  // Certification actions
  addCertification: (certification: string) => void;
  updateCertification: (index: number, certification: string) => void;
  removeCertification: (index: number) => void;
  
  // Template actions
  setTemplateKey: (templateKey: ResumeData['templateKey']) => void;
  
  // Data management
  importSnapshot: (data: ResumeData) => void;
  exportSnapshot: () => ResumeData;
  resetToClean: () => void;
  resetToDemo: () => void;
  setReadOnly: (readOnly: boolean) => void;
}

const cleanData: ResumeData = {
  templateKey: 'modern',
  profile: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    headline: '',
    links: [],
    summary: ''
  },
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  projects: []
};

const demoData: ResumeData = {
  profile: {
    fullName: 'Alexandra Chen',
    email: 'alexandra.chen@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    headline: 'Senior Full Stack Developer',
    links: ['https://alexandrachen.dev', 'linkedin.com/in/alexandrachen', 'github.com/alexandrachen'],
    summary: 'Experienced full-stack developer with 5+ years building scalable web applications. Passionate about creating user-centric solutions and leading cross-functional teams to deliver high-quality software products.'
  },
  experience: [
    {
      id: '1',
      role: 'Senior Full Stack Developer',
      company: 'TechCorp Inc.',
      start: '2022-03',
      bullets: [
        { id: '1-1', text: 'Reduced page load times by 40% through performance optimization and code splitting' },
        { id: '1-2', text: 'Led a team of 4 developers in migrating legacy systems to modern React architecture' },
        { id: '1-3', text: 'Implemented CI/CD pipelines reducing deployment time by 60% and improving reliability' },
        { id: '1-4', text: 'Architected microservices handling 10M+ API requests per month with 99.9% uptime' },
      ]
    },
    {
      id: '2',
      role: 'Full Stack Developer',
      company: 'StartupXYZ',
      start: '2020-01',
      end: '2022-02',
      bullets: [
        { id: '2-1', text: 'Developed RESTful APIs handling 10M+ requests per month using Node.js and PostgreSQL' },
        { id: '2-2', text: 'Created responsive web applications using React, reducing mobile bounce rate by 25%' },
        { id: '2-3', text: 'Collaborated with design team to implement pixel-perfect UI components and design system' },
        { id: '2-4', text: 'Optimized database queries reducing average response time from 800ms to 120ms' },
      ]
    },
    {
      id: '3',
      role: 'Frontend Developer',
      company: 'Digital Agency Pro',
      start: '2018-06',
      end: '2019-12',
      bullets: [
        { id: '3-1', text: 'Built 15+ client websites using modern JavaScript frameworks, increasing client satisfaction by 30%' },
        { id: '3-2', text: 'Implemented responsive designs achieving 98% cross-browser compatibility' },
        { id: '3-3', text: 'Reduced bundle size by 45% through code optimization and lazy loading techniques' },
      ]
    }
  ],
  education: [
    {
      id: '1',
      school: 'University of California, Berkeley',
      degree: 'Bachelor of Science in Computer Science',
      start: '2016-09',
      end: '2020-05'
    },
    {
      id: '2',
      school: 'Stanford Online',
      degree: 'Certificate in Machine Learning',
      start: '2021-01',
      end: '2021-06'
    }
  ],
  skills: [
    { id: '1', name: 'JavaScript', level: 'expert' },
    { id: '2', name: 'React', level: 'expert' },
    { id: '3', name: 'Node.js', level: 'advanced' },
    { id: '4', name: 'TypeScript', level: 'advanced' },
    { id: '5', name: 'Python', level: 'intermediate' },
    { id: '6', name: 'AWS', level: 'intermediate' },
    { id: '7', name: 'Docker', level: 'intermediate' },
    { id: '8', name: 'PostgreSQL', level: 'advanced' },
    { id: '9', name: 'GraphQL', level: 'intermediate' },
    { id: '10', name: 'Redis', level: 'basic' }
  ],
  certifications: [
    'AWS Solutions Architect Associate',
    'Google Cloud Professional Developer',
    'Certified Kubernetes Administrator'
  ],
  projects: [
    {
      id: '1',
      name: 'E-commerce Platform',
      description: 'Built a full-stack e-commerce solution with payment integration, admin dashboard, and real-time inventory management serving 50K+ users',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Redis'],
      url: 'https://demo-ecommerce.com'
    },
    {
      id: '2',
      name: 'Task Management SaaS',
      description: 'Developed a collaborative project management tool with real-time updates, team permissions, and advanced reporting features',
      technologies: ['Vue.js', 'Express', 'PostgreSQL', 'Socket.io', 'Docker'],
      url: 'https://taskmanager-pro.com'
    },
    {
      id: '3',
      name: 'AI Content Generator',
      description: 'Created an AI-powered content generation platform using OpenAI API with custom fine-tuning for marketing copy',
      technologies: ['Next.js', 'OpenAI API', 'Supabase', 'Tailwind CSS'],
      url: 'https://ai-content-gen.com'
    }
  ],
  templateKey: 'modern'
};

let saveTimeout: NodeJS.Timeout;

export const useResume = create<ResumeStore>()(
  persist(
    (set, get) => ({
      data: cleanData,
      isReadOnly: false,
      
      setProfile: (profile) => {
        set((state) => ({
          data: {
            ...state.data,
            profile: { ...state.data.profile, ...profile }
          }
        }));
        debouncedSave();
      },
      
      addExperience: (experience) => {
        set((state) => ({
          data: {
            ...state.data,
            experience: [...state.data.experience, { 
              ...experience, 
              id: generateId(),
              bullets: experience.bullets || []
            }]
          }
        }));
        debouncedSave();
      },
      
      updateExperience: (id, updates) => {
        set((state) => ({
          data: {
            ...state.data,
            experience: state.data.experience.map(exp =>
              exp.id === id ? { ...exp, ...updates } : exp
            )
          }
        }));
        debouncedSave();
      },
      
      removeExperience: (id) => {
        set((state) => ({
          data: {
            ...state.data,
            experience: state.data.experience.filter(exp => exp.id !== id)
          }
        }));
        debouncedSave();
      },
      
      addBullet: (experienceId, bullet) => {
        set((state) => ({
          data: {
            ...state.data,
            experience: state.data.experience.map(exp =>
              exp.id === experienceId
                ? { ...exp, bullets: [...exp.bullets, { ...bullet, id: generateId() }] }
                : exp
            )
          }
        }));
        debouncedSave();
      },
      
      updateBullet: (experienceId, bulletId, text) => {
        set((state) => ({
          data: {
            ...state.data,
            experience: state.data.experience.map(exp =>
              exp.id === experienceId
                ? {
                    ...exp,
                    bullets: exp.bullets.map(bullet =>
                      bullet.id === bulletId ? { ...bullet, text } : bullet
                    )
                  }
                : exp
            )
          }
        }));
        debouncedSave();
      },
      
      removeBullet: (experienceId, bulletId) => {
        set((state) => ({
          data: {
            ...state.data,
            experience: state.data.experience.map(exp =>
              exp.id === experienceId
                ? { ...exp, bullets: exp.bullets.filter(bullet => bullet.id !== bulletId) }
                : exp
            )
          }
        }));
        debouncedSave();
      },
      
      addEducation: (education) => {
        set((state) => ({
          data: {
            ...state.data,
            education: [...state.data.education, { ...education, id: generateId() }]
          }
        }));
        debouncedSave();
      },
      
      updateEducation: (id, updates) => {
        set((state) => ({
          data: {
            ...state.data,
            education: state.data.education.map(edu =>
              edu.id === id ? { ...edu, ...updates } : edu
            )
          }
        }));
        debouncedSave();
      },
      
      removeEducation: (id) => {
        set((state) => ({
          data: {
            ...state.data,
            education: state.data.education.filter(edu => edu.id !== id)
          }
        }));
        debouncedSave();
      },
      
      addSkill: (skill) => {
        set((state) => ({
          data: {
            ...state.data,
            skills: [...state.data.skills, { ...skill, id: generateId() }]
          }
        }));
        debouncedSave();
      },
      
      updateSkill: (id, updates) => {
        set((state) => ({
          data: {
            ...state.data,
            skills: state.data.skills.map(skill =>
              skill.id === id ? { ...skill, ...updates } : skill
            )
          }
        }));
        debouncedSave();
      },
      
      removeSkill: (id) => {
        set((state) => ({
          data: {
            ...state.data,
            skills: state.data.skills.filter(skill => skill.id !== id)
          }
        }));
        debouncedSave();
      },
      
      addProject: (project) => {
        set((state) => ({
          data: {
            ...state.data,
            projects: [...(state.data.projects || []), { ...project, id: generateId() }]
          }
        }));
        debouncedSave();
      },
      
      updateProject: (id, updates) => {
        set((state) => ({
          data: {
            ...state.data,
            projects: (state.data.projects || []).map(project =>
              project.id === id ? { ...project, ...updates } : project
            )
          }
        }));
        debouncedSave();
      },
      
      removeProject: (id) => {
        set((state) => ({
          data: {
            ...state.data,
            projects: (state.data.projects || []).filter(project => project.id !== id)
          }
        }));
        debouncedSave();
      },
      
      addCertification: (certification) => {
        set((state) => ({
          data: {
            ...state.data,
            certifications: [...(state.data.certifications || []), certification]
          }
        }));
        debouncedSave();
      },
      
      updateCertification: (index, certification) => {
        set((state) => ({
          data: {
            ...state.data,
            certifications: (state.data.certifications || []).map((cert, i) =>
              i === index ? certification : cert
            )
          }
        }));
        debouncedSave();
      },
      
      removeCertification: (index) => {
        set((state) => ({
          data: {
            ...state.data,
            certifications: (state.data.certifications || []).filter((_, i) => i !== index)
          }
        }));
        debouncedSave();
      },
      
      setTemplateKey: (templateKey) => {
        set((state) => ({
          data: { ...state.data, templateKey }
        }));
        debouncedSave();
      },
      
      importSnapshot: (data) => {
        set({ data, isReadOnly: false });
        debouncedSave();
      },
      
      exportSnapshot: () => get().data,
      
      resetToClean: () => {
        set({ data: cleanData, isReadOnly: false });
        debouncedSave();
      },
      
      resetToDemo: () => {
        set({ data: demoData, isReadOnly: false });
        debouncedSave();
      },
      
      setReadOnly: (readOnly) => {
        set({ isReadOnly: readOnly });
      }
    }),
    {
      name: 'resume-data-empty',
      partialize: (state) => ({ data: state.data })
    }
  )
);

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function debouncedSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    // The persist middleware handles automatic saving
    console.log('Resume data saved to localStorage');
  }, 300);
}

// URL sharing utilities
export function createShareableLink(data: ResumeData): string {
  const base64Data = btoa(JSON.stringify(data));
  return `${window.location.origin}/#data=${base64Data}`;
}

export function loadFromShareableLink(): ResumeData | null {
  const hash = window.location.hash;
  if (!hash.startsWith('#data=')) return null;
  
  try {
    const base64Data = hash.substring(6);
    const jsonData = atob(base64Data);
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Failed to load shared resume data:', error);
    return null;
  }
}
