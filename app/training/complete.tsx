import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Button, SuccessBurst, Stat, Pill } from '../../src/components';
import { colors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { exerciseSync } from '../../src/services/trainingService';

/** T07 Workout complete */
export default function Complete() {
  const { t, tr, num } = useI18n();
  const { prs } = useLocalSearchParams<{ prs?: string }>();
  const log = useApp((s) => s.lastSession);
  const list: { ex: string; v: number }[] = prs ? JSON.parse(prs) : [];
  return (
    <Screen header={false} footer={<Col gap={8}><Button testID="cmp-history" title={t('training.viewHistory')} onPress={() => router.replace('/training/history')} /><Button title={t('checkout.goHome')} variant="ghost" onPress={() => router.replace('/(tabs)/training')} /></Col>}>
      <SuccessBurst icon="trophy" />
      <T v="display" center>{t('training.completeTitle')}</T>
      <T v="body" center color={colors.textMuted}>{t('training.completeBody')}</T>
      <Row justify="center"><Pill label={t('checkout.earned', { p: 30 })} icon="star" /></Row>
      {log ? (
        <Row gap={10}>
          <Stat icon="time-outline" value={`${log.min} ${t('common.min')}`} label={t('training.minutes')} />
          <Stat icon="barbell-outline" value={`${num(log.volume)} kg`} label={t('training.volume')} />
          <Stat icon="flame-outline" value={num(log.kcal)} label={t('common.kcal')} />
        </Row>
      ) : null}
      {list.map((p) => (
        <Card key={p.ex} style={{ backgroundColor: colors.black }}>
          <Row gap={12}><Icon name="medal" size={28} color={colors.gold} /><Col style={{ flex: 1 }}><T v="micro" color={colors.gold}>{t('training.newPR').toUpperCase()}</T><T v="bodyStrong" color={colors.onDark}>{tr(exerciseSync(p.ex).name)} · {p.v} kg</T></Col></Row>
        </Card>
      ))}
    </Screen>
  );
}
