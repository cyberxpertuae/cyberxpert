import React from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useI18n } from '../../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, Button, Skeleton, Stat, Pill } from '../../../src/components';
import { colors, radius } from '../../../src/theme';
import { images } from '../../../src/data/images';
import { trainingService, exerciseSync } from '../../../src/services/trainingService';
import { machineSync } from '../../../src/services/machinesService';
import { useAsync } from '../../../src/utils/useAsync';
import { requireAuth } from '../../../src/utils/guard';

/** T04 Workout (day) detail — program day or custom workout */
export default function Workout() {
  const { id, day } = useLocalSearchParams<{ id: string; day?: string }>();
  const { t, tr } = useI18n();
  const { data, loading } = useAsync(() => trainingService.getDay(id!, day ?? 'd1'), [id, day]);
  if (loading || !data) return <Screen title=" "><Skeleton h={180} r={24} /><Skeleton h={300} r={24} /></Screen>;
  const name = data.day ? tr(data.day.name) : data.custom?.name ?? '';
  const list = data.day ? data.day.ex.map((e) => ({ id: e, sets: exerciseSync(e).sets, reps: exerciseSync(e).reps })) : (data.custom?.ex ?? []);
  const est = list.reduce((a, e) => a + e.sets * 2.5, 0) + 5;
  const kcal = list.reduce((a, e) => a + exerciseSync(e.id).kcal * e.sets, 0) + est * 3;
  const machines = Array.from(new Set(list.map((e) => exerciseSync(e.id).machine).filter(Boolean))) as string[];
  const start = () => requireAuth(() => { trainingService.startSession(data.program?.id ?? null, data.day?.id ?? null, name, list.map((e) => ({ id: e.id, sets: e.sets }))); router.push('/training/session'); });
  return (
    <Screen title={name} header={{ subtitle: data.program ? tr(data.program.name) : t('training.custom') }} footer={<Button testID="wk-start" title={t('training.startWorkout')} icon="play" onPress={start} />}>
      <Row gap={10}>
        <Stat icon="barbell-outline" value={String(list.length)} label={t('training.exercises')} />
        <Stat icon="time-outline" value={t('training.est', { n: Math.round(est) })} label={t('training.minutes')} />
        <Stat icon="flame-outline" value={t('training.estKcal', { n: Math.round(kcal) })} label={t('common.kcal')} />
      </Row>
      {list.map((e, i) => {
        const ex = exerciseSync(e.id);
        return (
          <Card key={e.id + i} testID={`wex-${e.id}`} padded={false} onPress={() => router.push(`/training/exercise/${e.id}`)}>
            <Row gap={12} style={{ padding: 10 }}>
              <View><Img src={images[ex.img]} style={{ width: 70, height: 70 }} radius={14} /><View style={{ position: 'absolute', top: -6, left: -6, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' }}><T v="micro" color={colors.yellow}>{i + 1}</T></View></View>
              <Col style={{ flex: 1 }} gap={2}>
                <T v="bodyStrong" numberOfLines={1}>{tr(ex.name)}</T>
                <T v="caption" color={colors.textMuted}>{e.sets} {t('common.sets')} × {e.reps}</T>
                {ex.rest ? <T v="micro" color={colors.textSubtle}>{t('training.rest', { n: ex.rest })}</T> : null}
              </Col>
              <Icon name="information-circle-outline" size={22} color={colors.textSubtle} />
            </Row>
          </Card>
        );
      })}
      {machines.length ? (
        <Col gap={8}>
          <T v="h3">{t('training.equipment')}</T>
          <Row gap={8} wrap>{machines.map((m) => <Pill key={m} label={tr(machineSync(m)!.name)} icon="construct-outline" bg={colors.surface} />)}</Row>
        </Col>
      ) : null}
      <View style={{ height: 8, borderRadius: radius.sm }} />
    </Screen>
  );
}
