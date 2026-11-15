import React, { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useI18n } from '../../../src/i18n';
import { Screen, T, Row, Col, Card, Input, ChipRow, StatusBadge, TierBadge, SkeletonList, EmptyState, IconButton, ltr } from '../../../src/components';
import { colors } from '../../../src/theme';
import { useApp } from '../../../src/store/app';
import { staffService } from '../../../src/services/staffService';
import { catalogService } from '../../../src/services/catalogService';
import { useAsync } from '../../../src/utils/useAsync';
import { useFmt } from '../../../src/utils/format';
import { useStaffDraft } from '../../../src/store/staffDraft';

/** R07 Members list */
export default function Members() {
  const { t, tr } = useI18n();
  const f = useFmt();
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  useApp((s) => s.members);
  const c = staffService.counts();
  const { data, loading, refreshing, refresh } = useAsync(() => staffService.members(status, q), [status, q, c.all, c.active, c.frozen, c.pending]);
  return (
    <Screen title={t('tabs.members')} header={{ back: false, right: <IconButton testID="mem-add" name="person-add" bg={colors.yellow} onPress={() => { useStaffDraft.getState().reset(); router.push('/staff/new-member/details'); }} /> }} refreshing={refreshing} onRefresh={refresh}>
      <Input testID="mem-search" icon="search-outline" placeholder={t('staff.searchPh')} value={q} onChangeText={setQ} />
      <ChipRow items={(['all', 'active', 'expiring', 'expired', 'frozen', 'pending'] as const).map((k) => ({ key: k, label: `${k === 'all' ? t('common.all') : t(`status.${k}`)} ${c[k]}` }))} value={status} onChange={setStatus} />
      {loading ? <SkeletonList rows={6} card={64} /> : !data?.length ? <EmptyState icon="people-outline" title={t('staff.membersEmpty')} /> : data.map((m) => (
        <Card key={m.id} testID={`mem-${m.id}`} onPress={() => router.push(`/staff/member/${m.id}`)}>
          <Row gap={12}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' }}><T v="bodyStrong" color={colors.yellow}>{tr(m.name).slice(0, 1)}</T></View>
            <Col style={{ flex: 1 }} gap={2}>
              <Row gap={6}><T v="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>{tr(m.name)}</T><TierBadge tier={m.tier} small /></Row>
              <T v="micro" color={colors.textMuted}>{ltr(`${m.id} · +971 ${m.phone}`)}</T>
              <T v="micro" color={colors.textMuted}>{tr(catalogService.planSync(m.plan)?.name)} · {t('staff.expires', { d: f.short(m.end) })}</T>
            </Col>
            <StatusBadge status={m.status} />
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
