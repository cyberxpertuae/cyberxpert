import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Button, KV, Divider, Input, PaymentOptions, IconName } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { shopService } from '../../src/services/shopService';

/** S05 Shop checkout */
export default function ShopCheckout() {
  const { t, tr, money } = useI18n();
  const addresses = useApp((s) => s.addresses);
  const cards = useApp((s) => s.cards);
  const [method, setMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [addr, setAddr] = useState(addresses.find((a) => a.default)?.id ?? addresses[0]?.id ?? null);
  const [pay, setPay] = useState<string | null>(cards.find((c) => c.default)?.id ?? null);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const tot = shopService.cartTotals(undefined, method);
  const a = addresses.find((x) => x.id === addr);
  const place = async () => {
    if (method === 'delivery' && !a) { setErr(t('shop.noAddress')); return; }
    if (!pay) { setErr(t('checkout.choose')); return; }
    setBusy(true);
    const r = await shopService.placeOrder(method, addr, pay);
    setBusy(false);
    router.replace({ pathname: '/shop/success', params: { id: r.id, method } });
  };
  const opt = (k: 'pickup' | 'delivery', icon: IconName, title: string, sub: string) => (
    <Pressable testID={`ship-${k}`} onPress={() => { setMethod(k); setErr(''); }} style={{ flex: 1 }}>
      <Col gap={4} style={{ backgroundColor: method === k ? colors.black : colors.surface, borderRadius: radius.lg, padding: 14, borderWidth: 1.5, borderColor: method === k ? colors.yellow : colors.border }}>
        <Icon name={icon} color={method === k ? colors.yellow : colors.text} />
        <T v="bodyStrong" color={method === k ? colors.onDark : colors.text}>{title}</T>
        <T v="micro" color={method === k ? colors.onDarkMuted : colors.textMuted}>{sub}</T>
      </Col>
    </Pressable>
  );
  return (
    <Screen title={t('shop.checkout')} footer={<Button testID="place-order" title={t('shop.placeOrder', { a: money(tot.total) })} loading={busy} onPress={place} />}>
      <Row gap={10} align="stretch">{opt('pickup', 'storefront-outline', t('shop.pickup'), t('shop.pickupSub'))}{opt('delivery', 'bicycle-outline', t('shop.delivery'), t('shop.deliverySub'))}</Row>
      {method === 'delivery' ? (
        <Card>
          <Row justify="space-between" style={{ marginBottom: 8 }}><T v="h3">{t('shop.address')}</T><T v="captionStrong" color={colors.yellowDark} onPress={() => router.push('/shop/addresses')}>{a ? t('shop.changeAddr') : t('shop.addAddr')}</T></Row>
          {addresses.map((x) => (
            <Pressable key={x.id} onPress={() => setAddr(x.id)}>
              <Row gap={10} style={{ paddingVertical: 8 }}>
                <Icon name={addr === x.id ? 'radio-button-on' : 'radio-button-off'} color={addr === x.id ? colors.yellowDark : colors.textSubtle} />
                <Col style={{ flex: 1 }}><T v="bodyStrong">{tr(x.label)}</T><T v="caption" color={colors.textMuted}>{x.building}{x.flat ? `, ${x.flat}` : ''} · {tr(x.area)}</T></Col>
              </Row>
            </Pressable>
          ))}
          {!addresses.length ? <Button small title={t('shop.addAddr')} variant="outline" icon="add" onPress={() => router.push('/shop/address-form')} /> : null}
        </Card>
      ) : null}
      <T v="h3">{t('shop.payment')}</T>
      <PaymentOptions value={pay} onChange={(v) => { setPay(v); setErr(''); }} allowGym={method === 'pickup'} gymLabel={t('shop.cashOnPickup')} />
      <Input label={t('shop.notes')} value={notes} onChangeText={setNotes} placeholder={t('common.optional')} multiline />
      {err ? <T v="caption" color={colors.danger}>{err}</T> : null}
      <Card>
        <KV k={t('common.subtotal')} v={money(tot.sub)} />
        {tot.disc ? <KV k={t('common.discount')} v={'− ' + money(tot.disc)} color={colors.success} /> : null}
        <KV k={t('shop.delivery')} v={tot.delivery ? money(tot.delivery) : t('common.free')} />
        <KV k={t('common.vatIncl')} v={money(tot.vat)} />
        <Divider style={{ marginVertical: 6 }} />
        <KV k={t('common.total')} v={money(tot.total)} strong />
      </Card>
      <View />
    </Screen>
  );
}
