import React, { useState } from 'react';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Button, Input, Chip, OptionCard, useToast } from '../../src/components';
import { colors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { authService } from '../../src/services/authService';
import { calcCalories } from '../../src/services/nutritionService';

/** P03 Goals & fitness profile */
export default function Fitness() {
  const { t, num } = useI18n();
  const toast = useToast();
  const u = useApp((s) => s.user)!;
  const [f, setF] = useState({ goal: u.goal, height: String(u.height), weight: String(u.weight), target: String(u.target), activity: u.activity, experience: u.experience });
  const [busy, setBusy] = useState(false);
  const n = (v: string) => v.replace(/[^\d.]/g, '').slice(0, 5);
  const save = async () => {
    const age = 2026 - parseInt(u.dob.slice(0, 4), 10);
    const c = calcCalories({ gender: u.gender, age, height: +f.height, weight: +f.weight, activity: f.activity, goal: f.goal });
    setBusy(true);
    await authService.saveFitnessProfile({ goal: f.goal, gender: u.gender, age, height: +f.height, weight: +f.weight, target: +f.target, activity: f.activity, experience: f.experience, kcal: c.kcal });
    setBusy(false); toast(t('profile.recalculated', { k: num(c.kcal) })); router.back();
  };
  return (
    <Screen title={t('profile.fitnessTitle')} footer={<Button testID="fit-save" title={t('common.save')} loading={busy} onPress={save} />}>
      <T v="h3">{t('setup.goalTitle')}</T>
      {['lose', 'muscle', 'fit', 'strength'].map((g) => <OptionCard key={g} title={t(`goal.${g}`)} sub={t(`goalDesc.${g}`)} selected={f.goal === g} onPress={() => setF({ ...f, goal: g })} />)}
      <Row gap={10} align="flex-start">
        <Col style={{ flex: 1 }}><Input label={t('setup.height')} keyboardType="number-pad" value={f.height} onChangeText={(v) => setF({ ...f, height: n(v) })} /></Col>
        <Col style={{ flex: 1 }}><Input label={t('setup.weight')} keyboardType="decimal-pad" value={f.weight} onChangeText={(v) => setF({ ...f, weight: n(v) })} /></Col>
        <Col style={{ flex: 1 }}><Input label={t('setup.target')} keyboardType="decimal-pad" value={f.target} onChangeText={(v) => setF({ ...f, target: n(v) })} /></Col>
      </Row>
      <T v="captionStrong" color={colors.textMuted}>{t('setup.activityTitle')}</T>
      <Row gap={8} wrap>{['sedentary', 'light', 'moderate', 'active', 'athlete'].map((a) => <Chip key={a} label={t(`activity.${a}`)} selected={f.activity === a} onPress={() => setF({ ...f, activity: a })} />)}</Row>
      <T v="captionStrong" color={colors.textMuted}>{t('setup.experience')}</T>
      <Row gap={8} wrap>{['beginner', 'intermediate', 'advanced'].map((e) => <Chip key={e} label={t(`exp.${e}`)} selected={f.experience === e} onPress={() => setF({ ...f, experience: e })} />)}</Row>
    </Screen>
  );
}
