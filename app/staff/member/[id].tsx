import React, { useState } from 'react';
import { Linking, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useI18n } from '../../../src/i18n';
import { Screen, T, Row, Col, Card, Button, StatusBadge, TierBadge, KV, Skeleton, useToast, Stat } from '../../../src/components';
import { colors } from '../../../src/theme';
import { useApp } from '../../../src/store/app';
import { staffService } from '../../../src/services/staffService';
import { catalogService } from '../../../src/services/catalogService';
import { addDays } from '../../../src/services/api';
import { useAsync } from '../../../src/utils/useAsync';
import { useFmt } from '../../../src/utils/format';
import { useStaffDraft } from '../../../src/store/staffDraft';

/** R08 Member detail (staff) */
export default function MemberDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tr, num } = useI18n();
  const f = useFmt();
  const toast = useToast();
  const { loading } = useAsync(() => staffService.member(id!), [id]);
  const m = useApp((s) => s.members.find((x) => x.id === id));
  const visits = useApp((s) => s.visits.filter((v) => v.member === id));
  const [busy, setBusy] = useState<string | null>(null);
  if (loading || !m) return <Screen title=" "><Skeleton h={180} r={24} /></Screen>;
  const plan = catalogService.planSync(m.plan);
  const act = async (k: string, fn: () => Promise<any>, msg: string) => { setBusy(k); await fn(); setBusy(null); toast(msg); };
  const renew = () => { useStaffDraft.getState().set({ renewId: m.id, planId: m.plan, method: 'cash' }); router.push('/staff/new-member/plan'); };
  return (
    <Screen title={t('staff.memberTitle')}>
      <Card style={{ backgroundColor: colors.black, gap: 10 }}>
        <Row gap={12}>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center' }}><T v="h1">{tr(m.name).slice(0, 1)}</T></View>
          <Col style={{ flex: 1 }} gap={4}><T v="h2" color={colors.onDark}>{tr(m.name)}</T><Row gap={6}><StatusBadge status={m.status} /><TierBadge tier={m.tier} small /></Row></Col>
        </Row>
        <KV k={t('card.memberId')} v={m.id} color={colors.onDark} labelColor={colors.onDarkMuted} />
        <KV k={t('card.plan')} v={tr(plan?.name)} color={colors.onDark} labelColor={colors.onDarkMuted} />
        <KV k={t('card.valid')} v={f.date(m.end)} color={colors.onDark} labelColor={colors.onDarkMuted} />
        <KV k={t('staff.phone')} v={`+971 ${m.phone}`} color={colors.onDark} labelColor={colors.onDarkMuted} />
      </Card>
      <Row gap={10}><Stat icon="enter-outline" value={num(m.visits)} label={t('staff.totalVisits')} /><Stat icon="time-outline" value={f.short(m.lastVisit)} label={t('staff.lastVisit', { d: '' }).trim()} /></Row>
      {m.status === 'pending' ? <Button testID="sm-activate" title={t('staff.activate')} icon="checkmark-circle" loading={busy === 'a'} onPress={() => act('a', () => staffService.update(m.id, { status: 'active' }), t('staff.activated'))} /> : null}
      {(m.status === 'active' || m.status === 'expiring') ? <Button testID="sm-checkin" title={t('staff.checkIn')} icon="enter-outline" loading={busy === 'c'} onPress={() => act('c', () => staffService.checkIn(m.id), t('staff.ciOk', { name: tr(m.name).split(' ')[0] }))} /> : null}
      <Row gap={10}>
        <Button testID="sm-renew" title={t('staff.renew')} variant="dark" icon="refresh" full={false} style={{ flex: 1 }} onPress={renew} />
        {m.status === 'frozen' ? (
          <Button testID="sm-unfreeze" title={t('staff.unfreeze')} variant="outline" full={false} style={{ flex: 1 }} loading={busy === 'u'} onPress={() => act('u', () => staffService.update(m.id, { status: 'active' }), t('staff.unfrozenT'))} />
        ) : m.status === 'active' ? (
          <Button testID="sm-freeze" title={t('staff.freeze')} variant="outline" icon="snow-outline" full={false} style={{ flex: 1 }} loading={busy === 'f'} onPress={() => act('f', () => staffService.update(m.id, { status: 'frozen', end: addDays(m.end, 14) }), t('staff.frozenT'))} />
        ) : null}
      </Row>
      <Button title="WhatsApp" icon="logo-whatsapp" variant="soft" onPress={() => Linking.openURL(`https://wa.me/971${m.phone.replace(/\s/g, '')}`)} />
      {visits.length ? (
        <Card style={{ paddingVertical: 4 }}>
          {visits.map((v, i) => <Row key={v.id} justify="space-between" style={{ paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}><T v="body">{t('common.today')} · {f.time(v.time)}</T><StatusBadge status={v.result} /></Row>)}
        </Card>
      ) : null}
    </Screen>
  );
}
