/**
 * Mock API layer. Every service function is async and resolves after a short
 * delay, exactly like a network call. Swap the bodies for real fetch() calls
 * (same signatures) to go live — screens never touch the JSON directly.
 */
export const wait = (ms = 420) => new Promise((r) => setTimeout(r, ms));
export const uid = (p = 'id') => `${p}-${Math.random().toString(36).slice(2, 8)}`;
export const ok = async <T>(v: T, ms?: number): Promise<T> => { await wait(ms); return v; };

export const addDays = (iso: string, d: number) => { const x = new Date(iso + 'T00:00:00'); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10); };
export const addMonths = (iso: string, m: number) => { const x = new Date(iso + 'T00:00:00'); x.setMonth(x.getMonth() + m); return x.toISOString().slice(0, 10); };
export const daysBetween = (a: string, b: string) => Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000);
export const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };
