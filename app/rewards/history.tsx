import React, { useState } from 'react';
import { View } from 'react-native';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Segmented, SkeletonList, EmptyState } from '../../src/components';
import { colors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { rewardsService } from '../../src/services/rewardsService';
import { useAsync } from '../../src/utils/useAsync';
import { useFmt } from '../../src/utils/format';

/** L05 Points history */
export default function PointsHistory() {
  const { t, tr, num } = useI18n();
  const f = useFmt();
  const [tab, setTab] = useState<'all' | 'earn' | 'spend'>('all');
  const list = useApp((s) => s.points);
  const { loading } = useAsync(() => rewardsService.getHistory(), []);
  const items = list.filter((p) => tab === 'all' || p.type === tab);
  return (
    <Screen title={t('rewards.history')}>
      <Segmented items={[{ key: 'all', label: t('common.all') }, { key: 'earn', label: t('rewards.earned') }, { key: 'spend', label: t('rewards.spent') }]} value={tab} onChange={setTab} />
      {loading ? <SkeletonList rows={7} card={60} /> : !items.length ? <EmptyState icon="star-outline" title={t('rewards.emptyHist')} /> : (
        <Card style={{ paddingVertical: 4 }}>
          {items.map((p, i) => (
            <Row key={p.id} gap={12} style={{ paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}>
              <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: p.type === 'earn' ? colors.successSoft : colors.dangerSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={p.type === 'earn' ? 'arrow-down' : 'arrow-up'} size={18} color={p.type === 'earn' ? colors.success : colors.danger} noFlip />
              </View>
              <Col style={{ flex: 1 }}><T v="bodyStrong" numberOfLines={1}>{tr(p.title)}</T><T v="caption" color={colors.textMuted}>{f.date(p.date)}</T></Col>
              <T v="bodyStrong" color={p.type === 'earn' ? colors.success : colors.danger}>{p.pts > 0 ? '+' : ''}{num(p.pts)}</T>
            </Row>
          ))}
        </Card>
      )}
    </Screen>
  );
}
