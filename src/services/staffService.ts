import { st, TODAY, StaffMember } from '../store/app';
import { catalogService } from './catalogService';
import { addDays, addMonths, ok, uid, wait } from './api';
import { productSync } from './shopService';

export const staffService = {
  dashboard: () => ok({ ...st().staffToday, expiring: st().members.filter((m) => m.status === 'expiring'), pending: st().members.filter((m) => m.status === 'pending') }, 400),
  members: async (status: string, q: string) => {
    await wait(350);
    let l = st().members;
    if (status !== 'all') l = l.filter((m) => m.status === status);
    if (q) { const s = q.toLowerCase(); l = l.filter((m) => m.name.en.toLowerCase().includes(s) || m.name.ar.includes(q) || m.id.toLowerCase().includes(s) || m.phone.replace(/\s/g, '').includes(s.replace(/\s/g, ''))); }
    return l;
  },
  member: (id: string) => ok(st().members.find((m) => m.id === id) ?? null, 250),
  counts: () => { const l = st().members; const c = (s: string) => l.filter((m) => m.status === s).length; return { all: l.length, active: c('active'), expiring: c('expiring'), expired: c('expired'), frozen: c('frozen'), pending: c('pending') }; },
  register: async (p: { name: string; phone: string; eid: string; gender: string; planId: string; start: string; method: string; total: number }) => {
    await wait(1100);
    const plan = catalogService.planSync(p.planId)!;
    const m: StaffMember = { id: 'EMP-' + Math.floor(21200 + Math.random() * 700), name: { en: p.name, ar: p.name }, gender: p.gender, phone: p.phone, plan: plan.id, tier: plan.tier, status: p.method === 'link' ? 'pending' : 'active', end: plan.months ? addMonths(p.start, plan.months) : addDays(p.start, 90), visits: 0, lastVisit: TODAY, avatar: null };
    const s = st();
    s.set({ members: [m, ...s.members], staffToday: { ...s.staffToday, newMembers: s.staffToday.newMembers + 1, sales: s.staffToday.sales + (p.method === 'link' ? 0 : p.total) } });
    return m;
  },
  checkIn: async (idOrCode: string) => {
    await wait(700);
    const s = st();
    const key = idOrCode.trim().toUpperCase().replace(/^EMP(\d)/, 'EMP-$1');
    const m = s.members.find((x) => x.id.toUpperCase() === key) ?? null;
    if (!m) return { member: null, allowed: false, reason: 'notFound' };
    const allowed = m.status === 'active' || m.status === 'expiring';
    const time = new Date().toTimeString().slice(0, 5);
    s.set({ visits: [{ id: uid('vs'), member: m.id, time, result: allowed ? 'allowed' : 'denied' }, ...s.visits], staffToday: allowed ? { ...s.staffToday, checkins: s.staffToday.checkins + 1 } : s.staffToday, members: allowed ? s.members.map((x) => (x.id === m.id ? { ...x, visits: x.visits + 1, lastVisit: TODAY } : x)) : s.members });
    return { member: m, allowed, reason: allowed ? 'ok' : m.status };
  },
  update: async (id: string, patch: Partial<StaffMember>) => { await wait(700); st().set({ members: st().members.map((m) => (m.id === id ? { ...m, ...patch } : m)) }); },
  renew: async (id: string, planId: string, total: number) => {
    await wait(900);
    const plan = catalogService.planSync(planId)!;
    const s = st();
    s.set({ members: s.members.map((m) => (m.id === id ? { ...m, plan: planId, tier: plan.tier, status: 'active', end: plan.months ? addMonths(m.end > TODAY ? m.end : TODAY, plan.months) : addDays(TODAY, 90) } : m)), staffToday: { ...s.staffToday, sales: s.staffToday.sales + total } });
  },
  visits: () => ok(st().visits, 300),
  memberSync: (id: string) => st().members.find((m) => m.id === id) ?? null,
  sale: async (memberId: string | null, method: string) => {
    await wait(900);
    const s = st();
    const m = memberId ? s.members.find((x) => x.id === memberId) : null;
    const disc = m ? ({ bronze: 0, silver: 5, gold: 10, platinum: 15 } as Record<string, number>)[m.tier] ?? 0 : 0;
    const sub = s.posCart.reduce((a, c) => a + productSync(c.id).price * c.qty, 0);
    const total = Math.round((sub - (sub * disc) / 100) * 100) / 100;
    const receipt = { id: 'RC-' + Math.floor(5000 + Math.random() * 4000), items: s.posCart, sub, disc, total, method, member: m?.id ?? null };
    s.set({ posCart: [], staffToday: { ...s.staffToday, sales: s.staffToday.sales + total } });
    return receipt;
  },
};
