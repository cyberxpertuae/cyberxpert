import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Button, Input, Icon } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { images } from '../../src/data/images';
import { authService } from '../../src/services/authService';

/** R01 Staff login */
export default function StaffLogin() {
  const { t, lang, setLang } = useI18n();
  const [id, setId] = useState('ST-007');
  const [pin, setPin] = useState('');
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    const e: Record<string, string> = {};
    if (!id.trim()) e.id = t('common.required');
    if (!/^\d{4}$/.test(pin)) e.pin = t('staff.pinErr');
    setErr(e); if (Object.keys(e).length) return;
    setBusy(true); await authService.staffLogin(id, pin); setBusy(false);
    router.replace('/staff/(tabs)/dashboard');
  };
  return (
    <Screen bg={colors.black} dark header={{ back: false, right: <Pressable testID="st-lang" onPress={() => setLang(lang === 'ar' ? 'en' : 'ar')}><Row gap={4}><Icon name="globe-outline" size={18} color={colors.onDark} /><T v="captionStrong" color={colors.onDark}>{lang === 'ar' ? 'EN' : 'ع'}</T></Row></Pressable> }}>
      <Col style={{ alignItems: 'center', marginTop: 20 }} gap={8}>
        <Image source={images.logo} style={{ width: 130, height: 130 }} contentFit="contain" />
        <T v="display" color={colors.onDark}>{t('staff.loginTitle')}</T>
        <T v="body" color={colors.gold}>{t('staff.loginSub')}</T>
      </Col>
      <View style={{ backgroundColor: colors.bg, borderRadius: radius.xl, padding: 16, gap: 14, marginTop: 10 }}>
        <Input testID="st-id" label={t('staff.staffId')} icon="id-card-outline" autoCapitalize="characters" value={id} onChangeText={setId} error={err.id} />
        <Input testID="st-pin" label={t('staff.pin')} icon="keypad-outline" keyboardType="number-pad" secure maxLength={4} value={pin} onChangeText={(v) => setPin(v.replace(/\D/g, ''))} error={err.pin} />
        <Row gap={8} style={{ backgroundColor: colors.yellowSoft, borderRadius: radius.md, padding: 10 }}><Icon name="information-circle-outline" size={18} color={colors.yellowDark} /><T v="caption">{t('staff.demo')}</T></Row>
        <Button testID="st-login" title={t('auth.login')} loading={busy} onPress={submit} />
      </View>
    </Screen>
  );
}
