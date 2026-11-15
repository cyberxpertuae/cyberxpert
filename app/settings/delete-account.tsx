import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Icon, Button, Input, OptionCard, Dialog, useToast } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { authService } from '../../src/services/authService';

/** P12 Delete account */
export default function DeleteAccount() {
  const { t } = useI18n();
  const toast = useToast();
  const [reason, setReason] = useState('r1');
  const [word, setWord] = useState('');
  const [q, setQ] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <Screen title={t('settings.delTitle')} footer={<Button testID="del-btn" title={t('settings.delBtn')} variant="danger" disabled={word.trim().toUpperCase() !== 'DELETE'} onPress={() => setQ(true)} />}>
      <Row gap={10} align="flex-start" style={{ backgroundColor: colors.dangerSoft, borderRadius: radius.lg, padding: 14 }}>
        <Icon name="warning-outline" color={colors.danger} />
        <T v="body" style={{ flex: 1 }}>{t('settings.delWarn')}</T>
      </Row>
      <T v="h3">{t('settings.delReason')}</T>
      {['r1', 'r2', 'r3', 'r4'].map((r) => <OptionCard key={r} title={t(`settings.${r}`)} selected={reason === r} onPress={() => setReason(r)} />)}
      <Input testID="del-word" label={t('settings.delConfirm')} autoCapitalize="characters" value={word} onChangeText={setWord} placeholder="DELETE" />
      <View />
      <Dialog visible={q} onClose={() => setQ(false)} danger icon="trash-outline" title={t('settings.delQ')} body={t('settings.delQBody')} confirm={t('common.delete')} cancel={t('common.cancel')} loading={busy}
        onConfirm={async () => { setBusy(true); await authService.deleteAccount(reason); setBusy(false); setQ(false); toast(t('settings.deleted'), 'info'); router.replace('/welcome'); }} />
    </Screen>
  );
}
