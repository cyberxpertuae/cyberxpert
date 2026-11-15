import React, { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Button, Icon, useToast } from '../../src/components';
import { colors, fonts, radius } from '../../src/theme';
import { authService } from '../../src/services/authService';

/** A07 OTP verification (login / register / reset) */
export default function Otp() {
  const { t } = useI18n();
  const toast = useToast();
  const { mode = 'login', to = '' } = useLocalSearchParams<{ mode: string; to: string }>();
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [sec, setSec] = useState(30);
  const ref = useRef<TextInput>(null);
  useEffect(() => { const id = setInterval(() => setSec((s) => (s > 0 ? s - 1 : 0)), 1000); return () => clearInterval(id); }, []);
  const verify = async (c = code) => {
    if (c.length !== 4) { setErr(t('auth.otpErr')); return; }
    setErr(''); setLoading(true);
    await authService.verifyOtp(c, mode);
    setLoading(false);
    if (mode === 'register') router.replace('/setup/goal');
    else if (mode === 'reset') router.replace('/auth/new-password');
    else router.replace('/(tabs)/home');
  };
  return (
    <Screen header={{}}>
      <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: colors.yellowSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="chatbubble-ellipses-outline" size={34} color={colors.yellowDark} />
      </View>
      <Col gap={6}>
        <T v="display">{t('auth.otpTitle')}</T>
        <T v="body" color={colors.textMuted}>{t('auth.otpSub', { to })}</T>
      </Col>
      <Pressable onPress={() => ref.current?.focus()}>
        <Row gap={12} justify="center" style={{ direction: 'ltr', flexDirection: 'row' } as any}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={{ width: 64, height: 70, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: err ? colors.danger : code.length === i ? colors.yellow : colors.border, alignItems: 'center', justifyContent: 'center' }}>
              <T v="h1" size={28} center>{code[i] ?? ''}</T>
            </View>
          ))}
        </Row>
      </Pressable>
      <TextInput testID="otp-input" ref={ref} value={code} autoFocus keyboardType="number-pad" maxLength={4} onChangeText={(v) => { const c = v.replace(/\D/g, ''); setCode(c); setErr(''); if (c.length === 4) verify(c); }} style={{ position: 'absolute', opacity: 0.01, height: 1, width: 1, fontFamily: fonts.regular }} />
      {err ? <T v="caption" center color={colors.danger}>{err}</T> : null}
      <View style={{ backgroundColor: colors.yellowSoft, borderRadius: radius.md, padding: 10 }}>
        <T v="caption" center>{t('auth.otpHint')}</T>
      </View>
      <Button testID="otp-verify" title={t('auth.verify')} onPress={() => verify()} loading={loading} />
      {sec > 0 ? (
        <T v="body" center color={colors.textMuted}>{t('auth.resendIn', { s: sec })}</T>
      ) : (
        <Pressable testID="otp-resend" onPress={async () => { await authService.resend(); setSec(30); toast(t('auth.resent')); }}>
          <T v="bodyStrong" center color={colors.yellowDark}>{t('auth.resend')}</T>
        </Pressable>
      )}
    </Screen>
  );
}
