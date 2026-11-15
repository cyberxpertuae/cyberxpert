import React from 'react';
import { Switch } from 'react-native';
import { router } from 'expo-router';
import { useI18n, Lang } from '../../src/i18n';
import { Screen, T, Row, Col, Card, ListRow, Divider, Segmented, useToast } from '../../src/components';
import { colors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { notificationsService } from '../../src/services/notificationsService';

/** P05 Settings */
export default function Settings() {
  const { t, lang, setLang } = useI18n();
  const toast = useToast();
  const prefs = useApp((s) => s.notifPrefs);
  const units = useApp((s) => s.units);
  const user = useApp((s) => s.user);
  return (
    <Screen title={t('settings.title')}>
      <T v="captionStrong" color={colors.textMuted}>{t('common.language').toUpperCase()}</T>
      <Segmented items={[{ key: 'ar', label: 'العربية' }, { key: 'en', label: 'English' }]} value={lang} onChange={(l: Lang) => { setLang(l); toast(l === 'ar' ? 'تم تغيير اللغة' : 'Language updated'); }} />
      <T v="captionStrong" color={colors.textMuted}>{t('settings.notifications').toUpperCase()}</T>
      <Card style={{ paddingVertical: 4 }}>
        {(['offers', 'bookings', 'membership', 'workouts'] as const).map((k, i) => (
          <Row key={k} gap={12} style={{ paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}>
            <T v="bodyStrong" style={{ flex: 1 }}>{t(`settings.n_${k}`)}</T>
            <Switch testID={`pref-${k}`} value={prefs[k]} onValueChange={(v) => notificationsService.setPref(k, v)} trackColor={{ true: colors.yellow, false: colors.border }} thumbColor="#fff" />
          </Row>
        ))}
      </Card>
      <T v="captionStrong" color={colors.textMuted}>{t('settings.units').toUpperCase()}</T>
      <Segmented items={[{ key: 'kg', label: 'kg · cm' }, { key: 'lb', label: 'lb · in' }]} value={units} onChange={(u) => useApp.getState().set({ units: u })} />
      {user ? (
        <Col gap={8}>
          <T v="captionStrong" color={colors.textMuted}>{t('settings.account').toUpperCase()}</T>
          <Card style={{ paddingVertical: 4 }}>
            <ListRow testID="set-password" icon="lock-closed-outline" title={t('settings.changePassword')} onPress={() => router.push('/settings/change-password')} />
            <Divider />
            <ListRow testID="set-delete" icon="trash-outline" title={t('settings.deleteAccount')} danger onPress={() => router.push('/settings/delete-account')} />
          </Card>
        </Col>
      ) : null}
    </Screen>
  );
}
