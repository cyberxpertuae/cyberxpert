import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Button, SectionHeader, StatusBadge, TierBadge, Skeleton, useToast, IconName, Wrap } from '../../../src/components';
import { colors, radius } from '../../../src/theme';
import { useApp } from '../../../src/store/app';
import { staffService } from '../../../src/services/staffService';
import { catalogService } from '../../../src/services/catalogService';
import { useAsync } from '../../../src/utils/useAsync';
import { useFmt } from '../../../src/utils/format';
import staffData from '../../../src/data/mock/staff.json';
import { useStaffDraft } from '../../../src/store/staffDraft';

/** R02 Staff dashboard */
export default function Dashboard() {
  const { t, tr, num, money } = useI18n();
  const f = useFmt();
  const toast = useToast();
  const today = useApp((s) => s.staffToday);
  const members = useApp((s) => s.members);
  const [tick, setTick] = useState(0);
  const { loading, refreshing, refresh } = useAsync(() => staffService.dashboard(), [tick]);
  const expiring = members.filter((m) => m.status === 'expiring');
  const pending = members.filter((m) => m.status === 'pending');
  const actions: { icon: IconName; label: string; onPress: () => void; dark?: boolean }[] = [
    { icon: 'person-add', label: t('staff.a_new'), onPress: () => { useStaffDraft.getState().reset(); router.push('/staff/new-member/details'); }, dark: true },
    { icon: 'scan', label: t('staff.a_checkin'), onPress: () => router.push('/staff/(tabs)/checkin') },
    { icon: 'cart', label: t('staff.a_sale'), onPress: () => router.push('/staff/(tabs)/pos') },
    { icon: 'search', label: t('staff.a_members'), onPress: () => router.push('/staff/(tabs)/members') },
  ];
  const row = (m: (typeof members)[number]) => (
    <Pressable key={m.id} testID={`dash-m-${m.id}`} onPress={() => router.push(`/staff/member/${m.id}`)}>
      <Row gap={10} style={{ paddingVertical: 10 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}><T v="captionStrong">{tr(m.name).slice(0, 1)}</T></View>
        <Col style={{ flex: 1 }}><T v="bodyStrong" numberOfLines={1}>{tr(m.name)}</T><T v="micro" color={colors.textMuted}>{tr(catalogService.planSync(m.plan)?.name)} · {t('staff.expires', { d: f.short(m.end) })}</T></Col>
        {m.status === 'expiring' ? <Button small full={false} title={t('staff.remind')} variant="soft" onPress={() => toast(t('staff.reminded'))} /> : <StatusBadge status={m.status} />}
      </Row>
    </Pressable>
  );
  return (
    <Screen refreshing={refreshing} onRefresh={() => { setTick(tick + 1); refresh(); }}>
      <Row justify="space-between">
        <Col><T v="h1">{t('staff.hello', { name: tr(staffData.staff.name).split(' ')[0] })}</T><T v="caption" color={colors.textMuted}>{tr(staffData.staff.role)} · {t('staff.shift', { s: staffData.staff.shift })}</T></Col>
        <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' }}><Icon name="id-card" color={colors.yellow} /></View>
      </Row>
      {loading ? <Skeleton h={110} r={24} /> : (
        <Row gap={10}>
          {[{ i: 'enter-outline', v: num(today.checkins), l: t('staff.checkins') }, { i: 'person-add-outline', v: num(today.newMembers), l: t('staff.newMembers') }, { i: 'cash-outline', v: money(today.sales), l: t('staff.sales') }].map((s, k) => (
            <Col key={k} gap={4} style={{ flex: 1, backgroundColor: k === 2 ? colors.black : colors.surface, borderRadius: radius.lg, padding: 12 }}>
              <Icon name={s.i as IconName} size={18} color={colors.yellowDark} />
              <T v="h3" color={k === 2 ? colors.yellow : colors.text} numberOfLines={1}>{s.v}</T>
              <T v="micro" color={k === 2 ? colors.onDarkMuted : colors.textMuted} numberOfLines={1}>{s.l}</T>
            </Col>
          ))}
        </Row>
      )}
      <SectionHeader title={t('staff.quick')} />
      <Wrap style={{ gap: 10 }}>
        {actions.map((a, k) => (
          <Pressable testID={`act-${k}`} key={k} onPress={a.onPress} style={{ width: '48%', flexGrow: 1, backgroundColor: a.dark ? colors.yellow : colors.surface, borderRadius: radius.lg, padding: 16, gap: 10 }}>
            <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: a.dark ? colors.black : colors.yellowSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name={a.icon} color={a.dark ? colors.yellow : colors.black} /></View>
            <T v="bodyStrong">{a.label}</T>
          </Pressable>
        ))}
      </Wrap>
      <SectionHeader title={`${t('staff.pendingPay')} (${pending.length})`} />
      <Card style={{ paddingVertical: 4 }}>{pending.map(row)}</Card>
      <SectionHeader title={`${t('staff.expiring')} (${expiring.length})`} action={t('common.seeAll')} onAction={() => router.push('/staff/(tabs)/members')} />
      <Card style={{ paddingVertical: 4 }}>{expiring.map(row)}</Card>
      <SectionHeader title={t('staff.visits')} action={t('common.seeAll')} onAction={() => router.push('/staff/visits')} testID="dash-visits" />
      <View />
    </Screen>
  );
}
