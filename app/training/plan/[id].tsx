import React, { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useI18n } from '../../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, Button, Skeleton, Stat, useToast } from '../../../src/components';
import { colors, radius } from '../../../src/theme';
import { useApp } from '../../../src/store/app';
import { images } from '../../../src/data/images';
import { trainingService, exerciseSync } from '../../../src/services/trainingService';
import { coachSync } from '../../../src/services/bookingService';
import { useAsync } from '../../../src/utils/useAsync';
import { requireAuth } from '../../../src/utils/guard';

/** T03 Plan detail */
export default function PlanDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tr } = useI18n();
  const toast = useToast();
  const active = useApp((s) => s.activeProgram);
  const { data: p, loading } = useAsync(() => trainingService.getProgram(id!), [id]);
  const [busy, setBusy] = useState(false);
  if (loading || !p) return <Screen title=" "><Skeleton h={220} r={24} /><Skeleton h={80} r={20} /></Screen>;
  const coach = coachSync(p.coach);
  return (
    <Screen title={tr(p.name)} footer={active === p.id ? <Button title={t('training.current')} disabled icon="checkmark" /> : <Button testID="plan-start" title={t('training.startPlan')} loading={busy} onPress={() => requireAuth(async () => { setBusy(true); await trainingService.setActiveProgram(p.id); setBusy(false); toast(t('training.planStarted')); })} />}>
      <View style={{ height: 210, borderRadius: radius.xl, overflow: 'hidden' }}>
        <Img src={images[p.img]} style={{ position: 'absolute', width: '100%', height: '100%' }} />
        <LinearGradient colors={['transparent', 'rgba(11,11,12,0.92)']} style={{ flex: 1, justifyContent: 'flex-end', padding: 16, gap: 4 }}>
          <T v="h1" color={colors.onDark}>{tr(p.name)}</T>
          {coach ? <Row gap={8}><Img src={images[coach.img]} style={{ width: 26, height: 26 }} radius={13} /><T v="caption" color={colors.gold}>{t('training.byCoach', { name: tr(coach.name) })}</T></Row> : null}
        </LinearGradient>
      </View>
      <Row gap={10}>
        <Stat icon="calendar-outline" value={t('training.weeks', { n: p.weeks })} label={t('common.level')} />
        <Stat icon="repeat-outline" value={t('training.perWeek', { n: p.perWeek })} label={t('training.schedule')} />
        <Stat icon="speedometer-outline" value={t(`exp.${['beginner', 'intermediate', 'advanced'][p.level - 1]}`)} label={t('common.level')} />
      </Row>
      <T v="body" color={colors.textMuted}>{tr(p.desc)}</T>
      <T v="h3">{t('training.schedule')}</T>
      {p.days.map((d, i) => (
        <Card key={d.id} testID={`day-${d.id}`} onPress={() => router.push(`/training/workout/${p.id}?day=${d.id}`)}>
          <Row gap={12}>
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' }}><T v="h3" color={colors.yellow}>{i + 1}</T></View>
            <Col style={{ flex: 1 }} gap={2}><T v="bodyStrong">{tr(d.name)}</T><T v="caption" color={colors.textMuted} numberOfLines={1}>{d.ex.map((e) => tr(exerciseSync(e).name)).join(' · ')}</T></Col>
            <Icon name="chevron-forward" size={18} color={colors.textSubtle} />
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
