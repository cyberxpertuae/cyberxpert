import member from '../data/mock/member.json';
import { st } from '../store/app';
import { ok, wait } from './api';

export const authService = {
  /** Any valid-looking credentials are accepted in the mock. */
  login: async (_id: string, _password: string) => { await wait(700); return { otpSent: true }; },
  register: async (data: { name: string; phone: string; email: string; gender: string; dob: string }) => {
    await wait(700);
    st().set({ user: { ...member.user, name: data.name || member.user.name, fullName: { en: data.name, ar: data.name }, firstName: { en: data.name.split(' ')[0], ar: data.name.split(' ')[0] }, phone: data.phone, email: data.email, gender: data.gender, dob: data.dob, points: 250, lifetimePoints: 250, tier: 'bronze', workouts: 0, streak: 0 } as any, membership: null, guest: false });
    return { otpSent: true };
  },
  verifyOtp: async (code: string, mode: string) => {
    await wait(600);
    if (code.length !== 4) throw new Error('otp');
    if (mode === 'login') st().set({ user: member.user, guest: false });
    return true;
  },
  resend: () => ok(true, 400),
  requestReset: (_id: string) => ok(true, 600),
  resetPassword: (_p: string) => ok(true, 700),
  changePassword: (_o: string, _n: string) => ok(true, 700),
  continueAsGuest: () => { st().set({ guest: true, user: null }); return ok(true, 200); },
  logout: async () => { await wait(400); st().set({ user: null, guest: false }); },
  deleteAccount: async (_reason: string) => { await wait(900); st().set({ user: null, guest: false, membership: null }); },
  saveFitnessProfile: async (p: { goal: string; gender: string; age: number; height: number; weight: number; target: number; activity: string; experience: string; kcal: number }) => {
    await wait(500);
    const u = st().user;
    if (u) st().set({ user: { ...u, goal: p.goal, gender: p.gender, height: p.height, weight: p.weight, target: p.target, activity: p.activity, experience: p.experience } });
    st().set({ calorieGoal: p.kcal });
    return true;
  },
  staffLogin: async (id: string, pin: string) => { await wait(700); if (!id || pin.length !== 4) throw new Error('bad'); st().set({ staffSignedIn: true }); return true; },
  staffLogout: async () => { await wait(300); st().set({ staffSignedIn: false }); },
};
