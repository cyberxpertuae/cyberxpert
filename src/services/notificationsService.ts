import { st } from '../store/app';
import { ok } from './api';
export const notificationsService = {
  list: () => ok(st().notifications),
  unread: () => st().notifications.filter((n) => !n.read).length,
  markRead: (id: string) => st().set({ notifications: st().notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }),
  markAll: () => st().set({ notifications: st().notifications.map((n) => ({ ...n, read: true })) }),
  setPref: (k: string, v: boolean) => st().set({ notifPrefs: { ...st().notifPrefs, [k]: v } }),
};
