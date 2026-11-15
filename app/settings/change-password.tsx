import React, { useState } from 'react';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, Button, Input, useToast } from '../../src/components';
import { authService } from '../../src/services/authService';

/** P06 Change password */
export default function ChangePassword() {
  const { t } = useI18n();
  const toast = useToast();
  const [f, setF] = useState({ cur: '', pw: '', pw2: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const save = async () => {
    const e: Record<string, string> = {};
    if (!f.cur) e.cur = t('common.required');
    if (f.pw.length < 8) e.pw = t('common.passwordShort');
    if (f.pw !== f.pw2) e.pw2 = t('common.passwordMatch');
    setErr(e); if (Object.keys(e).length) return;
    setBusy(true); await authService.changePassword(f.cur, f.pw); setBusy(false);
    toast(t('settings.changed')); router.back();
  };
  return (
    <Screen title={t('settings.cpTitle')} footer={<Button testID="cp-save" title={t('auth.update')} loading={busy} onPress={save} />}>
      <Input testID="cp-cur" label={t('settings.current')} icon="lock-closed-outline" secure value={f.cur} onChangeText={(v) => setF({ ...f, cur: v })} error={err.cur} />
      <Input testID="cp-new" label={t('auth.newPass')} icon="key-outline" secure value={f.pw} onChangeText={(v) => setF({ ...f, pw: v })} error={err.pw} hint={t('auth.newPassSub')} />
      <Input testID="cp-new2" label={t('auth.confirmPassword')} icon="key-outline" secure value={f.pw2} onChangeText={(v) => setF({ ...f, pw2: v })} error={err.pw2} />
    </Screen>
  );
}
