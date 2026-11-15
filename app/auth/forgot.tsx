import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Col, Button, Input, Icon } from '../../src/components';
import { colors } from '../../src/theme';
import { isUaePhone, formatPhone } from '../../src/utils/validate';
import { authService } from '../../src/services/authService';

/** A08 Forgot password */
export default function Forgot() {
  const { t } = useI18n();
  const [phone, setPhone] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!isUaePhone(phone)) { setErr(t('common.invalidPhone')); return; }
    setLoading(true); await authService.requestReset(phone); setLoading(false);
    router.push({ pathname: '/auth/otp', params: { mode: 'reset', to: '+971 ' + phone } });
  };
  return (
    <Screen header={{}}>
      <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: colors.yellowSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="key-outline" size={34} color={colors.yellowDark} />
      </View>
      <Col gap={6}>
        <T v="display">{t('auth.forgotTitle')}</T>
        <T v="body" color={colors.textMuted}>{t('auth.forgotSub')}</T>
      </Col>
      <Input testID="forgot-phone" label={t('auth.phone')} prefix="+971" keyboardType="phone-pad" placeholder="50 123 4567" value={phone} onChangeText={(v) => { setPhone(formatPhone(v)); setErr(''); }} error={err} />
      <Button testID="forgot-submit" title={t('auth.sendCode')} onPress={submit} loading={loading} />
    </Screen>
  );
}
