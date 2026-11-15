import React from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { useI18n } from '../../src/i18n';
import { Screen, T, Col, Button, SuccessBurst, Card, KV, Pill } from '../../src/components';
import { colors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { catalogService } from '../../src/services/catalogService';

/** M07 Subscription success / pending (pay at gym) */
export default function CheckoutSuccess() {
  const { t, tr, money, num } = useI18n();
  const { pending, earned, total } = useLocalSearchParams<{ pending: string; earned: string; total: string }>();
  const m = useApp((s) => s.membership);
  const user = useApp((s) => s.user);
  const plan = catalogService.planSync(m?.plan);
  const isPending = pending === '1';
  return (
    <Screen header={false} footer={<Col gap={8}><Button testID="succ-membership" title={t('checkout.viewMembership')} onPress={() => router.replace('/membership')} /><Button testID="succ-home" title={t('checkout.goHome')} variant="ghost" onPress={() => router.replace('/(tabs)/home')} /></Col>}>
      <SuccessBurst icon={isPending ? 'storefront' : 'trophy'} />
      <T v="display" center>{isPending ? t('checkout.pendingTitle') : t('checkout.successTitle')}</T>
      <T v="body" center color={colors.textMuted}>{isPending ? t('checkout.pendingBody', { a: money(+total), plan: tr(plan?.name) }) : t('checkout.successBody', { plan: tr(plan?.name) })}</T>
      {!isPending && +earned > 0 ? <View style={{ alignSelf: 'center' }}><Pill label={t('checkout.earned', { p: num(+earned) })} icon="star" /></View> : null}
      <Card style={{ alignItems: 'center', gap: 10 }}>
        <QRCode value={`EMPIRE:${user?.id}:${m?.id}`} size={150} />
        <KV k={t('checkout.membershipNo')} v={m?.id ?? ''} />
      </Card>
    </Screen>
  );
}
