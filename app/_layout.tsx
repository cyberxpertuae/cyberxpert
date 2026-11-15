import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Cairo_400Regular, Cairo_500Medium, Cairo_600SemiBold, Cairo_700Bold } from '@expo-google-fonts/cairo';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider, useI18n } from '../src/i18n';
import { ToastProvider, Sheet, Button, T, Col } from '../src/components';
import { useApp } from '../src/store/app';
import { colors } from '../src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function GuestGate() {
  const { t } = useI18n();
  const open = useApp((s) => s.guestGate);
  const set = useApp((s) => s.set);
  const close = () => set({ guestGate: false });
  return (
    <Sheet visible={open} onClose={close} title={t('guest.title')}>
      <Col gap={12}>
        <T v="body" color={colors.textMuted}>{t('guest.body')}</T>
        <Button testID="gate-register" title={t('guest.create')} onPress={() => { close(); router.push('/auth/register'); }} />
        <Button testID="gate-login" title={t('guest.login')} variant="outline" onPress={() => { close(); router.push('/auth/login'); }} />
      </Col>
    </Sheet>
  );
}

function Nav() {
  const { isRTL, ready } = useI18n();
  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.black }} />;
  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: isRTL ? 'slide_from_left' : 'slide_from_right', contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="staff/(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="training/session" options={{ gestureEnabled: false }} />
      </Stack>
      <GuestGate />
    </>
  );
}

export default function Root() {
  const [loaded] = useFonts({ Cairo_400Regular, Cairo_500Medium, Cairo_600SemiBold, Cairo_700Bold });
  useEffect(() => { if (loaded) SplashScreen.hideAsync().catch(() => {}); }, [loaded]);
  if (!loaded) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <ToastProvider>
            <Nav />
          </ToastProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
