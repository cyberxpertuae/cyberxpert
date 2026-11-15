import React, { useState } from 'react';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Col, Button, Input, ProgressBar } from '../../src/components';
import { colors } from '../../src/theme';
import { authService } from '../../src/services/authService';

const strength = (p: string) => (p.length >= 10 && /\d/.test(p) && /[A-Z]/.test(p) ? 3 : p.length >= 8 && /\d/.test(p) ? 2 : p.length ? 1 : 0);

/** A10 New password */
export default function NewPassword() {
  const { t } = useI18n();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const s = strength(pw);
  const submit = async () => {
    const e: Record<string, string> = {};
    if (pw.length < 8) e.pw = t('common.passwordShort');
    if (pw !== pw2) e.pw2 = t('common.passwordMatch');
    setErr(e); if (Object.keys(e).length) return;
    setLoading(true); await authService.resetPassword(pw); setLoading(false);
    router.replace('/auth/reset-success');
  };
  return (
    <Screen header={{}}>
      <Col gap={6}>
        <T v="display">{t('auth.newPassTitle')}</T>
        <T v="body" color={colors.textMuted}>{t('auth.newPassSub')}</T>
      </Col>
      <Input testID="np-pw" label={t('auth.newPass')} icon="lock-closed-outline" secure value={pw} onChangeText={setPw} error={err.pw} />
      <Col gap={6}>
        <ProgressBar value={s / 3} color={s === 3 ? colors.success : s === 2 ? colors.yellow : colors.danger} />
        <T v="caption" color={colors.textMuted}>{t('auth.strength', { s: s === 3 ? t('auth.strong') : s === 2 ? t('auth.medium') : t('auth.weak') })}</T>
      </Col>
      <Input testID="np-pw2" label={t('auth.confirmPassword')} icon="lock-closed-outline" secure value={pw2} onChangeText={setPw2} error={err.pw2} />
      <Button testID="np-submit" title={t('auth.update')} onPress={submit} loading={loading} />
    </Screen>
  );
}
