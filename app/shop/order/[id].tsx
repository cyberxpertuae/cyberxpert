import React, { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useI18n } from '../../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, KV, Divider, StatusBadge, Button, Dialog, Skeleton, useToast } from '../../../src/components';
import { colors } from '../../../src/theme';
import { useApp } from '../../../src/store/app';
import { images } from '../../../src/data/images';
import { shopService, productSync } from '../../../src/services/shopService';
import { useAsync } from '../../../src/utils/useAsync';
import { useFmt } from '../../../src/utils/format';

/** S10 Order tracking */
export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tr, money } = useI18n();
  const f = useFmt();
  const toast = useToast();
  const { loading } = useAsync(() => shopService.getOrder(id!), [id]);
  const o = useApp((s) => s.orders.find((x) => x.id === id));
  const [cancel, setCancel] = useState(false);
  const [busy, setBusy] = useState(false);
  if (loading || !o) return <Screen title=" "><Skeleton h={200} r={24} /></Screen>;
  const stepIdx = o.status === 'processing' ? 1 : o.status === 'ready' || o.status === 'shipped' ? 2 : o.status === 'delivered' ? 3 : -1;
  const steps = [t('shop.t_placed'), t('shop.t_processing'), t('shop.t_ready'), t('shop.t_done')];
  return (
    <Screen title={t('shop.order', { id: o.id })} footer={o.status === 'processing' ? <Button testID="order-cancel" title={t('shop.cancelOrder')} variant="danger" onPress={() => setCancel(true)} /> : o.status === 'delivered' || o.status === 'cancelled' ? <Button title={t('shop.reorder')} icon="refresh" onPress={() => { o.items.forEach((i) => shopService.addToCart(i.id, i.qty, i.opt)); router.push('/shop/cart'); }} /> : undefined}>
      <Card>
        <Row justify="space-between" style={{ marginBottom: 12 }}><T v="caption" color={colors.textMuted}>{t('shop.placed', { d: f.date(o.date) })}</T><StatusBadge status={o.status} /></Row>
        {o.status === 'cancelled' ? <Row gap={8}><Icon name="close-circle" color={colors.danger} /><T v="bodyStrong" color={colors.danger}>{t('status.cancelled')}</T></Row> : steps.map((s, i) => (
          <Row key={s} gap={12} align="flex-start">
            <Col style={{ alignItems: 'center' }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: i <= stepIdx ? colors.yellow : colors.surface2, alignItems: 'center', justifyContent: 'center' }}>{i <= stepIdx ? <Icon name="checkmark" size={14} color={colors.black} /> : null}</View>
              {i < 3 ? <View style={{ width: 2, height: 26, backgroundColor: i < stepIdx ? colors.yellow : colors.border }} /> : null}
            </Col>
            <T v={i === stepIdx ? 'bodyStrong' : 'body'} color={i <= stepIdx ? colors.text : colors.textSubtle}>{s}</T>
          </Row>
        ))}
      </Card>
      <Card style={{ gap: 10 }}>
        {o.items.map((it, i) => { const p = productSync(it.id); return (
          <Row key={i} gap={10}><Img src={images[p.img]} style={{ width: 52, height: 52 }} radius={12} /><Col style={{ flex: 1 }}><T v="captionStrong" numberOfLines={1}>{tr(p.name)}</T><T v="micro" color={colors.textMuted}>× {it.qty}{p.options && it.opt != null ? ` · ${tr(p.options.values[it.opt])}` : ''}</T></Col><T v="captionStrong">{money(p.price * it.qty)}</T></Row>
        ); })}
        <Divider />
        <KV k={t(o.method === 'delivery' ? 'shop.delivery' : 'shop.pickup')} v={o.method === 'delivery' ? t('shop.deliverySub') : t('shop.pickupSub')} />
        <KV k={t('common.total')} v={money(o.total)} strong />
      </Card>
      <Dialog visible={cancel} onClose={() => setCancel(false)} danger icon="close-circle-outline" title={t('shop.cancelQ')} body={t('shop.cancelBody')} confirm={t('shop.cancelOrder')} cancel={t('common.back')} loading={busy}
        onConfirm={async () => { setBusy(true); await shopService.cancelOrder(o.id); setBusy(false); setCancel(false); toast(t('shop.cancelled'), 'info'); }} />
    </Screen>
  );
}
