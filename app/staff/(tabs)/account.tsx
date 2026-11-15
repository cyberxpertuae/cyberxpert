import React, { useState } from 'react';
import { router } from 'expo-router';
import { useI18n } from '../../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, ListRow, Divider, Dialog, KV, Segmented } from '../../../src/components';
import { colors } from '../../../src/theme';
import { authService } from '../../../src/services/authService';
import staffData from '../../../src/data/mock/staff.json';

/** R13 Staff profile & settings */
export default function Account() {
  const { t, tr, lang, setLang } = useI18n();
  const [out, setOut] = useState(false);
  return (
    <Screen title={t('staff.accountTitle')} header={{ back: false }}>
      <Card style={{ backgroundColor: colors.black, alignItems: 'center', gap: 6, paddingVertical: 24 }}>
        <Icon name="person-circle" size={72} color={colors.yellow} />
        <T v="h1" color={colors.onDark}>{tr(staffData.staff.name)}</T>
        <T v="caption" color={colors.gold}>{staffData.staff.id}</T>
      </Card>
      <Card><KV k={t('staff.role')} v={tr(staffData.staff.role)} /><KV k={t('staff.shift', { s: '' }).trim()} v={staffData.staff.shift} /></Card>
      <T v="captionStrong" color={colors.textMuted}>{t('common.language').toUpperCase()}</T>
      <Segmented items={[{ key: 'ar', label: 'العربية' }, { key: 'en', label: 'English' }]} value={lang} onChange={setLang} />
      <Card style={{ paddingVertical: 4 }}>
        <ListRow icon="time-outline" title={t('staff.visitsTitle')} onPress={() => router.push('/staff/visits')} />
        <Divider />
        <ListRow icon="help-circle-outline" title={t('profile.help')} onPress={() => router.push('/info/faq')} />
        <Divider />
        <ListRow testID="st-logout" icon="log-out-outline" title={t('profile.logout')} danger chevron={false} onPress={() => setOut(true)} />
      </Card>
      <Col />
      <Dialog visible={out} onClose={() => setOut(false)} danger icon="log-out-outline" title={t('profile.logoutQ')} confirm={t('profile.logout')} cancel={t('common.cancel')} onConfirm={async () => { await authService.staffLogout(); setOut(false); router.replace('/staff/login'); }} />
      <Row />
    </Screen>
  );
}
