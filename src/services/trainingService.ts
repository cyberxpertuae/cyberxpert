import data from '../data/mock/training.json';
import mdata from '../data/mock/machines.json';
import { st, TODAY, CustomWorkout } from '../store/app';
import { ok, uid, wait } from './api';
import { rewardsService } from './rewardsService';

export type Program = (typeof data.programs)[number];
export type Exercise = (typeof mdata.exercises)[number];
export const exerciseSync = (id: string) => mdata.exercises.find((e) => e.id === id)!;
export const programSync = (id?: string | null) => data.programs.find((p) => p.id === id) ?? null;

export const trainingService = {
  getPrograms: (goal?: string) => ok(goal && goal !== 'all' ? data.programs.filter((p) => p.goal === goal) : data.programs),
  getProgram: (id: string) => ok(programSync(id), 300),
  getDay: async (programId: string, dayId: string) => { await wait(300); const p = programSync(programId); if (p) return { program: p, day: p.days.find((d) => d.id === dayId)!, custom: null as CustomWorkout | null }; const c = st().customWorkouts.find((w) => w.id === programId) ?? null; return { program: null, day: null, custom: c }; },
  getExercises: (group?: string) => ok(group && group !== 'all' ? mdata.exercises.filter((e) => e.group === group) : mdata.exercises, 250),
  getExercise: (id: string) => ok(exerciseSync(id) ?? null, 250),
  todayWorkout: () => {
    const p = programSync(st().activeProgram) ?? data.programs[0];
    const done = st().history.filter((h) => h.program === p.id).length;
    const day = p.days[done % p.days.length];
    return { program: p, day, week: Math.min(p.weeks, Math.floor(done / p.perWeek) + 1), progress: Math.min(1, done / (p.weeks * p.perWeek)) };
  },
  setActiveProgram: async (id: string) => { await wait(400); st().set({ activeProgram: id }); },
  startSession: (programId: string | null, dayId: string | null, name: string, exIds: { id: string; sets: number }[]) => {
    st().set({ session: { programId, dayId, name, startedAt: Date.now(), exercises: exIds.map((e) => ({ id: e.id, sets: Array.from({ length: e.sets }, () => ({ kg: '', reps: '', done: false })) })) } });
  },
  finishSession: async () => {
    await wait(700);
    const s = st();
    const ss = s.session;
    if (!ss) return null;
    const sets = ss.exercises.flatMap((e) => e.sets.filter((x) => x.done).map((x) => ({ ...x, ex: e.id })));
    const volume = sets.reduce((a, x) => a + (parseFloat(x.kg) || 0) * (parseInt(x.reps, 10) || 0), 0);
    const min = Math.max(1, Math.round((Date.now() - ss.startedAt) / 60000));
    const kcal = Math.round(sets.reduce((a, x) => a + exerciseSync(x.ex).kcal, 0) + min * 3);
    // PR detection
    const prs: { ex: string; v: number }[] = [];
    const records = s.records.map((r) => {
      const best = Math.max(...r.history.map((h) => h.v));
      const top = Math.max(0, ...sets.filter((x) => x.ex === r.ex).map((x) => parseFloat(x.kg) || 0));
      if (top > best) { prs.push({ ex: r.ex, v: top }); return { ...r, history: [...r.history, { date: TODAY, v: top }] }; }
      return r;
    });
    const log = { id: uid('w'), date: TODAY, program: ss.programId, day: ss.dayId, min, kcal, volume: Math.round(volume), sets: sets.length, name: ss.name };
    s.set({ history: [log, ...s.history], records, session: null, lastSession: log, burnedToday: s.burnedToday + kcal, user: s.user ? { ...s.user, workouts: s.user.workouts + 1, streak: s.user.streak + 1 } : s.user });
    rewardsService.addPoints(30, { en: 'Workout logged', ar: 'تسجيل تمرين' });
    return { log, prs, points: 30 };
  },
  getHistory: () => ok(st().history),
  getCustom: () => ok(st().customWorkouts, 250),
  saveCustom: async (w: Omit<CustomWorkout, 'id'>) => { await wait(500); st().set({ customWorkouts: [{ ...w, id: uid('cw') }, ...st().customWorkouts] }); },
  deleteCustom: async (id: string) => { await wait(300); st().set({ customWorkouts: st().customWorkouts.filter((w) => w.id !== id) }); },
  getRecords: () => ok(st().records),
  addRecord: async (ex: string, v: number, date: string) => {
    await wait(500);
    const recs = st().records.slice();
    const i = recs.findIndex((r) => r.ex === ex);
    if (i >= 0) recs[i] = { ...recs[i], history: [...recs[i].history, { date, v }].sort((a, b) => a.date.localeCompare(b.date)) };
    else recs.push({ ex, unit: 'kg', history: [{ date, v }] });
    st().set({ records: recs });
  },
  getMeasurements: () => ok(st().measurements),
  addMeasurement: async (m: { date: string; weight: number; fat: number; muscle: number; waist: number }) => {
    await wait(500);
    const s = st();
    s.set({ measurements: [...s.measurements, m].sort((a, b) => a.date.localeCompare(b.date)), user: s.user ? { ...s.user, weight: m.weight } : s.user });
  },
};
