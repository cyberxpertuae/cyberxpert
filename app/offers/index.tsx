import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Img, ChipRow, SkeletonList, EmptyState, Pill, Card } from '../../src/components';
import { colors } from '../../src/theme';
import { images } from '../../src/data/images';
import { offersService } from '../../src/services/offersService';
import { useAsync } from '../../src/utils/useAsync';
import { useFmt } from '../../src/utils/format';

/** O01 Offers */
export default function Offers() {
  const { t, tr } = useI18n();
  const f = useFmt();
  const [cat, setCat] = useState<'all' | 'memberships' | 'shop' | 'services' | 'members'>('all');
  const { data, loading, refreshing, refresh } = useAsync(() => offersService.getOffers(cat), [cat]);
  return (
    <Screen title={t('offers.title')} refreshing={refreshing} onRefresh={refresh}>
      <ChipRow items={(['all', 'memberships', 'shop', 'services', 'members'] as const).map((k) => ({ key: k, label: t(`offers.c_${k}`) }))} value={cat} onChange={setCat} />
      {loading ? <SkeletonList rows={4} card={120} /> : !data?.length ? <EmptyState icon="pricetags-outline" title={t('offers.empty')} /> : data.map((o) => (
        <Card key={o.id} testID={`offer-${o.id}`} padded={false} onPress={() => router.push(`/offers/${o.id}`)}>
          <View style={{ height: 150 }}>
            <Img src={images[o.img]} style={{ position: 'absolute', width: '100%', height: '100%' }} />
            <LinearGradient colors={['rgba(11,11,12,0)', 'rgba(11,11,12,0.85)']} style={{ flex: 1, justifyContent: 'flex-end', padding: 12 }}>
              <Pill label={tr(o.badge)} />
            </LinearGradient>
          </View>
          <Col gap={4} style={{ padding: 14 }}>
            <T v="h3">{tr(o.title)}</T>
            <T v="caption" color={colors.textMuted} numberOfLines={2}>{tr(o.desc)}</T>
            <Row justify="space-between" style={{ marginTop: 4 }}>
              <Row gap={6}><Icon name="time-outline" size={15} color={colors.textMuted} /><T v="micro" color={colors.textMuted}>{t('offers.ends', { d: f.date(o.until) })}</T></Row>
              <T v="captionStrong" color={colors.yellowDark}>{o.code}</T>
            </Row>
          </Col>
        </Card>
      ))}
    </Screen>
  );
}
