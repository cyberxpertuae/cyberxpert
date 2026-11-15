import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Card, Img, Segmented, StatusBadge, SkeletonList, EmptyState } from '../../src/components';
import { colors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { images } from '../../src/data/images';
import { shopService, productSync } from '../../src/services/shopService';
import { useAsync } from '../../src/utils/useAsync';
import { useFmt } from '../../src/utils/format';

const ACTIVE = ['processing', 'ready', 'shipped'];

/** S09 My orders */
export default function Orders() {
  const { t, money } = useI18n();
  const f = useFmt();
  const [tab, setTab] = useState<'active' | 'done' | 'cancelled'>('active');
  const orders = useApp((s) => s.orders);
  const { loading, refreshing, refresh } = useAsync(() => shopService.getOrders(), []);
  const list = orders.filter((o) => (tab === 'active' ? ACTIVE.includes(o.status) : tab === 'done' ? o.status === 'delivered' : o.status === 'cancelled'));
  return (
    <Screen title={t('shop.orders')} refreshing={refreshing} onRefresh={refresh}>
      <Segmented items={[{ key: 'active', label: t('shop.oActive') }, { key: 'done', label: t('shop.oDone') }, { key: 'cancelled', label: t('shop.oCancelled') }]} value={tab} onChange={setTab} />
      {loading ? <SkeletonList rows={5} /> : !list.length ? <EmptyState icon="receipt-outline" title={t('shop.ordersEmpty')} action={t('shop.goShop')} onAction={() => router.push('/shop')} /> : list.map((o) => (
        <Card key={o.id} testID={`order-${o.id}`} onPress={() => router.push(`/shop/order/${o.id}`)}>
          <Row justify="space-between"><T v="bodyStrong">{t('shop.order', { id: o.id })}</T><StatusBadge status={o.status} /></Row>
          <T v="caption" color={colors.textMuted}>{t('shop.placed', { d: f.date(o.date) })} · {t(o.method === 'delivery' ? 'shop.delivery' : 'shop.pickup')}</T>
          <Row justify="space-between" style={{ marginTop: 10 }}>
            <Row gap={6}>{o.items.slice(0, 3).map((it, i) => <Img key={i} src={images[productSync(it.id).img]} style={{ width: 44, height: 44 }} radius={10} />)}{o.items.length > 3 ? <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}><T v="captionStrong">+{o.items.length - 3}</T></View> : null}</Row>
            <T v="h3">{money(o.total)}</T>
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
