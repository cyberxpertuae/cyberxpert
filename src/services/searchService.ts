import catalog from '../data/mock/catalog.json';
import mdata from '../data/mock/machines.json';
import sdata from '../data/mock/services.json';
import { wait } from './api';
export type SearchHit = { kind: 'plan' | 'product' | 'service' | 'machine' | 'exercise'; id: string; title: { en: string; ar: string }; img?: string; route: string };
export const searchService = {
  search: async (q: string): Promise<SearchHit[]> => {
    await wait(350);
    const s = q.trim().toLowerCase();
    if (!s) return [];
    const m = (b: { en: string; ar: string }) => b.en.toLowerCase().includes(s) || b.ar.includes(q.trim());
    return [
      ...catalog.plans.filter((p) => m(p.name)).map((p) => ({ kind: 'plan' as const, id: p.id, title: p.name, route: `/plans/${p.id}` })),
      ...catalog.products.filter((p) => m(p.name)).map((p) => ({ kind: 'product' as const, id: p.id, title: p.name, img: p.img, route: `/shop/${p.id}` })),
      ...sdata.services.filter((p) => m(p.name)).map((p) => ({ kind: 'service' as const, id: p.id, title: p.name, img: p.img, route: `/services/${p.id}` })),
      ...mdata.machines.filter((p) => m(p.name)).map((p) => ({ kind: 'machine' as const, id: p.id, title: p.name, img: p.img, route: `/machines/${p.id}` })),
      ...mdata.exercises.filter((p) => m(p.name)).map((p) => ({ kind: 'exercise' as const, id: p.id, title: p.name, img: p.img, route: `/training/exercise/${p.id}` })),
    ];
  },
};
