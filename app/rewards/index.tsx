import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, ProgressBar, TierBadge, ListRow, Divider, SectionHeader, HList, Img, EmptyState, IconName } from '../../src/components';
import { colors, radius, tierColors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { images } from '../../src/data/images';
import { rewardsService } from '../../src/services/rewardsService';
import { catalogService } from '../../src/services/catalogService';
import { useAsync } from '../../src/utils/useAsync';

/** L01 Empire Rewards */
export default function Rewards() {
  const { t, tr, num } = useI18n();
  const user = useApp((s) => s.user);
  useApp((s) => s.points);
  const { data: rewards } = useAsync(() => rewardsService.getRewards(), []);
  if (!user) return <Screen title={t('rewards.title')}><EmptyState icon="gift-outline" title={t('guest.title')} body={t('guest.body')} action={t('guest.create')} onAction={() => router.push('/auth/register')} /></Screen>;
  const r = rewardsService.summary();
  const tier = catalogService.tierSync(r.tier);
  const ways: { icon: IconName; label: string }[] = [{ icon: 'cart-outline', label: t('rewards.w_spend') }, { icon: 'qr-code-outline', label: t('rewards.w_checkin') }, { icon: 'barbell-outline', label: t('rewards.w_workout') }, { icon: 'people-outline', label: t('rewards.w_refer') }];
  return (
    <Screen title={t('rewards.title')}>
      <View style={{ borderRadius: radius.xl, overflow: 'hidden' }} testID="rewards-card">
        <LinearGradient colors={[colors.black, '#2A210B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 20, gap: 12 }}>
          <View style={{ position: 'absolute', right: -40, bottom: -60, width: 200, height: 200, borderRadius: 100, borderWidth: 16, borderColor: tierColors[r.tier] + '40' }} />
          <Row justify="space-between"><TierBadge tier={r.tier} /><T v="micro" color={colors.onDarkMuted}>{t('rewards.discount', { n: r.discount })}</T></Row>
          <Col><T v="micro" color={colors.onDarkMuted}>{t('rewards.balance').toUpperCase()}</T><Row gap={6} align="flex-end"><T v="number" color={colors.onDark}>{num(r.points)}</T><T v="bodyStrong" color={colors.gold} style={{ marginBottom: 6 }}>{t('common.pts')}</T></Row></Col>
          <ProgressBar value={r.progress} track={colors.ink3} color={colors.gold} />
          <Row justify="space-between"><T v="caption" color={colors.onDark}>{r.next ? t('rewards.toNext', { p: num(r.toNext), tier: t(`tier.${r.next.id}`) }) : t('rewards.maxTier')}</T><T v="micro" color={colors.onDarkMuted}>{t('rewards.lifetime', { p: num(r.lifetime) })}</T></Row>
        </LinearGradient>
      </View>
      <Row gap={10}>
        {[{ i: 'gift-outline', l: t('rewards.catalog'), to: '/rewards/catalog' }, { i: 'ticket-outline', l: t('rewards.vouchers'), to: '/rewards/vouchers' }, { i: 'people-outline', l: t('rewards.refer'), to: '/rewards/refer' }].map((x) => (
          <Pressable testID={`rw-${x.to.split('/').pop()}`} key={x.to} onPress={() => router.push(x.to as any)} style={{ flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 12, alignItems: 'center', gap: 6 }}>
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.yellowSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name={x.i as IconName} /></View>
            <T v="micro" center numberOfLines={2}>{x.l}</T>
          </Pressable>
        ))}
      </Row>
      <SectionHeader title={t('rewards.catalog')} action={t('common.seeAll')} onAction={() => router.push('/rewards/catalog')} />
      <HList data={(rewards ?? []).slice(0, 6)} keyExtractor={(x) => x.id} renderItem={(x) => (
        <Card padded={false} style={{ width: 150 }} onPress={() => router.push(`/rewards/${x.id}`)}>
          <Img src={images[x.img]} style={{ height: 90, width: '100%' }} />
          <Col gap={2} style={{ padding: 10 }}><T v="captionStrong" numberOfLines={1}>{tr(x.title)}</T><Row gap={4}><Icon name="star" size={13} color={colors.gold} /><T v="captionStrong" color={colors.yellowDark}>{num(x.points)}</T></Row></Col>
        </Card>
      )} />
      <Card>
        <T v="h3" style={{ marginBottom: 8 }}>{t('rewards.benefits')}</T>
        <Col gap={8}>{tier.perks.map((p, i) => <Row key={i} gap={10}><Icon name="checkmark-circle" size={18} color={tierColors[r.tier]} /><T v="body" style={{ flex: 1 }}>{tr(p)}</T></Row>)}</Col>
      </Card>
      <Card>
        <T v="h3" style={{ marginBottom: 8 }}>{t('rewards.ways')}</T>
        <Col gap={10}>{ways.map((w) => <Row key={w.label} gap={10}><View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}><Icon name={w.icon} size={17} /></View><T v="body">{w.label}</T></Row>)}</Col>
      </Card>
      <Card style={{ paddingVertical: 4 }}>
        <ListRow testID="rw-history" icon="time-outline" title={t('rewards.history')} onPress={() => router.push('/rewards/history')} />
        <Divider />
        <ListRow testID="rw-tiers" icon="podium-outline" title={t('rewards.tiers')} onPress={() => router.push('/rewards/tiers')} />
      </Card>
    </Screen>
  );
}
