import { create } from 'zustand';
export const useSetup = create<{ goal: string; gender: string; age: string; height: string; weight: string; target: string; activity: string; experience: string; set: (p: any) => void }>((set) => ({
  goal: 'muscle', gender: 'male', age: '29', height: '178', weight: '82', target: '78', activity: 'moderate', experience: 'intermediate', set: (p) => set(p),
}));
