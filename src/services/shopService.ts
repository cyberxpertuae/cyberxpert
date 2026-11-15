import catalog from '../data/mock/catalog.json';
import { st, TODAY, CartItem, Address, SavedCard } from '../store/app';
import { ok, uid, wait } from './api';
import { rewardsService } from './rewardsService';

export type Product = (typeof catalog.products)[number];
export const productSync = (id: string) => catalog.products.find((p) => p.id === id)!;

export type ProductQuery = { cat?: string; q?: string; sort?: 'popular' | 'low' | 'high' | 'rating'; inStock?: boolean; max?: number };

export const shopService = {
  getCategories: () => ok(catalog.productCategories, 150),
  categoriesSync: () => catalog.productCategories,
  getProducts: async (f: ProductQuery = {}) => {
    let list = catalog.products.slice();
    if (f.cat && f.cat !== 'all') list = list.filter((p) => p.cat === f.cat);
    if (f.q) { const q = f.q.toLowerCase(); list = list.filter((p) => p.name.en.toLowerCase().includes(q) || p.name.ar.includes(f.q!)); }
    if (f.inStock) list = list.filter((p) => p.stock > 0);
    if (f.max) list = list.filter((p) => p.price <= f.max!);
    if (f.sort === 'low') list.sort((a, b) => a.price - b.price);
    if (f.sort === 'high') list.sort((a, b) => b.price - a.price);
    if (f.sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    if (f.sort === 'popular') list.sort((a, b) => b.reviews - a.reviews);
    return ok(list, 450);
  },
  getProduct: (id: string) => ok(catalog.products.find((p) => p.id === id) ?? null, 300),
  memberPrice: (price: number) => { const d = rewardsService.summary().discount; return st().user ? Math.round(price * (1 - d / 100) * 100) / 100 : price; },
  addToCart: (id: string, qty: number, opt: number | null) => {
    const cart = st().cart.slice();
    const i = cart.findIndex((c) => c.id === id && c.opt === opt);
    if (i >= 0) cart[i] = { ...cart[i], qty: cart[i].qty + qty }; else cart.push({ id, qty, opt });
    st().set({ cart });
  },
  setQty: (i: number, qty: number) => { const cart = st().cart.slice(); cart[i] = { ...cart[i], qty }; st().set({ cart }); },
  removeAt: (i: number) => st().set({ cart: st().cart.filter((_, j) => j !== i) }),
  cartTotals: (items: CartItem[] = st().cart, method: 'pickup' | 'delivery' = 'pickup') => {
    const sub = items.reduce((s, c) => s + productSync(c.id).price * c.qty, 0);
    const disc = st().user ? Math.round(sub * (rewardsService.summary().discount / 100) * 100) / 100 : 0;
    const delivery = method === 'delivery' && sub - disc < 150 ? 15 : 0;
    const total = Math.max(0, sub - disc + delivery);
    return { sub, disc, delivery, total, vat: +(total - total / 1.05).toFixed(2), count: items.reduce((s, c) => s + c.qty, 0) };
  },
  placeOrder: async (method: 'pickup' | 'delivery', addressId: string | null, pay: string) => {
    await wait(1100);
    const s = st();
    const t = shopService.cartTotals(s.cart, method);
    const id = 'EG-' + Math.floor(1060 + Math.random() * 900);
    s.set({ orders: [{ id, date: TODAY, status: 'processing', method, items: s.cart, total: t.total, address: addressId ?? undefined }, ...s.orders], cart: [] });
    rewardsService.addPoints(Math.round(t.total), { en: 'Shop order ' + id, ar: 'طلب المتجر ' + id });
    return { id, total: t.total, pay };
  },
  getOrders: () => ok(st().orders),
  getOrder: (id: string) => ok(st().orders.find((o) => o.id === id) ?? null, 250),
  cancelOrder: async (id: string) => { await wait(700); st().set({ orders: st().orders.map((o) => (o.id === id ? { ...o, status: 'cancelled' } : o)) }); },
  toggleFavorite: (id: string) => { const f = st().favorites; st().set({ favorites: f.includes(id) ? f.filter((x) => x !== id) : [...f, id] }); return !f.includes(id); },
  getFavorites: () => ok(st().favorites.map(productSync)),
  getAddresses: () => ok(st().addresses, 250),
  saveAddress: async (a: Omit<Address, 'id'> & { id?: string }) => {
    await wait(500);
    let list = st().addresses.slice();
    if (a.default) list = list.map((x) => ({ ...x, default: false }));
    if (a.id) list = list.map((x) => (x.id === a.id ? ({ ...x, ...a } as Address) : x)); else list.push({ ...(a as Address), id: uid('ad') });
    st().set({ addresses: list });
  },
  deleteAddress: async (id: string) => { await wait(300); st().set({ addresses: st().addresses.filter((a) => a.id !== id) }); },
  getCards: () => ok(st().cards, 250),
  addCard: async (c: Omit<SavedCard, 'id' | 'default'>, makeDefault = false) => {
    await wait(700);
    const cards = makeDefault ? st().cards.map((x) => ({ ...x, default: false })) : st().cards.slice();
    const card = { ...c, id: uid('c'), default: makeDefault || cards.length === 0 };
    st().set({ cards: [...cards, card] });
    return card;
  },
  deleteCard: async (id: string) => { await wait(300); st().set({ cards: st().cards.filter((c) => c.id !== id) }); },
  setDefaultCard: (id: string) => st().set({ cards: st().cards.map((c) => ({ ...c, default: c.id === id })) }),
  // staff POS
  posTotals: (items: CartItem[], tierDiscount = 0) => {
    const sub = items.reduce((s, c) => s + productSync(c.id).price * c.qty, 0);
    const disc = Math.round(sub * tierDiscount) / 100;
    return { sub, disc, total: sub - disc };
  },
};
