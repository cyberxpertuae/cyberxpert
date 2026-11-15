import Constants from 'expo-constants';
export const VARIANT: 'member' | 'staff' = ((Constants.expoConfig?.extra as any)?.variant ?? 'member') as any;
