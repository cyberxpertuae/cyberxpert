import React, { useState } from 'react';
import { Pressable, Switch, View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Button, Steps, Input, KV, Divider, useToast } from '../../src/components';
import { colors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { catalogService } from '../../src/services/catalogService';
import { membershipService } from '../../src/services/membershipService';
import { useFmt } from '../../src/utils/format';

/** M04 Checkout step 2: review, promo code & points */
export default function CheckoutReview() {
  const { t, tr, money, num } = useI18n();
  const f = useFmt();
  const toast = useToast();
  const d = useApp((s) => s.checkout);
  const user = useApp((s) => s.user);
  const [code, setCode] = useState(d.promo ?? '');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const plan = catalogService.planSync(d.planId)!;
  const q = membershipService.quote();
  const apply = async () => {
    if (!code.trim()) return;
    setBusy(true); setErr('');
    try { const o = await membershipService.applyPromo(code); toast(t('checkout.promoApplied', { c: o.code })); } catch { setErr(t('checkout.promoInvalid')); }
    setBusy(false);
  };
  return (
    <Screen title={t('checkout.title')} footer={<Button testID="co-next" title={t('common.next')} onPress={() => router.push('/checkout/payment')} />}>
      <Steps total={3} current={1} />
      <T v="captionStrong" color={colors.yellowDark}>{t('checkout.step2')}</T>
      <Card>
        <T v="h3" style={{ marginBottom: 6 }}>{t('checkout.summary')}</T>
        <KV k={tr(plan.name)} v={money(q.plan)} />
        <KV k={t('checkout.startDate')} v={f.date(d.start)} />
        {d.addons.map((a) => { const ad = catalogService.addonsSync().find((x) => x.id === a)!; return <KV key={a} k={tr(ad.name)} v={money(ad.perMonth ? ad.price * Math.max(1, plan.months) : ad.price)} />; })}
      </Card>
      <Row gap={10} align="flex-start">
        <Col style={{ flex: 1 }}><Input testID="co-promo" icon="pricetag-outline" placeholder={t('checkout.promoPh')} autoCapitalize="characters" value={code} onChangeText={(v) => { setCode(v); setErr(''); }} error={err} /></Col>
        <Button testID="co-apply" title={t('common.apply')} variant="dark" full={false} loading={busy} onPress={apply} />
      </Row>
      {d.promo ? <Row gap={6}><Icon name="checkmark-circle" size={18} color={colors.success} /><T v="caption" color={colors.success}>{t('checkout.promoApplied', { c: d.promo })}</T></Row> : null}
      {user ? (
        <Card>
          <Row gap={12}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.yellowSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name="star" size={20} color={colors.gold} /></View>
            <Col style={{ flex: 1 }}><T v="bodyStrong">{t('checkout.usePoints')}</T><T v="caption" color={colors.textMuted}>{t('checkout.pointsAvail', { p: num(user.points) })}</T></Col>
            <Switch testID="co-points" value={d.usePoints} onValueChange={(v) => useApp.getState().set({ checkout: { ...d, usePoints: v } })} trackColor={{ true: colors.yellow, false: colors.border }} thumbColor="#fff" />
          </Row>
        </Card>
      ) : null}
      <Card>
        <KV k={t('common.subtotal')} v={money(q.subtotal)} />
        {q.promo ? <KV k={t('checkout.promoDisc')} v={'− ' + money(q.promo)} color={colors.success} /> : null}
        {q.points ? <KV k={t('checkout.pointsDisc')} v={'− ' + money(q.points)} color={colors.success} /> : null}
        <KV k={t('common.vatIncl')} v={money(q.vat)} />
        <Divider style={{ marginVertical: 6 }} />
        <KV k={t('common.total')} v={money(q.total)} strong />
        <Row gap={6} style={{ marginTop: 6 }}><Icon name="sparkles" size={16} color={colors.gold} /><T v="caption" color={colors.textMuted}>{t('checkout.earn', { p: num(Math.round(q.total)) })}</T></Row>
      </Card>
      <Pressable onPress={() => router.push('/offers')}><T v="captionStrong" center color={colors.yellowDark}>{t('offers.title')} →</T></Pressable>
    </Screen>
  );
}
