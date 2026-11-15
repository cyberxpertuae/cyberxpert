import React, { useState } from 'react';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Button, Steps, PaymentOptions, KV, Card } from '../../src/components';
import { colors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { membershipService } from '../../src/services/membershipService';
import { catalogService } from '../../src/services/catalogService';

/** M05 Checkout step 3: payment (card / wallet / pay at the gym) */
export default function CheckoutPayment() {
  const { t, tr, money } = useI18n();
  const d = useApp((s) => s.checkout);
  const cards = useApp((s) => s.cards);
  const [method, setMethod] = useState<string | null>(d.method ?? cards.find((c) => c.default)?.id ?? null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const q = membershipService.quote();
  const plan = catalogService.planSync(d.planId)!;
  const pay = async () => {
    if (!method) { setErr(t('checkout.choose')); return; }
    setBusy(true);
    useApp.getState().set({ checkout: { ...d, method: method === 'gym' ? 'gym' : method.startsWith('c') ? 'visa' : method } });
    const r = await membershipService.subscribe();
    setBusy(false);
    router.replace({ pathname: '/checkout/success', params: { pending: method === 'gym' ? '1' : '0', earned: String(r.earned), total: String(r.total) } });
  };
  return (
    <Screen title={t('checkout.title')} footer={<Button testID="co-pay" title={method === 'gym' ? t('checkout.reserve') : t('checkout.payNow', { a: money(q.total) })} loading={busy} onPress={pay} icon={method === 'gym' ? 'storefront-outline' : 'lock-closed'} />}>
      <Steps total={3} current={2} />
      <T v="captionStrong" color={colors.yellowDark}>{t('checkout.step3')}</T>
      <Card><KV k={tr(plan.name)} v={money(q.total)} strong /></Card>
      <T v="h3">{t('checkout.payWith')}</T>
      <PaymentOptions value={method} onChange={(v) => { setMethod(v); setErr(''); }} allowGym={plan.type !== 'online'} gymLabel={t('checkout.payAtGymBody')} />
      {err ? <T v="caption" color={colors.danger}>{err}</T> : null}
      <Row gap={8} justify="center"><Icon name="shield-checkmark" size={16} color={colors.success} /><T v="caption" color={colors.textMuted}>{t('checkout.secure')}</T></Row>
      <Col />
    </Screen>
  );
}
