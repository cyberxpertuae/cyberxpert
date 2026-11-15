import React from 'react';
import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, Button, QtyStepper, EmptyState, KV, Divider } from '../../src/components';
import { colors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { images } from '../../src/data/images';
import { shopService, productSync } from '../../src/services/shopService';
import { requireAuth } from '../../src/utils/guard';

/** S04 Cart */
export default function Cart() {
  const { t, tr, money } = useI18n();
  const cart = useApp((s) => s.cart);
  const user = useApp((s) => s.user);
  if (!cart.length) return <Screen title={t('shop.cart')}><EmptyState icon="bag-handle-outline" title={t('shop.cartEmpty')} body={t('shop.cartEmptyBody')} action={t('shop.goShop')} onAction={() => router.replace('/shop')} /></Screen>;
  const tot = shopService.cartTotals();
  return (
    <Screen title={t('shop.cart')} header={{ subtitle: t('shop.items', { n: tot.count }) }} footer={<Button testID="cart-checkout" title={`${t('shop.checkout')} · ${money(tot.total)}`} onPress={() => requireAuth(() => router.push('/shop/checkout'))} />}>
      {cart.map((c, i) => {
        const p = productSync(c.id);
        return (
          <Card key={c.id + i} testID={`cart-${i}`} padded={false}>
            <Row gap={12} style={{ padding: 10 }}>
              <Img src={images[p.img]} style={{ width: 80, height: 80 }} radius={14} />
              <Col style={{ flex: 1 }} gap={4}>
                <T v="captionStrong" numberOfLines={2}>{tr(p.name)}</T>
                {p.options && c.opt != null ? <T v="micro" color={colors.textMuted}>{tr(p.options.label)}: {tr(p.options.values[c.opt])}</T> : null}
                <Row justify="space-between">
                  <T v="bodyStrong">{money(p.price * c.qty)}</T>
                  <QtyStepper small value={c.qty} max={Math.max(1, p.stock)} onChange={(n) => shopService.setQty(i, n)} />
                </Row>
              </Col>
              <Pressable testID={`cart-rm-${i}`} hitSlop={8} onPress={() => shopService.removeAt(i)} style={{ alignSelf: 'flex-start' }}><Icon name="trash-outline" size={19} color={colors.danger} /></Pressable>
            </Row>
          </Card>
        );
      })}
      <Card>
        <KV k={t('common.subtotal')} v={money(tot.sub)} />
        {tot.disc ? <KV k={t('shop.tierDisc', { tier: t(`tier.${user?.tier}`) })} v={'− ' + money(tot.disc)} color={colors.success} /> : null}
        <KV k={t('common.vatIncl')} v={money(tot.vat)} />
        <Divider style={{ marginVertical: 6 }} />
        <KV k={t('common.total')} v={money(tot.total)} strong />
      </Card>
    </Screen>
  );
}
