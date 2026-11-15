import { router } from 'expo-router';
import { st } from '../store/app';

/** Runs `fn` for signed-in users; guests get the sign-in sheet (G01). */
export function requireAuth(fn: () => void) {
  if (st().user) fn();
  else st().set({ guestGate: true });
}
export const go = (href: string) => router.push(href as any);
