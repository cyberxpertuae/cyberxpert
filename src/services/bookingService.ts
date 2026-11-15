import data from '../data/mock/services.json';
import { st, TODAY, Booking } from '../store/app';
import { addDays, hash, ok, uid, wait } from './api';
import { rewardsService } from './rewardsService';

export type Service = (typeof data.services)[number];
export type Coach = (typeof data.coaches)[number];
export type ClassType = (typeof data.classTypes)[number];
export type ClassSession = { id: string; type: ClassType; date: string; time: string; coach: Coach; spotsLeft: number; ladies?: boolean };

export const serviceSync = (id: string) => data.services.find((s) => s.id === id)!;
export const coachSync = (id?: string | null) => data.coaches.find((c) => c.id === id) ?? null;
export const classTypeSync = (id: string) => data.classTypes.find((c) => c.id === id)!;

const sessionsFor = (date: string): ClassSession[] => {
  const dow = new Date(date + 'T00:00:00').getDay();
  return data.schedule
    .filter((s) => s.days.includes(dow))
    .map((s) => {
      const type = classTypeSync(s.type);
      const taken = hash(date + s.type + s.time) % (type.capacity + 3);
      return { id: `${s.type}_${date}_${s.time}`, type, date, time: s.time, coach: coachSync(type.coach)!, spotsLeft: Math.max(0, type.capacity - taken), ladies: (s as any).ladies };
    })
    .sort((a, b) => a.time.localeCompare(b.time));
};

export const bookingService = {
  getServices: () => ok(data.services),
  getService: (id: string) => ok(data.services.find((s) => s.id === id) ?? null, 250),
  getCoaches: () => ok(data.coaches),
  getCoach: (id: string) => ok(coachSync(id), 250),
  coachesSync: () => data.coaches,
  week: (from = TODAY) => Array.from({ length: 7 }, (_, i) => addDays(from, i)),
  getSlots: async (coachId: string | null, date: string) => {
    await wait(350);
    const times = ['07:00', '08:00', '09:00', '10:00', '11:00', '13:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
    return times.map((t) => ({ time: t, taken: hash((coachId ?? 'x') + date + t) % 3 === 0 || (date === TODAY && t < '12:00') }));
  },
  getClasses: async (date: string, type?: string) => { await wait(400); const l = sessionsFor(date); return type && type !== 'all' ? l.filter((c) => c.type.id === type) : l; },
  getClass: async (id: string) => { await wait(250); const [, date] = id.split('_'); return sessionsFor(date).find((c) => c.id === id) ?? null; },
  classTypes: () => data.classTypes,
  bookDraft: async () => {
    await wait(1000);
    const d = st().booking;
    let b: Booking;
    if (d.classId) {
      const [type, date, time] = d.classId.split('_');
      b = { id: uid('BK'), kind: 'class', ref: type, coach: classTypeSync(type).coach, date, time, status: 'upcoming' };
    } else {
      b = { id: uid('BK'), kind: 'service', ref: d.serviceId!, coach: d.coachId, date: d.date!, time: d.time!, status: 'upcoming', pkg: d.pkg ?? '1', used: 0 };
      const svc = serviceSync(d.serviceId!);
      const pkg = svc.packages.find((p) => p.id === d.pkg) ?? svc.packages[0];
      if (pkg) {
        const disc = rewardsService.summary().discount;
        const amount = Math.round(pkg.price * (1 - disc / 100));
        const s = st();
        s.set({ invoices: [{ id: uid('INV-26'), date: TODAY, title: svc.name, amount, method: 'visa', status: 'paid' }, ...s.invoices] });
        rewardsService.addPoints(amount, svc.name);
      }
    }
    const s = st();
    s.set({ bookings: [b, ...s.bookings], notifications: [{ id: uid('n'), type: 'bookings', icon: 'calendar', time: new Date().toISOString(), read: false, title: { en: 'Booking confirmed', ar: 'تم تأكيد الحجز' }, body: { en: `${b.date} · ${b.time}`, ar: `${b.date} · ${b.time}` }, link: '/bookings' }, ...s.notifications] });
    return b;
  },
  getBookings: () => ok(st().bookings),
  getBooking: (id: string) => ok(st().bookings.find((b) => b.id === id) ?? null, 250),
  cancelBooking: async (id: string) => { await wait(700); st().set({ bookings: st().bookings.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)) }); },
  reschedule: async (id: string, date: string, time: string) => { await wait(700); st().set({ bookings: st().bookings.map((b) => (b.id === id ? { ...b, date, time } : b)) }); },
  bookingTitle: (b: Booking) => (b.kind === 'class' ? classTypeSync(b.ref).name : serviceSync(b.ref).name),
  bookingImg: (b: Booking) => (b.kind === 'class' ? classTypeSync(b.ref).img : serviceSync(b.ref).img),
};
