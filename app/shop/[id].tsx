import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, Button, Chip, QtyStepper, Skeleton, Pill, IconButton, useToast } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { images } from '../../src/data/images';
import { shopService } from '../../src/services/shopService';
import { rewardsService } from '../../src/services/rewardsService';
import { useAsync } from '../../src/utils/useAsync';

/** S03 Product detail */
export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tr, money } = useI18n();
  const toast = useToast();
  const user = useApp((s) => s.user);
  const fav = useApp((s) => s.favorites.includes(id!));
  const cartCount = useApp((s) => s.cart.reduce((a, c) => a + c.qty, 0));
  const { data: p, loading } = useAsync(() => shopService.getProduct(id!), [id]);
  const [opt, setOpt] = useState<number | null>(0);
  const [qty, setQty] = useState(1);
  if (loading || !p) return <Screen title=" "><Skeleton h={300} r={24} /><Skeleton h={24} w="70%" /><Skeleton h={80} r={16} /></Screen>;
  const disc = rewardsService.summary().discount;
  const add = () => { shopService.addToCart(p.id, qty, p.options ? opt : null); toast(t('shop.added')); };
  return (
    <Screen title={tr(p.name)} header={{ right: <><IconButton testID="pd-fav" name={fav ? 'heart' : 'heart-outline'} color={fav ? colors.danger : colors.text} onPress={() => toast(shopService.toggleFavorite(p.id) ? t('shop.favAdded') : t('shop.favRemoved'), 'info')} /><IconButton name="bag-handle-outline" badge={cartCount} onPress={() => router.push('/shop/cart')} /></> }}
      footer={p.stock ? <Row gap={12}><QtyStepper value={qty} onChange={setQty} max={p.stock} /><Button testID="pd-add" title={`${t('shop.addToCart')} · ${money(p.price * qty)}`} full={false} style={{ flex: 1 }} onPress={add} /></Row> : <Button title={t('shop.outOfStock')} disabled />}>
      <Img src={images[p.img]} style={{ height: 300, width: '100%' }} radius={radius.xl} />
      <Col gap={6}>
        <T v="h1">{tr(p.name)}</T>
        <Row gap={6}><Icon name="star" size={15} color={colors.gold} /><T v="captionStrong">{p.rating}</T><T v="caption" color={colors.textMuted}>({t('shop.reviews', { n: p.reviews })})</T><T v="caption" color={p.stock ? colors.success : colors.danger}>· {p.stock ? t('shop.inStockN', { n: p.stock }) : t('shop.outOfStock')}</T></Row>
        <Row gap={8} align="flex-end">
          <T v="display">{money(p.price)}</T>
          {p.old ? <T v="body" color={colors.textSubtle} style={{ textDecorationLine: 'line-through', marginBottom: 6 }}>{money(p.old)}</T> : null}
        </Row>
        {user && disc ? <Pill label={`${t('common.memberPrice')}: ${money(shopService.memberPrice(p.price))} (−${disc}%)`} icon="star" bg={colors.black} fg={colors.gold} /> : null}
      </Col>
      {p.options ? (
        <Col gap={8}>
          <T v="h3">{tr(p.options.label)}</T>
          <Row gap={8} wrap>{p.options.values.map((v, i) => <Chip testID={`opt-${i}`} key={i} label={tr(v)} selected={opt === i} onPress={() => setOpt(i)} />)}</Row>
        </Col>
      ) : null}
      <Card><T v="h3" style={{ marginBottom: 6 }}>{t('shop.description')}</T><T v="body" color={colors.textMuted}>{tr(p.desc)}</T></Card>
      {p.nutrition ? <Card><Row gap={10}><Icon name="nutrition-outline" color={colors.yellowDark} /><Col><T v="captionStrong">{t('shop.nutrition')}</T><T v="caption" color={colors.textMuted}>{p.nutrition}</T></Col></Row></Card> : null}
      <Row gap={8} style={{ backgroundColor: colors.yellowSoft, borderRadius: radius.md, padding: 12 }}><Icon name="storefront-outline" size={18} color={colors.yellowDark} /><T v="caption">{t('shop.pickupNote')}</T></Row>
    </Screen>
  );
}
