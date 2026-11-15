import React from 'react';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Button, Steps, OptionCard, Chip } from '../../src/components';
import { colors } from '../../src/theme';
import { useSetup } from '../../src/store/setup';

/** A14 Setup step 3: activity level & experience */
export default function Activity() {
  const { t } = useI18n();
  const s = useSetup();
  const levels = ['sedentary', 'light', 'moderate', 'active', 'athlete'];
  return (
    <Screen header={{}} footer={<Button testID="setup-next" title={t('common.continue')} onPress={() => router.push('/setup/ready')} />}>
      <Steps total={3} current={2} />
      <Col gap={4}>
        <T v="captionStrong" color={colors.yellowDark}>{t('setup.step', { a: 3 })}</T>
        <T v="display">{t('setup.activityTitle')}</T>
      </Col>
      {levels.map((l) => <OptionCard testID={`act-${l}`} key={l} title={t(`activity.${l}`)} sub={t(`activityDesc.${l}`)} selected={s.activity === l} onPress={() => s.set({ activity: l })} />)}
      <T v="h3">{t('setup.experience')}</T>
      <Row gap={8} wrap>
        {['beginner', 'intermediate', 'advanced'].map((e) => <Chip key={e} label={t(`exp.${e}`)} selected={s.experience === e} onPress={() => s.set({ experience: e })} />)}
      </Row>
    </Screen>
  );
}
