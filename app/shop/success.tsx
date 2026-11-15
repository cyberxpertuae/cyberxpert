import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Col, Button, SuccessBurst } from '../../src/components';
import { colors } from '../../src/theme';

/** S08 Order placed */
export default function OrderSuccess() {
  const { t } = useI18n();
  const { id, method } = useLocalSearchParams<{ id: string; method: string }>();
  return (
    <Screen header={false} scroll={false} footer={<Col gap={8}><Button testID="os-track" title={t('shop.track')} onPress={() => router.replace(`/shop/order/${id}`)} /><Button title={t('checkout.goHome')} variant="ghost" onPress={() => router.replace('/(tabs)/home')} /></Col>}>
      <Col gap={10} style={{ flex: 1, justifyContent: 'center' }}>
        <SuccessBurst icon="bag-check" />
        <T v="display" center>{t('shop.successTitle')}</T>
        <T v="body" center color={colors.textMuted}>{t('shop.successBody', { id, s: method === 'delivery' ? t('shop.s_out') : t('shop.s_ready') })}</T>
      </Col>
    </Screen>
  );
}
