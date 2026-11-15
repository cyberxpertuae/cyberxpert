import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Card, Img, ChipRow, SkeletonList, Pill } from '../../src/components';
import { colors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { images } from '../../src/data/images';
import { trainingService } from '../../src/services/trainingService';
import { coachSync } from '../../src/services/bookingService';
import { useAsync } from '../../src/utils/useAsync';

/** T02 Training plans */
export default function Plans() {
  const { t, tr } = useI18n();
  const [goal, setGoal] = useState('all');
  const active = useApp((s) => s.activeProgram);
  const { data, loading } = useAsync(() => trainingService.getPrograms(goal), [goal]);
  return (
    <Screen title={t('training.plansTitle')}>
      <ChipRow items={['all', 'lose', 'muscle', 'fit', 'strength'].map((k) => ({ key: k, label: k === 'all' ? t('common.all') : t(`goal.${k}`) }))} value={goal} onChange={setGoal} />
      {loading ? <SkeletonList rows={4} card={110} /> : (data ?? []).map((p) => {
        const coach = coachSync(p.coach);
        return (
          <Card key={p.id} testID={`prog-${p.id}`} padded={false} onPress={() => router.push(`/training/plan/${p.id}`)}>
            <Img src={images[p.img]} style={{ height: 130, width: '100%' }} />
            <View style={{ position: 'absolute', top: 10, left: 10, flexDirection: 'row', gap: 6 }}>
              {p.assigned ? <Pill label={t('training.assigned')} icon="person" /> : null}
              {active === p.id ? <Pill label={t('training.current')} bg={colors.success} fg="#fff" /> : null}
            </View>
            <Col gap={4} style={{ padding: 14 }}>
              <T v="h3">{tr(p.name)}</T>
              <T v="caption" color={colors.textMuted} numberOfLines={2}>{tr(p.desc)}</T>
              <Row gap={10} style={{ marginTop: 4 }}>
                <T v="micro" color={colors.textMuted}>{t('training.weeks', { n: p.weeks })}</T>
                <T v="micro" color={colors.textMuted}>· {t('training.perWeek', { n: p.perWeek })}</T>
                <T v="micro" color={colors.textMuted}>· {t(`exp.${['beginner', 'intermediate', 'advanced'][p.level - 1]}`)}</T>
                {coach ? <T v="micro" color={colors.yellowDark}>· {t('training.byCoach', { name: tr(coach.name).split(' ')[0] })}</T> : null}
              </Row>
            </Col>
          </Card>
        );
      })}
    </Screen>
  );
}
