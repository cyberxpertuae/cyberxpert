import React from 'react';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Col, Button, Steps, OptionCard, IconName } from '../../src/components';
import { colors } from '../../src/theme';
import { useSetup } from '../../src/store/setup';

/** A12 Setup step 1: goal */
export default function Goal() {
  const { t } = useI18n();
  const s = useSetup();
  const opts: { k: string; icon: IconName }[] = [{ k: 'lose', icon: 'flame-outline' }, { k: 'muscle', icon: 'barbell-outline' }, { k: 'fit', icon: 'heart-outline' }, { k: 'strength', icon: 'trophy-outline' }];
  return (
    <Screen header={{ back: false, right: <T v="captionStrong" color={colors.textMuted} onPress={() => router.replace('/(tabs)/home')}>{t('common.skip')}</T> }} footer={<Button testID="setup-next" title={t('common.next')} onPress={() => router.push('/setup/body')} />}>
      <Steps total={3} current={0} />
      <Col gap={4}>
        <T v="captionStrong" color={colors.yellowDark}>{t('setup.step', { a: 1 })}</T>
        <T v="display">{t('setup.goalTitle')}</T>
        <T v="body" color={colors.textMuted}>{t('setup.goalSub')}</T>
      </Col>
      {opts.map((o) => <OptionCard testID={`goal-${o.k}`} key={o.k} icon={o.icon} title={t(`goal.${o.k}`)} sub={t(`goalDesc.${o.k}`)} selected={s.goal === o.k} onPress={() => s.set({ goal: o.k })} />)}
    </Screen>
  );
}
