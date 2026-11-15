import React from 'react';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Col, Button, SuccessBurst } from '../../src/components';
import { colors } from '../../src/theme';

/** A11 Password reset success */
export default function ResetSuccess() {
  const { t } = useI18n();
  return (
    <Screen scroll={false} footer={<Button testID="rs-login" title={t('auth.backToLogin')} onPress={() => router.replace('/auth/login')} />}>
      <Col gap={10} style={{ flex: 1, justifyContent: 'center' }}>
        <SuccessBurst icon="lock-open" />
        <T v="display" center>{t('auth.resetDone')}</T>
        <T v="body" center color={colors.textMuted}>{t('auth.resetDoneBody')}</T>
      </Col>
    </Screen>
  );
}
