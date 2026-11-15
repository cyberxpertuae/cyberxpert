import React from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, TierBadge, Button, Skeleton, ErrorState, Img } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { useApp, TODAY } from '../../src/store/app';
import { images } from '../../src/data/images';
import { catalogService } from '../../src/services/catalogService';
import { useAsync } from '../../src/utils/useAsync';
import { requireAuth } from '../../src/utils/guard';

/** M02 Plan details */
export default function PlanDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tr, money } = useI18n();
  const { data: p, loading, reload } = useAsync(() => catalogService.getPlan(id!), [id]);
  if (loading) return <Screen title=" "><Skeleton h={180} r={24} /><Skeleton h={22} w="60%" /><Skeleton h={160} r={24} /></Screen>;
  if (!p) return <Screen title=" "><ErrorState onRetry={reload} /></Screen>;
  const tier = catalogService.tierSync(p.tier);
  const start = () => requireAuth(() => { useApp.getState().set({ checkout: { planId: p.id, start: TODAY, addons: [], promo: null, promoPct: 0, usePoints: false, method: null } }); router.push('/checkout/start'); });
  return (
    <Screen title={tr(p.name)} footer={<Row gap={12}><Col style={{ flex: 1 }}><T v="micro" color={colors.textMuted}>{t('common.total')}</T><T v="h1">{money(p.price)}</T></Col><Button testID="plan-subscribe" title={t('plans.subscribe')} full={false} style={{ flex: 1.4 }} onPress={start} /></Row>}>
      <View style={{ borderRadius: radius.xl, overflow: 'hidden', height: 190 }}>
        <Img src={images[p.type === 'online' ? 's-online' : p.type === 'pass' ? 'c-functional' : 'hero-gym']} style={{ position: 'absolute', width: '100%', height: '100%' }} />
        <LinearGradient colors={['rgba(11,11,12,0.1)', 'rgba(11,11,12,0.9)']} style={{ flex: 1, padding: 16, justifyContent: 'flex-end', gap: 6 }}>
          <TierBadge tier={p.tier} />
          <T v="display" color={colors.onDark}>{tr(p.name)}</T>
          <Row gap={8}>
            <T v="h2" color={colors.yellow}>{money(p.price)}</T>
            {p.old ? <T v="body" color={colors.onDarkMuted} style={{ textDecorationLine: 'line-through' }}>{money(p.old)}</T> : null}
            <T v="caption" color={colors.onDarkMuted}>{p.months ? t('plans.perMonths', { n: p.months }) : t('plans.perOnce')}</T>
          </Row>
        </LinearGradient>
      </View>
      <Card>
        <T v="h3" style={{ marginBottom: 8 }}>{t('plans.whatsIncluded')}</T>
        <Col gap={10}>{p.features.map((f, i) => <Row key={i} gap={10}><Icon name="checkmark-circle" size={20} color={colors.success} /><T v="body" style={{ flex: 1 }}>{tr(f)}</T></Row>)}</Col>
      </Card>
      <Card style={{ backgroundColor: colors.black }}>
        <Row justify="space-between" style={{ marginBottom: 10 }}>
          <T v="h3" color={colors.onDark}>{t('plans.tierBenefits', { tier: t(`tier.${p.tier}`) })}</T>
          <T v="captionStrong" color={colors.yellow} onPress={() => router.push('/rewards/tiers')}>{t('plans.compare')}</T>
        </Row>
        <Col gap={8}>{tier.perks.map((f, i) => <Row key={i} gap={10}><Icon name="star" size={16} color={colors.gold} /><T v="body" color={colors.onDark} style={{ flex: 1 }}>{tr(f)}</T></Row>)}</Col>
      </Card>
      <Card>
        <T v="h3" style={{ marginBottom: 8 }}>{t('plans.terms')}</T>
        <Col gap={8}>
          {p.freezeDays ? <Row gap={10}><Icon name="snow-outline" size={18} color={colors.info} /><T v="body">{t('plans.term1', { n: p.freezeDays })}</T></Row> : null}
          <Row gap={10}><Icon name="storefront-outline" size={18} color={colors.yellowDark} /><T v="body">{t('plans.term2')}</T></Row>
          <Row gap={10}><Icon name="refresh-outline" size={18} color={colors.success} /><T v="body">{t('plans.term3')}</T></Row>
        </Col>
      </Card>
    </Screen>
  );
}
