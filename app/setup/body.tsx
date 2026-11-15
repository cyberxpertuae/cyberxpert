import React, { useState } from 'react';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Button, Steps, Input, Chip } from '../../src/components';
import { colors } from '../../src/theme';
import { useSetup } from '../../src/store/setup';

/** A13 Setup step 2: body metrics */
export default function Body() {
  const { t } = useI18n();
  const s = useSetup();
  const [err, setErr] = useState<Record<string, string>>({});
  const num = (v: string) => v.replace(/[^\d.]/g, '').slice(0, 5);
  const next = () => {
    const e: Record<string, string> = {};
    const r = (k: string, v: string, lo: number, hi: number) => { const n = parseFloat(v); if (!n || n < lo || n > hi) e[k] = `${lo}–${hi}`; };
    r('age', s.age, 14, 90); r('height', s.height, 120, 230); r('weight', s.weight, 35, 250); r('target', s.target, 35, 250);
    setErr(e); if (!Object.keys(e).length) router.push('/setup/activity');
  };
  return (
    <Screen header={{}} footer={<Button testID="setup-next" title={t('common.next')} onPress={next} />}>
      <Steps total={3} current={1} />
      <Col gap={4}>
        <T v="captionStrong" color={colors.yellowDark}>{t('setup.step', { a: 2 })}</T>
        <T v="display">{t('setup.bodyTitle')}</T>
        <T v="body" color={colors.textMuted}>{t('setup.bodySub')}</T>
      </Col>
      <Row gap={8}>
        <Chip label={t('gender.male')} icon="male" selected={s.gender === 'male'} onPress={() => s.set({ gender: 'male' })} />
        <Chip label={t('gender.female')} icon="female" selected={s.gender === 'female'} onPress={() => s.set({ gender: 'female' })} />
      </Row>
      <Row gap={12} align="flex-start">
        <Col style={{ flex: 1 }}><Input testID="setup-age" label={t('setup.age')} keyboardType="number-pad" value={s.age} onChangeText={(v) => s.set({ age: num(v) })} error={err.age} /></Col>
        <Col style={{ flex: 1 }}><Input testID="setup-height" label={t('setup.height')} keyboardType="number-pad" value={s.height} onChangeText={(v) => s.set({ height: num(v) })} error={err.height} /></Col>
      </Row>
      <Row gap={12} align="flex-start">
        <Col style={{ flex: 1 }}><Input testID="setup-weight" label={t('setup.weight')} keyboardType="decimal-pad" value={s.weight} onChangeText={(v) => s.set({ weight: num(v) })} error={err.weight} /></Col>
        <Col style={{ flex: 1 }}><Input testID="setup-target" label={t('setup.target')} keyboardType="decimal-pad" value={s.target} onChangeText={(v) => s.set({ target: num(v) })} error={err.target} /></Col>
      </Row>
    </Screen>
  );
}
