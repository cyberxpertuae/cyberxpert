import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, EmptyState, ProductCard } from '../../src/components';
import { useApp } from '../../src/store/app';
import { productSync } from '../../src/services/shopService';

/** S11 Favorites */
export default function Favorites() {
  const { t } = useI18n();
  const favs = useApp((s) => s.favorites);
  return (
    <Screen title={t('shop.favorites')}>
      {!favs.length ? <EmptyState icon="heart-outline" title={t('shop.favEmpty')} body={t('shop.favEmptyBody')} action={t('shop.goShop')} onAction={() => router.push('/shop')} /> : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{favs.map((id) => <ProductCard key={id} p={productSync(id)} />)}</View>
      )}
    </Screen>
  );
}
