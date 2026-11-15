import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Segmented, EmptyState, IconName, SkeletonList } from '../src/components';
import { colors } from '../src/theme';
import { useApp } from '../src/store/app';
import { notificationsService } from '../src/services/notificationsService';
import { useAsync } from '../src/utils/useAsync';
import { useFmt } from '../src/utils/format';

/** H03 Notifications */
export default function Notifications() {
  const { t, tr } = useI18n();
  const f = useFmt();
  const [tab, setTab] = useState<'all' | 'offers' | 'bookings' | 'membership'>('all');
  const list = useApp((s) => s.notifications);
  const { loading, refreshing, refresh } = useAsync(() => notificationsService.list(), []);
  const items = list.filter((n) => tab === 'all' || n.type === tab);
  return (
    <Screen title={t('notif.title')} header={{ right: <Pressable testID="notif-markall" onPress={notificationsService.markAll}><T v="captionStrong" color={colors.yellowDark}>{t('notif.markAll')}</T></Pressable> }} refreshing={refreshing} onRefresh={refresh}>
      <Segmented items={[{ key: 'all', label: t('common.all') }, { key: 'offers', label: t('notif.offers') }, { key: 'bookings', label: t('notif.bookings') }, { key: 'membership', label: t('notif.membership') }]} value={tab} onChange={setTab} />
      {loading ? <SkeletonList rows={6} card={64} /> : items.length === 0 ? <EmptyState icon="notifications-off-outline" title={t('notif.empty')} body={t('notif.emptyBody')} /> : items.map((n) => (
        <Card key={n.id} testID={`notif-${n.id}`} onPress={() => { notificationsService.markRead(n.id); router.push(n.link as any); }} style={{ backgroundColor: n.read ? colors.surface : '#FFFBEA' }}>
          <Row gap={12} align="flex-start">
            <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: n.type === 'offers' ? colors.yellowSoft : n.type === 'bookings' ? colors.infoSoft : colors.successSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={`${n.icon}-outline` as IconName} size={20} color={n.type === 'offers' ? colors.yellowDark : n.type === 'bookings' ? colors.info : colors.success} />
            </View>
            <Col style={{ flex: 1 }} gap={2}>
              <Row justify="space-between" gap={8}>
                <T v="bodyStrong" style={{ flex: 1 }}>{tr(n.title)}</T>
                {!n.read ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger }} /> : null}
              </Row>
              <T v="caption" color={colors.textMuted}>{tr(n.body)}</T>
              <T v="micro" color={colors.textSubtle}>{f.rel(n.time)} · {f.clock(n.time)}</T>
            </Col>
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
