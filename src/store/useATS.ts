import { create } from 'zustand';

interface AtsState {
  jobDescription: string;
  setJobDescription: (text: string) => void;
}

export const useATS = create<AtsState>((set) => ({
  jobDescription: '',
  setJobDescription: (text) => set({ jobDescription: text }),
}));
