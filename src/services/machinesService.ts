import data from '../data/mock/machines.json';
import { ok } from './api';
export type Machine = (typeof data.machines)[number];
export type Zone = (typeof data.zones)[number];
export const machineSync = (id?: string | null) => data.machines.find((m) => m.id === id) ?? null;
export const machinesService = {
  getZones: () => ok(data.zones.map((z) => ({ ...z, count: data.machines.filter((m) => m.zone === z.id).length }))),
  getZone: (id: string) => ok(data.zones.find((z) => z.id === id) ?? null, 200),
  getMachines: (zone?: string) => ok(zone ? data.machines.filter((m) => m.zone === zone) : data.machines),
  getMachine: (id: string) => ok(machineSync(id), 300),
  findByCode: (code: string) => ok(data.machines.find((m) => m.code.toLowerCase() === code.trim().toLowerCase().replace(/^eg(\d)/, 'eg-$1')) ?? null, 500),
  relatedExercises: (id: string) => data.exercises.filter((e) => e.machine === id),
};
