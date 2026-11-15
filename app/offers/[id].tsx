import React from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, Button, Pill, Skeleton, TierBadge, useToast } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { useApp, TODAY } from '../../src/store/app';
import { images } from '../../src/data/images';
import { offersService } from '../../src/services/offersService';
import { tierRank } from '../../src/services/rewardsService';
import { useAsync } from '../../src/utils/useAsync';
import { useFmt } from '../../src/utils/format';
import { requireAuth } from '../../src/utils/guard';

/** O02 Offer detail */
export default function OfferDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tr } = useI18n();
  const f = useFmt();
  const toast = useToast();
  const user = useApp((s) => s.user);
  const { data: o, loading } = useAsync(() => offersService.getOffer(id!), [id]);
  if (loading || !o) return <Screen title=" "><Skeleton h={220} r={24} /><Skeleton h={22} w="70%" /></Screen>;
  const locked = tierRank(user?.tier ?? 'bronze') < tierRank(o.minTier);
  const use = () => requireAuth(() => {
    if (o.target.type === 'plan') { useApp.getState().set({ checkout: { planId: o.target.id, start: TODAY, addons: [], promo: o.code, promoPct: o.discount >= 100 ? 0 : o.discount, usePoints: false, method: null } }); router.push('/checkout/start'); }
    else if (o.target.type === 'product') router.push(`/shop/${o.target.id}`);
    else router.push(`/services/${o.target.id}`);
  });
  return (
    <Screen title={t('offers.title')} footer={locked ? <Button title={t('offers.locked', { tier: t(`tier.${o.minTier}`) })} disabled icon="lock-closed" /> : <Button testID="offer-use" title={t('offers.use')} onPress={use} iconEnd="arrow-forward" />}>
      <Img src={images[o.img]} style={{ height: 220, width: '100%' }} radius={radius.xl} />
      <Pill label={tr(o.badge)} />
      <T v="display">{tr(o.title)}</T>
      <T v="body" color={colors.textMuted}>{tr(o.desc)}</T>
      <Card style={{ backgroundColor: colors.black }}>
        <T v="micro" color={colors.onDarkMuted}>{t('offers.code').toUpperCase()}</T>
        <Row justify="space-between" style={{ marginTop: 4 }}>
          <T v="h1" color={colors.yellow} style={{ letterSpacing: 2 }}>{o.code}</T>
          <Button testID="offer-copy" small full={false} icon="copy-outline" title={t('common.copy')} onPress={async () => { await Clipboard.setStringAsync(o.code); toast(t('common.copied')); }} />
        </Row>
      </Card>
      <Card style={{ gap: 10 }}>
        <Row gap={10}><Icon name="time-outline" color={colors.textMuted} /><T v="body">{t('offers.ends', { d: f.date(o.until) })}</T></Row>
        <Row gap={10}><Icon name="people-outline" color={colors.textMuted} /><Col style={{ flex: 1 }} gap={4}><T v="body">{t('offers.eligibility')}</T><Row gap={6}><TierBadge tier={o.minTier} small /><T v="caption" color={colors.textMuted}>{t('offers.forTier', { tier: t(`tier.${o.minTier}`) })}</T></Row></Col></Row>
      </Card>
      <View />
    </Screen>
  );
}
