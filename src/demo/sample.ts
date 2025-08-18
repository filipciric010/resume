import type { ResumeData } from '@/store/useResume';

export const SAMPLE_RESUME: ResumeData = {
  templateKey: 'modern',
  profile: {
    fullName: 'Jordan Rivera',
    email: 'jordan.rivera@example.com',
    phone: '+1 (555) 987-6543',
    location: 'Austin, TX',
    headline: 'React/TypeScript Engineer',
    links: ['github.com/jordan-rivera', 'linkedin.com/in/jordanrivera'],
    summary:
      'Frontend engineer focused on performant, accessible React apps. 4+ years shipping responsive UIs, design systems, and DX improvements with TypeScript.',
  },
  experience: [
    {
      id: 'exp-1',
      role: 'Frontend Engineer',
      company: 'Acme Analytics',
      start: '2022-02',
      end: 'Present',
      bullets: [
        { id: 'b1', text: 'Built reusable TS component library, reducing UI bugs by 35% and dev time by 25%.' },
        { id: 'b2', text: 'Improved TTI by 40% via route-based code splitting and image optimizations.' },
        { id: 'b3', text: 'Led accessibility sweep to WCAG AA; added linting and CI checks.' },
      ],
    },
    {
      id: 'exp-2',
      role: 'React Developer',
      company: 'Bright Labs',
      start: '2020-01',
      end: '2022-01',
      bullets: [
        { id: 'b4', text: 'Shipped dashboards with React Query and charts; boosted retention by 12%.' },
        { id: 'b5', text: 'Introduced TypeScript across codebase; caught 100+ issues pre-merge.' },
      ],
    },
  ],
  education: [],
  skills: [
    { id: 's1', name: 'React', level: 'expert' },
    { id: 's2', name: 'TypeScript', level: 'advanced' },
    { id: 's3', name: 'Vite', level: 'advanced' },
    { id: 's4', name: 'Node.js', level: 'intermediate' },
    { id: 's5', name: 'Testing (Vitest/Jest)', level: 'intermediate' },
  ],
  certifications: [],
  projects: [],
};

export const SAMPLE_JD = `
We are seeking a React/TypeScript Engineer to build performant, accessible web apps.
Requirements:
- 3+ years with React and modern state management (e.g., React Query)
- Strong TypeScript and component design patterns
- Experience with Vite or similar tooling and testing frameworks
- Accessibility best practices and responsive design
Nice to have: charts, data viz, Node/Express basics.
`;
