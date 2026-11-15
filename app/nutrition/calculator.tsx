import React, { useMemo, useState } from 'react';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Card, Button, Input, Chip, KV, Divider, useToast } from '../../src/components';
import { colors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { calcCalories, nutritionService } from '../../src/services/nutritionService';

/** N04 Calorie calculator (BMR / TDEE) */
export default function Calculator() {
  const { t, num } = useI18n();
  const toast = useToast();
  const user = useApp((s) => s.user);
  const [f, setF] = useState({ gender: user?.gender ?? 'male', age: '29', height: String(user?.height ?? 178), weight: String(user?.weight ?? 82), activity: user?.activity ?? 'moderate', goal: user?.goal ?? 'muscle' });
  const [busy, setBusy] = useState(false);
  const n = (v: string) => v.replace(/[^\d.]/g, '').slice(0, 5);
  const valid = +f.age > 13 && +f.height > 100 && +f.weight > 30;
  const c = useMemo(() => (valid ? calcCalories({ ...f, age: +f.age, height: +f.height, weight: +f.weight }) : null), [f, valid]);
  return (
    <Screen title={t('nutrition.calcTitle')} footer={<Button testID="calc-use" title={t('nutrition.useGoal')} disabled={!c} loading={busy} onPress={async () => { if (!c) return; setBusy(true); await nutritionService.setGoal(c.kcal); setBusy(false); toast(t('nutrition.goalSaved')); }} />}>
      <T v="caption" color={colors.textMuted}>{t('nutrition.calcSub')}</T>
      <Row gap={8}>{['male', 'female'].map((g) => <Chip key={g} label={t(`gender.${g}`)} selected={f.gender === g} onPress={() => setF({ ...f, gender: g })} />)}</Row>
      <Row gap={10} align="flex-start">
        <Col style={{ flex: 1 }}><Input testID="calc-age" label={t('setup.age')} keyboardType="number-pad" value={f.age} onChangeText={(v) => setF({ ...f, age: n(v) })} /></Col>
        <Col style={{ flex: 1 }}><Input testID="calc-height" label={t('setup.height')} keyboardType="number-pad" value={f.height} onChangeText={(v) => setF({ ...f, height: n(v) })} /></Col>
        <Col style={{ flex: 1 }}><Input testID="calc-weight" label={t('setup.weight')} keyboardType="decimal-pad" value={f.weight} onChangeText={(v) => setF({ ...f, weight: n(v) })} /></Col>
      </Row>
      <T v="captionStrong" color={colors.textMuted}>{t('setup.activityTitle')}</T>
      <Row gap={8} wrap>{['sedentary', 'light', 'moderate', 'active', 'athlete'].map((a) => <Chip key={a} label={t(`activity.${a}`)} selected={f.activity === a} onPress={() => setF({ ...f, activity: a })} />)}</Row>
      <T v="captionStrong" color={colors.textMuted}>{t('setup.goalTitle')}</T>
      <Row gap={8} wrap>{['lose', 'muscle', 'fit', 'strength'].map((g) => <Chip key={g} label={t(`goal.${g}`)} selected={f.goal === g} onPress={() => setF({ ...f, goal: g })} />)}</Row>
      {c ? (
        <Card style={{ backgroundColor: colors.black }} testID="calc-result">
          <KV k={t('nutrition.bmr')} v={`${num(c.bmr)} ${t('common.kcal')}`} color={colors.onDark} labelColor={colors.onDarkMuted} />
          <KV k={t('nutrition.tdee')} v={`${num(c.tdee)} ${t('common.kcal')}`} color={colors.onDark} labelColor={colors.onDarkMuted} />
          <Divider style={{ marginVertical: 8, backgroundColor: colors.ink3 }} />
          <Row justify="space-between"><T v="bodyStrong" color={colors.gold}>{t('nutrition.target')}</T><T v="display" color={colors.yellow}>{num(c.kcal)}</T></Row>
          <T v="caption" color={colors.onDarkMuted} alignEnd>P {c.protein} g · C {c.carbs} g · F {c.fat} g</T>
        </Card>
      ) : null}
    </Screen>
  );
}
