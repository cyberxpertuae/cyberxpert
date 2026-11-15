import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, IconButton, ChipRow, SkeletonList, EmptyState, ProductCard, Sheet, Chip, Button, ErrorState, Wrap } from '../../src/components';
import { colors, fonts, radius } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { shopService, ProductQuery } from '../../src/services/shopService';
import { useAsync } from '../../src/utils/useAsync';

/** S01 Shop + S02 Filter & sort sheet */
export default function Shop() {
  const { t, tr, align, isRTL, money } = useI18n();
  const cartCount = useApp((s) => s.cart.reduce((a, c) => a + c.qty, 0));
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const [sheet, setSheet] = useState(false);
  const [filter, setFilter] = useState<ProductQuery>({ sort: 'popular' });
  const [draft, setDraft] = useState<ProductQuery>(filter);
  const { data, loading, error, reload, refreshing, refresh } = useAsync(() => shopService.getProducts({ ...filter, cat, q }), [cat, q, filter]);
  const cats = [{ key: 'all', label: t('common.all') }, ...shopService.categoriesSync().map((c) => ({ key: c.id, label: tr(c.name), icon: c.icon as any }))];
  const active = (filter.sort && filter.sort !== 'popular') || filter.inStock || filter.max;
  return (
    <Screen title={t('shop.title')} refreshing={refreshing} onRefresh={refresh} header={{ right: <><IconButton testID="shop-fav" name="heart-outline" onPress={() => router.push('/shop/favorites')} /><IconButton testID="shop-cart" name="bag-handle-outline" badge={cartCount} onPress={() => router.push('/shop/cart')} /></> }}>
      <Row gap={10}>
        <Row gap={10} style={{ flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, height: 48, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border }}>
          <Icon name="search-outline" size={19} color={colors.textMuted} />
          <TextInput testID="shop-search" value={q} onChangeText={setQ} placeholder={t('shop.searchPh')} placeholderTextColor={colors.textSubtle} style={{ flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.text, textAlign: align, writingDirection: isRTL ? 'rtl' : 'ltr' }} />
        </Row>
        <Pressable testID="shop-filter" onPress={() => { setDraft(filter); setSheet(true); }} style={{ width: 48, height: 48, borderRadius: radius.lg, backgroundColor: active ? colors.yellow : colors.black, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="options-outline" color={active ? colors.black : colors.yellow} />
        </Pressable>
      </Row>
      <ChipRow items={cats} value={cat} onChange={setCat} />
      {loading ? <SkeletonList rows={4} card={110} /> : error ? <ErrorState onRetry={reload} /> : !data?.length ? <EmptyState icon="bag-outline" title={t('shop.empty')} body={t('shop.emptyBody')} action={t('common.reset')} onAction={() => { setFilter({ sort: 'popular' }); setQ(''); setCat('all'); }} /> : (
        <Wrap style={{ gap: 12 }}>{data.map((p) => <ProductCard key={p.id} p={p} />)}</Wrap>
      )}
      <Sheet visible={sheet} onClose={() => setSheet(false)} title={t('shop.filter')}>
        <Col gap={14}>
          <T v="h3">{t('shop.sort')}</T>
          <Row gap={8} wrap>{(['popular', 'low', 'high', 'rating'] as const).map((s) => <Chip testID={`sort-${s}`} key={s} label={t(`shop.s_${s}`)} selected={draft.sort === s} onPress={() => setDraft({ ...draft, sort: s })} />)}</Row>
          <T v="h3">{t('shop.maxPrice')}</T>
          <Row gap={8} wrap>{[undefined, 50, 100, 200].map((m) => <Chip key={String(m)} label={m ? money(m) : t('shop.any')} selected={draft.max === m} onPress={() => setDraft({ ...draft, max: m })} />)}</Row>
          <Chip testID="instock" icon="checkmark-circle-outline" label={t('shop.inStock')} selected={!!draft.inStock} onPress={() => setDraft({ ...draft, inStock: !draft.inStock })} />
          <Row gap={10}>
            <Button title={t('common.reset')} variant="outline" full={false} style={{ flex: 1 }} onPress={() => setDraft({ sort: 'popular' })} />
            <Button testID="filter-apply" title={t('shop.showResults')} full={false} style={{ flex: 2 }} onPress={() => { setFilter(draft); setSheet(false); }} />
          </Row>
        </Col>
      </Sheet>
    </Screen>
  );
}
