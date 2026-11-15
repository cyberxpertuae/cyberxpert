import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, TierBadge, Pill, Button, SkeletonList } from '../../src/components';
import { colors, tierColors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { catalogService } from '../../src/services/catalogService';
import { useAsync } from '../../src/utils/useAsync';

/** L02 Tiers compared — with or without subscription */
export default function Tiers() {
  const { t, tr, num } = useI18n();
  const user = useApp((s) => s.user);
  const { data, loading } = useAsync(() => catalogService.getTiers(), []);
  return (
    <Screen title={t('rewards.tiersTitle')} footer={<Button title={t('home.joinCta')} onPress={() => router.push('/plans')} />}>
      <T v="body" color={colors.textMuted}>{t('rewards.tiersSub')}</T>
      {loading ? <SkeletonList rows={4} card={120} /> : (data ?? []).map((tier) => {
        const me = user?.tier === tier.id;
        return (
          <Card key={tier.id} testID={`tier-${tier.id}`} style={{ borderWidth: me ? 2 : 0, borderColor: tierColors[tier.id], gap: 10 }}>
            <Row justify="space-between">
              <Row gap={8}><TierBadge tier={tier.id} />{me ? <Pill label={t('rewards.youAreHere')} /> : null}</Row>
              <T v="captionStrong" color={tierColors[tier.id]}>{tier.discount ? `−${tier.discount}%` : t('common.free')}</T>
            </Row>
            <Row gap={8} style={{ backgroundColor: colors.surface2, borderRadius: 12, padding: 10 }}>
              <Icon name="key-outline" size={16} color={colors.textMuted} />
              <Col style={{ flex: 1 }}><T v="micro" color={colors.textMuted}>{t('rewards.reach')}</T><T v="captionStrong">{tr(tier.how)}</T></Col>
              {tier.min ? <T v="micro" color={colors.textMuted}>{t('rewards.min', { p: num(tier.min) })}</T> : null}
            </Row>
            <Col gap={6}>{tier.perks.map((p, i) => <Row key={i} gap={8}><Icon name="checkmark" size={16} color={tierColors[tier.id]} /><T v="caption" style={{ flex: 1 }}>{tr(p)}</T></Row>)}</Col>
          </Card>
        );
      })}
      <View />
    </Screen>
  );
}
