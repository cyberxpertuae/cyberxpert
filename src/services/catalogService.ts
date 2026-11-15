import catalog from '../data/mock/catalog.json';
import { ok } from './api';

export type Plan = (typeof catalog.plans)[number];
export type Tier = (typeof catalog.tiers)[number];
export type Addon = (typeof catalog.addons)[number];
export const gym = catalog.gym;
export const tiers = catalog.tiers;

export const catalogService = {
  getGym: () => ok(catalog.gym, 200),
  getPlans: (type?: string) => ok(type ? catalog.plans.filter((p) => p.type === type) : catalog.plans),
  getPlan: (id: string) => ok(catalog.plans.find((p) => p.id === id) ?? null, 250),
  planSync: (id?: string | null) => catalog.plans.find((p) => p.id === id) ?? null,
  getAddons: () => ok(catalog.addons, 200),
  addonsSync: () => catalog.addons,
  getTiers: () => ok(catalog.tiers, 250),
  tierSync: (id: string) => catalog.tiers.find((t) => t.id === id)!,
};
