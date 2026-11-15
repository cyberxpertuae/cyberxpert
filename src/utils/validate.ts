export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());
/** UAE mobile: 5X XXX XXXX (9 digits after +971), tolerant of spaces / leading 0 */
export const isUaePhone = (s: string) => /^0?5\d{8}$/.test(s.replace(/\s|-/g, ''));
export const isCard = (s: string) => /^\d{16}$/.test(s.replace(/\s/g, ''));
export const isExpiry = (s: string) => {
  const m = /^(\d{2})\/(\d{2})$/.exec(s.trim());
  if (!m) return false;
  const mm = +m[1];
  return mm >= 1 && mm <= 12;
};
export const formatCard = (s: string) => s.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
export const formatPhone = (s: string) => {
  const d = s.replace(/\D/g, '').replace(/^0/, '').slice(0, 9);
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 9)].filter(Boolean).join(' ');
};
export const delay = (ms = 450) => new Promise((r) => setTimeout(r, ms));
