import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Button, Card, Ring, SuccessBurst, Img } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { useSetup } from '../../src/store/setup';
import { useApp } from '../../src/store/app';
import { calcCalories } from '../../src/services/nutritionService';
import { authService } from '../../src/services/authService';
import { programSync } from '../../src/services/trainingService';
import { images } from '../../src/data/images';

/** A15 Your plan is ready */
export default function Ready() {
  const { t, tr, num } = useI18n();
  const s = useSetup();
  const user = useApp((x) => x.user);
  const [loading, setLoading] = useState(false);
  const c = useMemo(() => calcCalories({ gender: s.gender, age: +s.age, height: +s.height, weight: +s.weight, activity: s.activity, goal: s.goal }), [s]);
  const prog = programSync(s.goal === 'lose' ? 'pg-fatloss' : s.goal === 'strength' ? 'pg-strength' : s.experience === 'beginner' || s.goal === 'fit' ? 'pg-beginner' : 'pg-ppl')!;
  const go = async () => {
    setLoading(true);
    await authService.saveFitnessProfile({ goal: s.goal, gender: s.gender, age: +s.age, height: +s.height, weight: +s.weight, target: +s.target, activity: s.activity, experience: s.experience, kcal: c.kcal });
    useApp.getState().set({ activeProgram: prog.id });
    setLoading(false);
    router.replace('/(tabs)/home');
  };
  const macro = (label: string, g: number, color: string) => (
    <Col gap={2} style={{ flex: 1, alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: 12 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <T v="h3">{num(g)} g</T>
      <T v="micro" color={colors.textMuted}>{label}</T>
    </Col>
  );
  return (
    <Screen header={false} footer={<Button testID="ready-go" title={t('setup.letsGo')} onPress={go} loading={loading} iconEnd="arrow-forward" />}>
      <SuccessBurst icon="sparkles" size={84} />
      <T v="display" center>{t('setup.readyTitle', { name: tr(user?.firstName) || '' })}</T>
      <T v="body" center color={colors.textMuted}>{t('setup.readySub')}</T>
      <Card style={{ backgroundColor: colors.black, alignItems: 'center', gap: 6 }}>
        <Ring size={150} stroke={14} value={0.72} track={colors.ink3}>
          <T v="number" color={colors.onDark}>{num(c.kcal)}</T>
          <T v="micro" color={colors.onDarkMuted}>{t('common.kcal')}</T>
        </Ring>
        <T v="captionStrong" color={colors.yellow}>{t('setup.daily')}</T>
      </Card>
      <Row gap={10}>
        {macro(t('setup.protein'), c.protein, colors.protein)}
        {macro(t('setup.carbs'), c.carbs, colors.carbs)}
        {macro(t('setup.fat'), c.fat, colors.fat)}
      </Row>
      <T v="h3">{t('setup.suggested')}</T>
      <Card padded={false}>
        <Row gap={12} style={{ padding: 12 }}>
          <Img src={images[prog.img]} style={{ width: 70, height: 70 }} radius={14} />
          <Col style={{ flex: 1 }} gap={2}>
            <T v="bodyStrong">{tr(prog.name)}</T>
            <T v="caption" color={colors.textMuted}>{t('training.weeks', { n: prog.weeks })} · {t('training.perWeek', { n: prog.perWeek })}</T>
          </Col>
        </Row>
      </Card>
    </Screen>
  );
}
