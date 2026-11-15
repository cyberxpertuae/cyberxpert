import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, ChipRow, SkeletonList, Pill } from '../../src/components';
import { colors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { images } from '../../src/data/images';
import { rewardsService, tierRank } from '../../src/services/rewardsService';
import { useAsync } from '../../src/utils/useAsync';

/** L03 Rewards catalog */
export default function Catalog() {
  const { t, tr, num } = useI18n();
  const [cat, setCat] = useState<'all' | 'shop' | 'services' | 'access' | 'discounts'>('all');
  const user = useApp((s) => s.user);
  const { data, loading } = useAsync(() => rewardsService.getRewards(cat), [cat]);
  return (
    <Screen title={t('rewards.catalog')} header={{ right: <Row gap={4}><Icon name="star" size={16} color={colors.gold} /><T v="bodyStrong">{num(user?.points ?? 0)}</T></Row> }}>
      <ChipRow items={(['all', 'shop', 'services', 'access', 'discounts'] as const).map((k) => ({ key: k, label: t(`rewards.cats_${k}`) }))} value={cat} onChange={setCat} />
      {loading ? <SkeletonList rows={5} /> : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {(data ?? []).map((r) => {
            const locked = tierRank(user?.tier ?? 'bronze') < tierRank(r.minTier);
            return (
              <Card key={r.id} testID={`reward-${r.id}`} padded={false} style={{ width: '47.5%' }} onPress={() => router.push(`/rewards/${r.id}`)}>
                <View>
                  <Img src={images[r.img]} style={{ height: 110, width: '100%', opacity: locked ? 0.45 : 1 }} />
                  {locked ? <View style={{ position: 'absolute', top: 8, start: 8 }}><Pill label={t('rewards.locked', { tier: t(`tier.${r.minTier}`) })} icon="lock-closed" bg={colors.black} fg={colors.gold} /></View> : null}
                </View>
                <Col gap={4} style={{ padding: 10 }}>
                  <T v="captionStrong" numberOfLines={2} style={{ minHeight: 38 }}>{tr(r.title)}</T>
                  <Row gap={4}><Icon name="star" size={14} color={colors.gold} /><T v="bodyStrong" color={colors.yellowDark}>{num(r.points)}</T></Row>
                </Col>
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}
