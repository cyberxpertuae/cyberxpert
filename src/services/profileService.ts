import { st } from '../store/app';
import { ok, uid, wait } from './api';
export const profileService = {
  getUser: () => ok(st().user, 250),
  update: async (p: Partial<NonNullable<ReturnType<typeof st>['user']>>) => { await wait(700); const u = st().user; if (u) st().set({ user: { ...u, ...p } }); },
  getChat: () => ok(st().chat, 300),
  send: async (text: string) => {
    st().set({ chat: [...st().chat, { id: uid('m'), from: 'me', time: new Date().toISOString(), text }] });
    await wait(1500);
    st().set({ chat: [...st().chat, { id: uid('m'), from: 'coach', time: new Date().toISOString(), text: { en: 'Got it 👍 I\'ll review and get back to you today.', ar: 'تمام 👍 راح أراجع وأرد عليك اليوم.' } }] });
  },
};
