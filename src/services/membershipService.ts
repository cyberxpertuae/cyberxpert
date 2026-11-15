import { st, TODAY, Membership } from '../store/app';
import { catalogService } from './catalogService';
import { addDays, addMonths, ok, uid, wait } from './api';
import { offersService } from './offersService';

export type Quote = { plan: number; addons: number; subtotal: number; promo: number; points: number; pointsUsed: number; total: number; vat: number };

export const membershipService = {
  getMembership: () => ok(st().membership, 350),
  quote: (): Quote => {
    const d = st().checkout;
    const plan = catalogService.planSync(d.planId);
    const months = Math.max(1, plan?.months ?? 1);
    const addons = catalogService.addonsSync().filter((a) => d.addons.includes(a.id)).reduce((s, a) => s + (a.perMonth ? a.price * months : a.price), 0);
    const base = plan?.price ?? 0;
    const subtotal = base + addons;
    const promo = Math.round(base * (d.promoPct / 100));
    const balance = st().user?.points ?? 0;
    const maxPts = Math.floor((subtotal - promo) * 0.2);
    const pointsAed = d.usePoints ? Math.min(maxPts, Math.floor(balance / 10)) : 0;
    const total = Math.max(0, subtotal - promo - pointsAed);
    return { plan: base, addons, subtotal, promo, points: pointsAed, pointsUsed: pointsAed * 10, total, vat: +(total - total / 1.05).toFixed(2) };
  },
  applyPromo: async (code: string) => {
    const o = await offersService.findByCode(code);
    if (!o) throw new Error('invalid');
    st().set({ checkout: { ...st().checkout, promo: o.code, promoPct: o.discount >= 100 ? 0 : o.discount } });
    return o;
  },
  subscribe: async () => {
    await wait(1200);
    const d = st().checkout;
    const plan = catalogService.planSync(d.planId)!;
    const q = membershipService.quote();
    const payAtGym = d.method === 'gym';
    const end = plan.months ? addMonths(d.start, plan.months) : addDays(d.start, plan.type === 'pass' ? 90 : 30);
    const m: Membership = { id: 'MB-' + Math.floor(70000 + Math.random() * 9999), plan: plan.id, status: payAtGym ? 'pending' : 'active', start: d.start, end, freezeLeft: plan.freezeDays, autoRenew: false, branch: { en: 'Mussafah, Abu Dhabi', ar: 'مصفح، أبوظبي' }, visits: 0 };
    const s = st();
    const earned = payAtGym ? 0 : Math.round(q.total);
    const user = s.user ? { ...s.user, points: s.user.points - q.pointsUsed + earned, lifetimePoints: s.user.lifetimePoints + earned, tier: rankTier(s.user.tier, plan.tier) } : s.user;
    s.set({
      membership: m,
      user,
      invoices: payAtGym ? s.invoices : [{ id: uid('INV-26'), date: TODAY, title: plan.name, amount: q.total, method: d.method ?? 'visa', status: 'paid' }, ...s.invoices],
      points: earned ? [{ id: uid('pt'), date: TODAY, type: 'earn', pts: earned, title: plan.name }, ...s.points] : s.points,
      notifications: [{ id: uid('n'), type: 'membership', icon: 'card', time: new Date().toISOString(), read: false, title: payAtGym ? { en: 'Show your QR at reception', ar: 'اعرض رمز QR في الاستقبال' } : { en: 'Welcome to Empire Gym 🏆', ar: 'أهلاً بك في إمباير جيم 🏆' }, body: plan.name, link: '/membership' }, ...s.notifications],
    });
    return { membership: m, earned, total: q.total };
  },
  freeze: async (from: string, days: number) => {
    await wait(800);
    const m = st().membership!;
    st().set({ membership: { ...m, status: 'frozen', freeze: { from, days }, freezeLeft: Math.max(0, m.freezeLeft - days), end: addDays(m.end, days) } });
  },
  unfreeze: async () => { await wait(600); const m = st().membership!; st().set({ membership: { ...m, status: 'active', freeze: undefined } }); },
  toggleAutoRenew: async () => { await wait(300); const m = st().membership!; st().set({ membership: { ...m, autoRenew: !m.autoRenew } }); },
  getInvoices: () => ok(st().invoices),
  getInvoice: (id: string) => ok(st().invoices.find((i) => i.id === id) ?? null, 250),
};

const order = ['bronze', 'silver', 'gold', 'platinum'];
export const rankTier = (a: string, b: string) => (order.indexOf(b) > order.indexOf(a) ? b : a);
