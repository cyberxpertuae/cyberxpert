import { create } from 'zustand';
import member from '../data/mock/member.json';
import staffData from '../data/mock/staff.json';

/* Types (kept loose on purpose — the shapes mirror the mock JSON / future API) */
export type Bi = { en: string; ar: string };
export type CartItem = { id: string; qty: number; opt: number | null };
export type Order = { id: string; date: string; status: string; method: string; items: CartItem[]; total: number; address?: string };
export type Booking = { id: string; kind: 'class' | 'service'; ref: string; coach: string | null; date: string; time: string; status: string; pkg?: string; used?: number };
export type Invoice = { id: string; date: string; title: Bi; amount: number; method: string; status: string };
export type PointsEntry = { id: string; date: string; type: 'earn' | 'spend'; pts: number; title: Bi };
export type Voucher = { id: string; code: string; title: Bi; until: string; status: string; img: string };
export type Measurement = { date: string; weight: number; fat: number; muscle: number; waist: number };
export type RecordSeries = { ex: string; unit: string; history: { date: string; v: number }[] };
export type WorkoutLog = { id: string; date: string; program: string | null; day: string | null; min: number; kcal: number; volume: number; sets: number; name?: string };
export type Address = { id: string; label: Bi; emirate: string; area: Bi; building: string; flat: string; default: boolean };
export type SavedCard = { id: string; brand: string; last4: string; exp: string; name: string; default: boolean };
export type Membership = { id: string; plan: string; status: string; start: string; end: string; freezeLeft: number; autoRenew: boolean; branch: Bi; visits: number; freeze?: { from: string; days: number } };
export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snacks';
export type DiaryEntry = { uid: string; food: string; qty: number };
export type CustomWorkout = { id: string; name: string; day: string; ex: { id: string; sets: number; reps: string }[] };
export type ChatMsg = { id: string; from: 'me' | 'coach'; time: string; text: Bi | string };
export type User = typeof member.user;
export type StaffMember = (typeof staffData.members)[number];
export type Visit = (typeof staffData.visits)[number];

export type CheckoutDraft = { planId: string | null; start: string; addons: string[]; promo: string | null; promoPct: number; usePoints: boolean; method: string | null };
export type BookingDraft = { serviceId: string | null; pkg: string | null; coachId: string | null; classId: string | null; date: string | null; time: string | null };
export type SessionSet = { kg: string; reps: string; done: boolean };
export type ActiveSession = { programId: string | null; dayId: string | null; name: string; exercises: { id: string; sets: SessionSet[] }[]; startedAt: number } | null;

const today = '2026-11-15';
export const TODAY = today;

const initialDiary: Record<Meal, DiaryEntry[]> = {
  breakfast: [ { uid: 'd1', food: 'f-oats', qty: 1 }, { uid: 'd2', food: 'f-eggs', qty: 1 } ],
  lunch: [ { uid: 'd3', food: 'f-chicken', qty: 1 }, { uid: 'd4', food: 'f-rice', qty: 1 } ],
  dinner: [],
  snacks: [ { uid: 'd5', food: 'f-whey', qty: 1 }, { uid: 'd6', food: 'f-dates', qty: 1 } ],
};

type State = {
  // auth
  user: User | null;
  guest: boolean;
  onboarded: boolean;
  staffSignedIn: boolean;
  guestGate: boolean;
  // member data
  membership: Membership | null;
  notifications: typeof member.notifications;
  cart: CartItem[];
  favorites: string[];
  orders: Order[];
  bookings: Booking[];
  invoices: Invoice[];
  points: PointsEntry[];
  vouchers: Voucher[];
  measurements: Measurement[];
  records: RecordSeries[];
  history: WorkoutLog[];
  addresses: Address[];
  cards: SavedCard[];
  chat: ChatMsg[];
  diary: Record<Meal, DiaryEntry[]>;
  water: number;
  calorieGoal: number;
  burnedToday: number;
  activeProgram: string;
  customWorkouts: CustomWorkout[];
  session: ActiveSession;
  lastSession: WorkoutLog | null;
  checkout: CheckoutDraft;
  booking: BookingDraft;
  notifPrefs: Record<string, boolean>;
  units: 'kg' | 'lb';
  // staff
  members: StaffMember[];
  visits: Visit[];
  staffToday: { sales: number; newMembers: number; checkins: number };
  posCart: CartItem[];
  set: (p: Partial<State>) => void;
};

export const useApp = create<State>((set) => ({
  user: null,
  guest: false,
  onboarded: false,
  staffSignedIn: false,
  guestGate: false,
  membership: member.membership as Membership,
  notifications: member.notifications,
  cart: [{ id: 'pr-c4', qty: 2, opt: 0 }],
  favorites: ['pr-whey', 'pr-hoodie', 'pr-c5'],
  orders: member.orders as Order[],
  bookings: member.bookings as Booking[],
  invoices: member.invoices as Invoice[],
  points: member.points as PointsEntry[],
  vouchers: member.vouchers as Voucher[],
  measurements: member.measurements,
  records: member.records,
  history: member.history as WorkoutLog[],
  addresses: member.addresses as Address[],
  cards: member.cards as SavedCard[],
  chat: member.chat as ChatMsg[],
  diary: initialDiary,
  water: 5,
  calorieGoal: 2650,
  burnedToday: 412,
  activeProgram: 'pg-coach',
  customWorkouts: [
    { id: 'cw1', name: 'Arms & Abs Finisher', day: 'Fri', ex: [ { id: 'ex-curl', sets: 3, reps: '12' }, { id: 'ex-pushdown', sets: 3, reps: '12' }, { id: 'ex-plank', sets: 3, reps: '45 s' } ] },
    { id: 'cw2', name: 'Quick Cardio 30', day: 'Sun', ex: [ { id: 'ex-treadmill', sets: 1, reps: '20 min' }, { id: 'ex-rower', sets: 1, reps: '2 km' } ] },
  ],
  session: null,
  lastSession: null,
  checkout: { planId: null, start: today, addons: [], promo: null, promoPct: 0, usePoints: false, method: null },
  booking: { serviceId: null, pkg: null, coachId: null, classId: null, date: null, time: null },
  notifPrefs: { offers: true, bookings: true, membership: true, workouts: true },
  units: 'kg',
  members: staffData.members,
  visits: staffData.visits,
  staffToday: staffData.today,
  posCart: [],
  set: (p) => set(p),
}));

export const st = () => useApp.getState();
