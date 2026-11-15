import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, Segmented, EmptyState, SkeletonList, StatusBadge, useToast } from '../../src/components';
import { colors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { images } from '../../src/data/images';
import { rewardsService } from '../../src/services/rewardsService';
import { useAsync } from '../../src/utils/useAsync';
import { useFmt } from '../../src/utils/format';

/** L07 My vouchers */
export default function Vouchers() {
  const { t, tr } = useI18n();
  const f = useFmt();
  const toast = useToast();
  const [tab, setTab] = useState<'active' | 'used' | 'expired'>('active');
  const list = useApp((s) => s.vouchers);
  const { loading } = useAsync(() => rewardsService.getVouchers(), []);
  const items = list.filter((v) => v.status === tab);
  return (
    <Screen title={t('rewards.vouchers')}>
      <Segmented items={[{ key: 'active', label: t('rewards.vActive'), count: list.filter((v) => v.status === 'active').length }, { key: 'used', label: t('rewards.vUsed') }, { key: 'expired', label: t('rewards.vExpired') }]} value={tab} onChange={setTab} />
      {loading ? <SkeletonList rows={4} /> : !items.length ? <EmptyState icon="ticket-outline" title={t('rewards.emptyV')} /> : items.map((v) => (
        <Card key={v.id} padded={false} testID={`voucher-${v.id}`}>
          <Row>
            <Img src={images[v.img]} style={{ width: 96, height: 110, opacity: v.status === 'active' ? 1 : 0.5 }} />
            <View style={{ width: 0, borderLeftWidth: 2, borderStyle: 'dashed', borderColor: colors.border, alignSelf: 'stretch' }} />
            <Col gap={4} style={{ flex: 1, padding: 12 }}>
              <T v="bodyStrong" numberOfLines={1}>{tr(v.title)}</T>
              <T v="caption" color={colors.textMuted}>{t('rewards.until', { d: f.date(v.until) })}</T>
              <Row justify="space-between">
                <T v="captionStrong" style={{ letterSpacing: 1 }}>{v.code}</T>
                {v.status === 'active' ? <Pressable testID={`copy-${v.id}`} onPress={async () => { await Clipboard.setStringAsync(v.code); toast(t('common.copied')); }}><Icon name="copy-outline" size={18} color={colors.yellowDark} /></Pressable> : <StatusBadge status={v.status} />}
              </Row>
            </Col>
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
