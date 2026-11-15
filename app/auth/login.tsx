import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Button, Input, Segmented, Icon } from '../../src/components';
import { colors } from '../../src/theme';
import { isEmail, isUaePhone, formatPhone } from '../../src/utils/validate';
import { authService } from '../../src/services/authService';

/** A05 Login */
export default function Login() {
  const { t, lang, setLang } = useI18n();
  const [mode, setMode] = useState<'phone' | 'email'>('phone');
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    const e: Record<string, string> = {};
    if (!id) e.id = t('common.required'); else if (mode === 'phone' ? !isUaePhone(id) : !isEmail(id)) e.id = mode === 'phone' ? t('common.invalidPhone') : t('common.invalidEmail');
    if (!pw) e.pw = t('common.required'); else if (pw.length < 6) e.pw = t('common.passwordShort');
    setErr(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    await authService.login(id, pw);
    setLoading(false);
    router.push({ pathname: '/auth/otp', params: { mode: 'login', to: mode === 'phone' ? '+971 ' + id : id } });
  };
  return (
    <Screen header={{ right: <Pressable testID="login-lang" onPress={() => setLang(lang === 'ar' ? 'en' : 'ar')}><Row gap={4}><Icon name="globe-outline" size={18} /><T v="captionStrong">{lang === 'ar' ? 'EN' : 'ع'}</T></Row></Pressable> }}>
      <Col gap={6}>
        <T v="display">{t('auth.loginTitle')}</T>
        <T v="body" color={colors.textMuted}>{t('auth.loginSub')}</T>
      </Col>
      <Segmented items={[{ key: 'phone', label: t('auth.usePhone') }, { key: 'email', label: t('auth.useEmail') }]} value={mode} onChange={(m) => { setMode(m); setId(''); setErr({}); }} />
      {mode === 'phone' ? (
        <Input testID="login-id" label={t('auth.phone')} prefix="+971" keyboardType="phone-pad" placeholder="50 123 4567" value={id} onChangeText={(v) => setId(formatPhone(v))} error={err.id} />
      ) : (
        <Input testID="login-id" label={t('auth.email')} icon="mail-outline" keyboardType="email-address" autoCapitalize="none" placeholder="name@example.ae" value={id} onChangeText={setId} error={err.id} />
      )}
      <Input testID="login-pw" label={t('auth.password')} icon="lock-closed-outline" secure placeholder="••••••••" value={pw} onChangeText={setPw} error={err.pw} />
      <Pressable testID="login-forgot" onPress={() => router.push('/auth/forgot')} style={{ alignSelf: 'flex-end' }}>
        <T v="captionStrong" color={colors.yellowDark}>{t('auth.forgot')}</T>
      </Pressable>
      <Button testID="login-submit" title={t('auth.login')} onPress={submit} loading={loading} />
      <Row gap={6} justify="center">
        <T v="body" color={colors.textMuted}>{t('auth.noAccount')}</T>
        <Pressable testID="login-register" onPress={() => router.replace('/auth/register')}><T v="bodyStrong" color={colors.yellowDark}>{t('auth.createAccount')}</T></Pressable>
      </Row>
    </Screen>
  );
}
