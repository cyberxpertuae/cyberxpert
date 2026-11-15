import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en.json';
import ar from './ar.json';

export type Lang = 'ar' | 'en';
export type Bi = { en: string; ar: string };

const dict: Record<Lang, Record<string, string>> = { en: en as Record<string, string>, ar: ar as Record<string, string> };
const KEY = 'empire.lang';

type Ctx = {
  lang: Lang;
  isRTL: boolean;
  ready: boolean;
  hasChosen: boolean;
  setLang: (l: Lang) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  /** pick the right side of a bilingual mock value */
  tr: (v?: Bi | string | null) => string;
  row: 'row' | 'row-reverse';
  align: 'left' | 'right';
  start: 'left' | 'right';
  end: 'left' | 'right';
  /** number formatting with Western digits (common in UAE apps) */
  num: (n: number, digits?: number) => string;
  money: (n: number) => string;
};

const LangContext = createContext<Ctx | null>(null);

const toNum = (n: number, digits = 0) =>
  n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar');
  const [ready, setReady] = useState(false);
  const [hasChosen, setHasChosen] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v === 'en' || v === 'ar') {
          setLangState(v);
          setHasChosen(true);
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    setHasChosen(true);
    AsyncStorage.setItem(KEY, l).catch(() => {});
  }, []);

  const value = useMemo<Ctx>(() => {
    const isRTL = lang === 'ar';
    const t = (key: string, params?: Record<string, string | number>) => {
      let s = dict[lang][key] ?? dict.en[key] ?? key;
      if (params) for (const [k, v] of Object.entries(params)) s = s.split(`{${k}}`).join(String(v));
      return s;
    };
    const tr = (v?: Bi | string | null) => (v == null ? '' : typeof v === 'string' ? v : v[lang] ?? v.en);
    return {
      lang,
      isRTL,
      ready,
      hasChosen,
      setLang,
      t,
      tr,
      row: isRTL ? 'row-reverse' : 'row',
      align: isRTL ? 'right' : 'left',
      start: isRTL ? 'right' : 'left',
      end: isRTL ? 'left' : 'right',
      num: toNum,
      money: (n: number) => (isRTL ? `${toNum(n, n % 1 ? 2 : 0)} د.إ` : `AED ${toNum(n, n % 1 ? 2 : 0)}`),
    };
  }, [lang, ready, hasChosen, setLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n() {
  const c = useContext(LangContext);
  if (!c) throw new Error('useI18n outside provider');
  return c;
}
