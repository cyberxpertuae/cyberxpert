import data from '../data/mock/rewards.json';
import { ok } from './api';
export type Offer = (typeof data.offers)[number];
export const offersService = {
  getOffers: (cat?: string) => ok(cat && cat !== 'all' ? data.offers.filter((o) => o.cat === cat) : data.offers),
  getOffer: (id: string) => ok(data.offers.find((o) => o.id === id) ?? null, 250),
  findByCode: (code: string) => ok(data.offers.find((o) => o.code.toLowerCase() === code.trim().toLowerCase()) ?? null, 500),
  sync: () => data.offers,
};
