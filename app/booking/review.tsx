import React, { useState } from 'react';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, Button, Steps, KV, Divider } from '../../src/components';
import { colors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { images } from '../../src/data/images';
import { bookingService, serviceSync, coachSync } from '../../src/services/bookingService';
import { rewardsService } from '../../src/services/rewardsService';
import { useFmt } from '../../src/utils/format';

/** C06 Review & confirm (step 3/3) */
export default function BookingReview() {
  const { t, tr, money } = useI18n();
  const f = useFmt();
  const d = useApp((s) => s.booking);
  const cards = useApp((s) => s.cards);
  const [busy, setBusy] = useState(false);
  const svc = serviceSync(d.serviceId!);
  const coach = coachSync(d.coachId);
  const pkg = svc.packages.find((p) => p.id === d.pkg) ?? svc.packages[0];
  const disc = rewardsService.summary().discount;
  const price = pkg ? Math.round(pkg.price * (1 - disc / 100)) : 0;
  const card = cards.find((c) => c.default) ?? cards[0];
  const confirm = async () => { setBusy(true); const b = await bookingService.bookDraft(); setBusy(false); router.replace({ pathname: '/booking/success', params: { id: b.id } }); };
  return (
    <Screen title={t('booking.reviewTitle')} footer={<Button testID="bk-confirm" title={`${t('booking.confirmBook')} · ${money(price)}`} loading={busy} onPress={confirm} />}>
      <Steps total={3} current={2} />
      <T v="captionStrong" color={colors.yellowDark}>{t('booking.step', { a: 3 })}</T>
      <Card padded={false}><Row gap={12} style={{ padding: 12 }}><Img src={images[svc.img]} style={{ width: 70, height: 70 }} radius={14} /><Col style={{ flex: 1 }}><T v="h3">{tr(svc.name)}</T><T v="caption" color={colors.textMuted}>{t('services.durationMin', { n: svc.duration })}</T></Col></Row></Card>
      <Card>
        <KV k={t('booking.coach')} v={coach ? tr(coach.name) : t('booking.any')} />
        <KV k={t('booking.when')} v={`${f.dow(d.date!)} ${f.short(d.date!)} · ${f.time(d.time!)}`} />
        <KV k={t('booking.package')} v={pkg ? (pkg.sessions === 1 ? t('services.session1') : t('services.sessions', { n: pkg.sessions })) : '-'} />
        <Divider style={{ marginVertical: 6 }} />
        {disc && pkg ? <KV k={t('common.discount')} v={'− ' + money(pkg.price - price)} color={colors.success} /> : null}
        <KV k={t('booking.price')} v={money(price)} strong />
      </Card>
      {card ? <Card><Row gap={12}><Icon name="card" color={colors.yellowDark} /><Col style={{ flex: 1 }}><T v="bodyStrong">{t('booking.payCard')}</T><T v="caption" color={colors.textMuted}>{t(`pay.${card.brand}`)} •••• {card.last4}</T></Col><T v="captionStrong" color={colors.yellowDark} onPress={() => router.push('/checkout/add-card')}>{t('common.edit')}</T></Row></Card> : null}
      <Row gap={8}><Icon name="information-circle-outline" size={18} color={colors.textMuted} /><T v="caption" color={colors.textMuted}>{t('booking.policy')}</T></Row>
    </Screen>
  );
}
