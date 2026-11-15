import React, { useEffect, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, EmptyState, SkeletonList, Chip, IconName } from '../src/components';
import { colors, fonts, radius } from '../src/theme';
import { images } from '../src/data/images';
import { searchService, SearchHit } from '../src/services/searchService';

const KIND_ICON: Record<string, IconName> = { plan: 'card-outline', product: 'bag-handle-outline', service: 'sparkles-outline', machine: 'construct-outline', exercise: 'barbell-outline' };

/** H02 Search */
export default function Search() {
  const { t, tr, isRTL, align, lang } = useI18n();
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>(lang === 'ar' ? ['واي', 'ضغط الأرجل'] : ['whey', 'leg press']);
  const popular = lang === 'ar' ? ['اشتراك', 'كرياتين', 'المشي', 'مدرب', 'C4'] : ['monthly', 'creatine', 'treadmill', 'training', 'C4'];
  useEffect(() => {
    if (!q.trim()) { setHits(null); return; }
    setLoading(true);
    const id = setTimeout(async () => { const r = await searchService.search(q); setHits(r); setLoading(false); }, 300);
    return () => clearTimeout(id);
  }, [q]);
  return (
    <Screen title={t('search.title')}>
      <Row gap={10} style={{ backgroundColor: colors.surface, borderRadius: radius.lg, height: 52, paddingHorizontal: 14, borderWidth: 1.5, borderColor: colors.yellow }}>
        <Icon name="search-outline" size={20} color={colors.textMuted} />
        <TextInput testID="search-input" autoFocus value={q} onChangeText={setQ} placeholder={t('home.searchPh')} placeholderTextColor={colors.textSubtle} onSubmitEditing={() => q && setRecent([q, ...recent.filter((r) => r !== q)].slice(0, 5))} style={{ flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.text, textAlign: align, writingDirection: isRTL ? 'rtl' : 'ltr' }} />
        {q ? <Pressable onPress={() => setQ('')}><Icon name="close-circle" size={20} color={colors.textSubtle} /></Pressable> : null}
      </Row>
      {!q ? (
        <Col gap={14}>
          <T v="h3">{t('search.recent')}</T>
          <Row gap={8} wrap>{recent.map((r) => <Chip key={r} icon="time-outline" label={r} onPress={() => setQ(r)} />)}</Row>
          <T v="h3">{t('search.suggestions')}</T>
          <Row gap={8} wrap>{popular.map((r) => <Chip testID={`search-pop-${r}`} key={r} icon="trending-up-outline" label={r} onPress={() => setQ(r)} />)}</Row>
        </Col>
      ) : loading ? <SkeletonList rows={4} /> : hits && hits.length === 0 ? (
        <EmptyState icon="search-outline" title={t('search.empty', { q })} body={t('search.emptyBody')} />
      ) : (
        (hits ?? []).map((h) => (
          <Card key={h.kind + h.id} testID={`hit-${h.id}`} padded={false} onPress={() => router.push(h.route as any)}>
            <Row gap={12} style={{ padding: 10 }}>
              {h.img ? <Img src={images[h.img]} style={{ width: 54, height: 54 }} radius={12} /> : <View style={{ width: 54, height: 54, borderRadius: 12, backgroundColor: colors.yellowSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name={KIND_ICON[h.kind]} /></View>}
              <Col style={{ flex: 1 }}><T v="bodyStrong" numberOfLines={1}>{tr(h.title)}</T><T v="caption" color={colors.textMuted}>{t(`search.kind_${h.kind}`)}</T></Col>
              <Icon name="chevron-forward" size={18} color={colors.textSubtle} />
            </Row>
          </Card>
        ))
      )}
    </Screen>
  );
}
