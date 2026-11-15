import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { useI18n } from '../src/i18n';
import { T, Row, Col, Button, Icon } from '../src/components';
import { colors, radius } from '../src/theme';
import { images } from '../src/data/images';
import { authService } from '../src/services/authService';

/** A04 Welcome — in the spirit of the reference: bold yellow, dark CTA */
export default function Welcome() {
  const { t, lang, setLang } = useI18n();
  return (
    <View style={{ flex: 1, backgroundColor: colors.yellow }}>
      <StatusBar style="dark" />
      <LinearGradient colors={['#FFD54A', colors.yellow, '#F5B400']} style={{ position: 'absolute', width: '100%', height: '100%' }} />
      <SafeAreaView style={{ flex: 1, padding: 20 }}>
        <Row justify="space-between">
          <Image source={images.icon} style={{ width: 48, height: 48, borderRadius: 14 }} />
          <Pressable testID="welcome-lang" onPress={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={{ backgroundColor: 'rgba(11,11,12,0.08)', borderRadius: radius.pill, paddingHorizontal: 14, height: 36, justifyContent: 'center' }}>
            <Row gap={6}><Icon name="globe-outline" size={16} /><T v="captionStrong">{lang === 'ar' ? 'English' : 'العربية'}</T></Row>
          </Pressable>
        </Row>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 250, height: 250, borderRadius: 125, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 30, shadowOffset: { width: 0, height: 18 }, elevation: 12 }}>
            <Image source={images.logo} style={{ width: 210, height: 210 }} contentFit="contain" />
          </View>
        </View>
        <Col gap={10}>
          <T v="display" size={30} center>{t('welcome.title')}</T>
          <T v="body" center color="#3B3B3B" style={{ marginBottom: 10 }}>{t('welcome.body')}</T>
          <Button testID="welcome-new" title={t('welcome.new')} variant="dark" onPress={() => router.push('/auth/register')} />
          <Button testID="welcome-signin" title={t('welcome.signin')} variant="outline" style={{ backgroundColor: 'rgba(255,255,255,0.55)', borderColor: 'transparent' }} onPress={() => router.push('/auth/login')} />
          <Pressable testID="welcome-guest" onPress={async () => { await authService.continueAsGuest(); router.replace('/(tabs)/home'); }} style={{ paddingVertical: 10 }}>
            <T v="bodyStrong" center style={{ textDecorationLine: 'underline' }}>{t('welcome.guest')}</T>
          </Pressable>
        </Col>
      </SafeAreaView>
    </View>
  );
}
