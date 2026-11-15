import data from '../data/mock/rewards.json';
import catalog from '../data/mock/catalog.json';
import { st, TODAY } from '../store/app';
import { ok, uid, wait } from './api';

export type Reward = (typeof data.rewards)[number];
const order = ['bronze', 'silver', 'gold', 'platinum'];
export const tierRank = (t: string) => order.indexOf(t);

export const rewardsService = {
  summary: () => {
    const u = st().user;
    const tier = u?.tier ?? 'bronze';
    const i = tierRank(tier);
    const next = catalog.tiers[i + 1] ?? null;
    const life = u?.lifetimePoints ?? 0;
    const cur = catalog.tiers[i];
    const progress = next ? Math.min(1, (life - cur.min) / (next.min - cur.min)) : 1;
    return { points: u?.points ?? 0, lifetime: life, tier, next, toNext: next ? Math.max(0, next.min - life) : 0, progress, discount: cur.discount };
  },
  getRewards: (cat?: string) => ok(cat && cat !== 'all' ? data.rewards.filter((r) => r.cat === cat) : data.rewards),
  getReward: (id: string) => ok(data.rewards.find((r) => r.id === id) ?? null, 250),
  canRedeem: (r: Reward) => tierRank(st().user?.tier ?? 'bronze') >= tierRank(r.minTier) && (st().user?.points ?? 0) >= r.points,
  redeem: async (r: Reward) => {
    await wait(900);
    const s = st();
    if (!s.user) throw new Error('auth');
    const code = 'EMP-' + r.id.slice(3, 7).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 8999);
    s.set({
      user: { ...s.user, points: s.user.points - r.points },
      points: [{ id: uid('pt'), date: TODAY, type: 'spend', pts: -r.points, title: { en: 'Redeemed: ' + r.title.en, ar: 'استبدال: ' + r.title.ar } }, ...s.points],
      vouchers: [{ id: uid('v'), code, title: r.title, until: '2027-02-15', status: 'active', img: r.img }, ...s.vouchers],
    });
    return code;
  },
  getHistory: () => ok(st().points),
  getVouchers: () => ok(st().vouchers),
  addPoints: (pts: number, title: { en: string; ar: string }) => {
    const s = st();
    if (!s.user || !pts) return;
    s.set({ user: { ...s.user, points: s.user.points + pts, lifetimePoints: s.user.lifetimePoints + pts }, points: [{ id: uid('pt'), date: TODAY, type: 'earn', pts, title }, ...s.points] });
  },
};
