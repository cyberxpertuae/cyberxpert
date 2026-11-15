import type { ExpoConfig } from 'expo/config';

const VARIANT = (process.env.APP_VARIANT || 'member') as 'member' | 'staff';
const isStaff = VARIANT === 'staff';

const config: ExpoConfig = {
  name: isStaff ? 'Empire Gym Staff' : 'Empire Gym',
  slug: 'empire-gym',
  scheme: isStaff ? 'empiregymstaff' : 'empiregym',
  version: '1.0.0',
  orientation: 'portrait',
  icon: isStaff ? './assets/icon-staff.png' : './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: { image: './assets/splash-icon.png', resizeMode: 'contain', backgroundColor: '#0B0B0C' },
  android: {
    package: isStaff ? 'ae.duneai.empiregym.staff' : 'ae.duneai.empiregym.member',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: isStaff ? './assets/adaptive-icon-staff.png' : './assets/adaptive-icon.png',
      backgroundColor: '#0B0B0C',
    },
    edgeToEdgeEnabled: true,
    softwareKeyboardLayoutMode: 'resize',
    permissions: ['android.permission.CAMERA'],
  },
  web: { favicon: './assets/favicon.png', bundler: 'metro', output: 'single' },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-web-browser',
    ['expo-splash-screen', { image: './assets/splash-icon.png', imageWidth: 200, backgroundColor: '#0B0B0C' }],
    ['expo-camera', { cameraPermission: 'Allow Empire Gym to scan machine and check-in QR codes.' }],
  ],
  experiments: { typedRoutes: false },
  extra: { variant: VARIANT },
};

export default config;
