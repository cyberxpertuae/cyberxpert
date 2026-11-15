import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Button, Input, Chip, Icon } from '../../src/components';
import { colors } from '../../src/theme';
import { isEmail, isUaePhone, formatPhone } from '../../src/utils/validate';
import { authService } from '../../src/services/authService';

/** A06 Register */
export default function Register() {
  const { t } = useI18n();
  const [f, setF] = useState({ name: '', phone: '', email: '', gender: 'male', dob: '', pw: '' });
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const up = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v });
  const submit = async () => {
    const e: Record<string, string> = {};
    if (f.name.trim().length < 3) e.name = t('common.required');
    if (!isUaePhone(f.phone)) e.phone = t('common.invalidPhone');
    if (!isEmail(f.email)) e.email = t('common.invalidEmail');
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(f.dob)) e.dob = 'DD/MM/YYYY';
    if (f.pw.length < 8) e.pw = t('common.passwordShort');
    if (!agree) e.terms = t('auth.termsErr');
    setErr(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    const [dd, mm, yy] = f.dob.split('/');
    await authService.register({ name: f.name.trim(), phone: f.phone, email: f.email, gender: f.gender, dob: `${yy}-${mm}-${dd}` });
    setLoading(false);
    router.push({ pathname: '/auth/otp', params: { mode: 'register', to: '+971 ' + f.phone } });
  };
  const dobMask = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 8); return [d.slice(0, 2), d.slice(2, 4), d.slice(4, 8)].filter(Boolean).join('/'); };
  return (
    <Screen header={{}}>
      <Col gap={6}>
        <T v="display">{t('auth.registerTitle')}</T>
        <T v="body" color={colors.textMuted}>{t('auth.registerSub')}</T>
      </Col>
      <Input testID="reg-name" label={t('auth.fullName')} icon="person-outline" placeholder={t('auth.namePh')} value={f.name} onChangeText={up('name')} error={err.name} />
      <Input testID="reg-phone" label={t('auth.phone')} prefix="+971" keyboardType="phone-pad" placeholder="50 123 4567" value={f.phone} onChangeText={(v) => up('phone')(formatPhone(v))} error={err.phone} />
      <Input testID="reg-email" label={t('auth.email')} icon="mail-outline" keyboardType="email-address" autoCapitalize="none" placeholder="name@example.ae" value={f.email} onChangeText={up('email')} error={err.email} />
      <Col gap={6}>
        <T v="captionStrong" color={colors.textMuted}>{t('auth.gender')}</T>
        <Row gap={8}>
          <Chip testID="reg-male" label={t('gender.male')} icon="male" selected={f.gender === 'male'} onPress={() => up('gender')('male')} />
          <Chip testID="reg-female" label={t('gender.female')} icon="female" selected={f.gender === 'female'} onPress={() => up('gender')('female')} />
        </Row>
      </Col>
      <Input testID="reg-dob" label={t('auth.dob')} icon="calendar-outline" keyboardType="number-pad" placeholder="DD/MM/YYYY" value={f.dob} onChangeText={(v) => up('dob')(dobMask(v))} error={err.dob} />
      <Input testID="reg-pw" label={t('auth.password')} icon="lock-closed-outline" secure placeholder="••••••••" value={f.pw} onChangeText={up('pw')} error={err.pw} hint={t('auth.newPassSub')} />
      <Pressable testID="reg-terms" onPress={() => setAgree(!agree)}>
        <Row gap={10}>
          <View style={{ width: 24, height: 24, borderRadius: 7, backgroundColor: agree ? colors.black : colors.surface, borderWidth: 1.5, borderColor: agree ? colors.black : colors.border, alignItems: 'center', justifyContent: 'center' }}>
            {agree ? <Icon name="checkmark" size={16} color={colors.yellow} /> : null}
          </View>
          <T v="body" style={{ flex: 1 }}>{t('auth.terms')}</T>
        </Row>
      </Pressable>
      {err.terms ? <T v="caption" color={colors.danger}>{err.terms}</T> : null}
      <Button testID="reg-submit" title={t('auth.createAccount')} onPress={submit} loading={loading} />
      <Row gap={6} justify="center">
        <T v="body" color={colors.textMuted}>{t('auth.haveAccount')}</T>
        <Pressable onPress={() => router.replace('/auth/login')}><T v="bodyStrong" color={colors.yellowDark}>{t('auth.login')}</T></Pressable>
      </Row>
    </Screen>
  );
}
