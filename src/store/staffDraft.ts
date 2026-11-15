import { create } from 'zustand';
import { TODAY } from './app';
type D = { name: string; phone: string; eid: string; gender: string; dob: string; eName: string; ePhone: string; planId: string; start: string; method: string; renewId: string | null; set: (p: Partial<D>) => void; reset: () => void };
const init = { name: '', phone: '', eid: '', gender: 'male', dob: '', eName: '', ePhone: '', planId: 'pl-monthly', start: TODAY, method: 'cash', renewId: null as string | null };
export const useStaffDraft = create<D>((set) => ({ ...init, set: (p) => set(p), reset: () => set(init) }));
