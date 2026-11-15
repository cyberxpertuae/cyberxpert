import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../i18n';
import { colors } from '../theme';
import { useApp } from '../store/app';
import { images } from '../data/images';
import { shopService, Product } from '../services/shopService';
import { T } from './T';
import { Row, Col } from './Layout';
import { Icon } from './Icon';
import { Card, Img, Pill } from './UI';
import { useToast } from './Overlays';

export function ProductCard({ p, width = '47.5%' }: { p: Product; width?: any }) {
  const { t, tr, money } = useI18n();
  const toast = useToast();
  const fav = useApp((s) => s.favorites.includes(p.id));
  return (
    <Card testID={`product-${p.id}`} padded={false} style={{ width }} onPress={() => router.push(`/shop/${p.id}`)}>
      <View>
        <Img src={images[p.img]} style={{ height: 140, width: '100%', opacity: p.stock ? 1 : 0.5 }} />
        <Pressable testID={`fav-${p.id}`} hitSlop={8} onPress={() => toast(shopService.toggleFavorite(p.id) ? t('shop.favAdded') : t('shop.favRemoved'), 'info')} style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={fav ? 'heart' : 'heart-outline'} size={18} color={fav ? colors.danger : colors.text} />
        </Pressable>
        {!p.stock ? <View style={{ position: 'absolute', bottom: 8, left: 8 }}><Pill label={t('common.soldOut')} bg={colors.black} fg="#fff" /></View> : p.old ? <View style={{ position: 'absolute', bottom: 8, left: 8 }}><Pill label={`−${Math.round((1 - p.price / p.old) * 100)}%`} bg={colors.danger} fg="#fff" /></View> : null}
      </View>
      <Col gap={3} style={{ padding: 10 }}>
        <T v="captionStrong" numberOfLines={2} style={{ minHeight: 38 }}>{tr(p.name)}</T>
        <Row gap={4}><Icon name="star" size={12} color={colors.gold} /><T v="micro" color={colors.textMuted}>{p.rating} · {t('shop.reviews', { n: p.reviews })}</T></Row>
        <Row gap={6}>
          <T v="bodyStrong">{money(p.price)}</T>
          {p.old ? <T v="micro" color={colors.textSubtle} style={{ textDecorationLine: 'line-through' }}>{money(p.old)}</T> : null}
        </Row>
      </Col>
    </Card>
  );
}
