import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, Button, Dialog, Sheet, Skeleton, Pill, SuccessBurst, useToast } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { images } from '../../src/data/images';
import { rewardsService, tierRank } from '../../src/services/rewardsService';
import { useAsync } from '../../src/utils/useAsync';
import { requireAuth } from '../../src/utils/guard';

/** L04 Reward detail + redeem */
export default function RewardDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tr, num } = useI18n();
  const toast = useToast();
  const user = useApp((s) => s.user);
  const { data: r, loading } = useAsync(() => rewardsService.getReward(id!), [id]);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  if (loading || !r) return <Screen title=" "><Skeleton h={220} r={24} /><Skeleton h={24} w="70%" /></Screen>;
  const locked = tierRank(user?.tier ?? 'bronze') < tierRank(r.minTier);
  const short = Math.max(0, r.points - (user?.points ?? 0));
  return (
    <Screen title={tr(r.title)} footer={
      locked ? <Button title={t('rewards.locked', { tier: t(`tier.${r.minTier}`) })} disabled icon="lock-closed" />
      : short > 0 ? <Button title={t('rewards.notEnough', { p: num(short) })} disabled />
      : <Button testID="rw-redeem" title={t('rewards.redeem', { p: num(r.points) })} icon="gift" onPress={() => requireAuth(() => setConfirm(true))} />
    }>
      <Img src={images[r.img]} style={{ height: 220, width: '100%' }} radius={radius.xl} />
      <Row gap={8}><Pill label={`${num(r.points)} ${t('common.pts')}`} icon="star" />{r.minTier !== 'bronze' ? <Pill label={t('rewards.locked', { tier: t(`tier.${r.minTier}`) })} bg={colors.black} fg={colors.gold} /> : null}</Row>
      <T v="display">{tr(r.title)}</T>
      <T v="body" color={colors.textMuted}>{tr(r.desc)}</T>
      <Card><Row gap={10}><Icon name="information-circle-outline" color={colors.textMuted} /><T v="caption" color={colors.textMuted} style={{ flex: 1 }}>{t('rewards.terms')}</T></Row></Card>
      <Dialog visible={confirm} onClose={() => setConfirm(false)} icon="gift-outline" title={t('rewards.confirmRedeem')} body={t('rewards.confirmRedeemBody', { p: num(r.points) })} confirm={t('common.confirm')} cancel={t('common.cancel')} loading={busy}
        onConfirm={async () => { setBusy(true); const c = await rewardsService.redeem(r); setBusy(false); setConfirm(false); setCode(c); }} />
      <Sheet visible={!!code} onClose={() => { setCode(null); router.push('/rewards/vouchers'); }}>
        <Col gap={12} style={{ alignItems: 'center' }}>
          <SuccessBurst icon="gift" size={80} />
          <T v="h1" center>{t('rewards.redeemed')}</T>
          <T v="body" center color={colors.textMuted}>{t('rewards.redeemedBody')}</T>
          <Row gap={10} style={{ backgroundColor: colors.black, borderRadius: radius.lg, paddingHorizontal: 18, paddingVertical: 14 }}>
            <T v="h2" color={colors.yellow} style={{ letterSpacing: 2 }}>{code}</T>
          </Row>
          <Button testID="rw-copy" title={t('common.copy')} icon="copy-outline" variant="outline" onPress={async () => { await Clipboard.setStringAsync(code ?? ''); toast(t('common.copied')); }} />
          <Button title={t('rewards.vouchers')} onPress={() => { setCode(null); router.push('/rewards/vouchers'); }} />
        </Col>
      </Sheet>
    </Screen>
  );
}
