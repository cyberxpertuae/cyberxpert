// Empire Gym design tokens — mirrors the Figma "Empire Tokens" collection.
export const colors = {
  black: '#0B0B0C',
  ink2: '#17181B',
  ink3: '#24262B',
  gold: '#D4A22B',
  yellow: '#FFC20E',
  yellowDark: '#E0A800',
  yellowSoft: '#FFF4D1',
  silver: '#C7CBD1',
  bg: '#F6F6F3',
  surface: '#FFFFFF',
  surface2: '#F0F0EC',
  text: '#121316',
  textMuted: '#6B6F76',
  textSubtle: '#9A9EA5',
  onDark: '#FFFFFF',
  onDarkMuted: 'rgba(255,255,255,0.64)',
  border: '#E7E7E2',
  success: '#1F9D55',
  successSoft: '#E3F5EA',
  warning: '#F08C00',
  warningSoft: '#FFF0DB',
  danger: '#E5484D',
  dangerSoft: '#FDECEC',
  info: '#2F6FED',
  infoSoft: '#E6EEFE',
  bronze: '#B87333',
  silverTier: '#A7ADB5',
  goldTier: '#D4A22B',
  platinum: '#6E7B8B',
  overlay: 'rgba(11,11,12,0.55)',
  protein: '#2F6FED',
  carbs: '#FFC20E',
  fat: '#E5484D',
};

export const tierColors: Record<string, string> = {
  bronze: colors.bronze,
  silver: colors.silverTier,
  gold: colors.goldTier,
  platinum: colors.platinum,
};

export const spacing = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

export const fonts = {
  regular: 'Cairo_400Regular',
  medium: 'Cairo_500Medium',
  semibold: 'Cairo_600SemiBold',
  bold: 'Cairo_700Bold',
} as const;

export type FontWeight = keyof typeof fonts;

export const type = {
  display: { fontSize: 28, lineHeight: 40, weight: 'bold' as FontWeight },
  h1: { fontSize: 22, lineHeight: 32, weight: 'bold' as FontWeight },
  h2: { fontSize: 18, lineHeight: 28, weight: 'semibold' as FontWeight },
  h3: { fontSize: 16, lineHeight: 26, weight: 'semibold' as FontWeight },
  body: { fontSize: 14, lineHeight: 22, weight: 'regular' as FontWeight },
  bodyStrong: { fontSize: 14, lineHeight: 22, weight: 'semibold' as FontWeight },
  caption: { fontSize: 12, lineHeight: 19, weight: 'regular' as FontWeight },
  captionStrong: { fontSize: 12, lineHeight: 19, weight: 'semibold' as FontWeight },
  micro: { fontSize: 11, lineHeight: 17, weight: 'medium' as FontWeight },
  number: { fontSize: 34, lineHeight: 44, weight: 'bold' as FontWeight },
};
export type TypeVariant = keyof typeof type;

export const shadow = {
  card: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  raised: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  glow: { shadowColor: '#FFC20E', shadowOpacity: 0.35, shadowRadius: 20, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
};

export const VAT = 0.05;
