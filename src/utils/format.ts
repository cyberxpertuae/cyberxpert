import { useI18n } from '../i18n';
import { TODAY } from '../store/app';

export function useFmt() {
  const { t, lang } = useI18n();
  const d = (iso: string) => new Date(iso.length === 10 ? iso + 'T00:00:00' : iso);
  return {
    date: (iso: string) => { const x = d(iso); return `${x.getDate()} ${t(`months.${x.getMonth()}`)} ${x.getFullYear()}`; },
    short: (iso: string) => { const x = d(iso); return `${x.getDate()} ${t(`months.${x.getMonth()}`)}`; },
    dow: (iso: string) => t(`days.${d(iso).getDay()}`),
    dayNum: (iso: string) => String(d(iso).getDate()),
    rel: (iso: string) => { const day = iso.slice(0, 10); if (day === TODAY) return t('common.today'); const y = new Date(TODAY + 'T00:00:00'); y.setDate(y.getDate() - 1); if (day === y.toISOString().slice(0, 10)) return t('common.yesterday'); const tm = new Date(TODAY + 'T00:00:00'); tm.setDate(tm.getDate() + 1); if (day === tm.toISOString().slice(0, 10)) return t('common.tomorrow'); const x = d(day); return `${x.getDate()} ${t(`months.${x.getMonth()}`)}`; },
    time: (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); const ap = h >= 12 ? (lang === 'ar' ? 'م' : 'PM') : (lang === 'ar' ? 'ص' : 'AM'); const hh = h % 12 || 12; return `${hh}:${String(m).padStart(2, '0')} ${ap}`; },
    clock: (iso: string) => { const x = d(iso); const h = x.getHours(); const m = x.getMinutes(); const ap = h >= 12 ? (lang === 'ar' ? 'م' : 'PM') : (lang === 'ar' ? 'ص' : 'AM'); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ap}`; },
  };
}
