import data from '../data/mock/training.json';
import { st, Meal } from '../store/app';
import { ok, uid, wait } from './api';

export type Food = (typeof data.foods)[number];
export const foodSync = (id: string) => data.foods.find((f) => f.id === id)!;

export const ACTIVITY: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, athlete: 1.9 };

/** Mifflin–St Jeor BMR × activity, adjusted for goal; macros 30/40/30. */
export function calcCalories(p: { gender: string; age: number; height: number; weight: number; activity: string; goal: string }) {
  const bmr = Math.round(10 * p.weight + 6.25 * p.height - 5 * p.age + (p.gender === 'female' ? -161 : 5));
  const tdee = Math.round(bmr * (ACTIVITY[p.activity] ?? 1.55));
  const adj = p.goal === 'lose' ? -500 : p.goal === 'muscle' ? 300 : p.goal === 'strength' ? 200 : 0;
  const kcal = Math.round((tdee + adj) / 10) * 10;
  return { bmr, tdee, kcal, protein: Math.round((kcal * 0.3) / 4), carbs: Math.round((kcal * 0.4) / 4), fat: Math.round((kcal * 0.3) / 9) };
}

export const nutritionService = {
  dayTotals: () => {
    const d = st().diary;
    const all = (Object.keys(d) as Meal[]).flatMap((m) => d[m]);
    const sum = (k: 'kcal' | 'p' | 'c' | 'f') => Math.round(all.reduce((s, e) => s + foodSync(e.food)[k] * e.qty, 0));
    const goal = st().calorieGoal;
    return { eaten: sum('kcal'), p: sum('p'), c: sum('c'), f: sum('f'), goal, burned: st().burnedToday, left: goal - sum('kcal') + st().burnedToday, pGoal: Math.round((goal * 0.3) / 4), cGoal: Math.round((goal * 0.4) / 4), fGoal: Math.round((goal * 0.3) / 9) };
  },
  mealKcal: (m: Meal) => Math.round(st().diary[m].reduce((s, e) => s + foodSync(e.food).kcal * e.qty, 0)),
  searchFoods: async (q: string, cat?: string) => {
    await wait(300);
    let l = data.foods;
    if (cat && cat !== 'all') l = l.filter((f) => f.cat === cat);
    if (q) { const s = q.toLowerCase(); l = l.filter((f) => f.name.en.toLowerCase().includes(s) || f.name.ar.includes(q)); }
    return l;
  },
  getFood: (id: string) => ok(foodSync(id) ?? null, 200),
  addFood: (meal: Meal, food: string, qty: number) => { const d = { ...st().diary }; d[meal] = [...d[meal], { uid: uid('d'), food, qty }]; st().set({ diary: d }); },
  removeFood: (meal: Meal, entry: string) => { const d = { ...st().diary }; d[meal] = d[meal].filter((e) => e.uid !== entry); st().set({ diary: d }); },
  setWater: (n: number) => st().set({ water: Math.max(0, Math.min(12, n)) }),
  setGoal: async (kcal: number) => { await wait(400); st().set({ calorieGoal: kcal }); },
  getMealPlan: () => ok(data.mealPlan, 350),
};
