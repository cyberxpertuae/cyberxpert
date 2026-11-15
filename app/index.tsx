import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { router } from 'expo-router';
import { VARIANT } from '../src/config';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { useI18n } from '../src/i18n';
import { useApp } from '../src/store/app';
import { T } from '../src/components';
import { colors } from '../src/theme';
import { images } from '../src/data/images';


/** A01 Splash */
export default function Splash() {
  const { t, hasChosen } = useI18n();
  const scale = useRef(new Animated.Value(0.7)).current;
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 700, delay: 250, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
    const id = setTimeout(() => {
      const s = useApp.getState();
      if (VARIANT === 'staff') router.replace(s.staffSignedIn ? '/staff/(tabs)/dashboard' : '/staff/login');
      else if (!hasChosen) router.replace('/language');
      else if (s.user || s.guest) router.replace('/(tabs)/home');
      else router.replace('/welcome');
    }, 1700);
    return () => clearTimeout(id);
  }, [hasChosen, scale, fade]);
  return (
    <View style={{ flex: 1, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' }} testID="splash">
      <StatusBar style="light" />
      <Animated.View style={{ transform: [{ scale }] }}>
        <Image source={images.logo} style={{ width: 190, height: 190 }} contentFit="contain" />
      </Animated.View>
      <Animated.View style={{ opacity: fade, marginTop: 18, alignItems: 'center' }}>
        <T v="h1" size={26} color={colors.onDark} center style={{ letterSpacing: 4 }}>EMPIRE GYM</T>
        <T v="caption" color={colors.gold} center>{VARIANT === 'staff' ? t('staff.appName') : t('splash.tagline')}</T>
      </Animated.View>
    </View>
  );
}
