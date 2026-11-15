import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, KV, Button, Dialog, StatusBadge, Skeleton, useToast } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { images } from '../../src/data/images';
import { bookingService, coachSync, serviceSync } from '../../src/services/bookingService';
import { useAsync } from '../../src/utils/useAsync';
import { useFmt } from '../../src/utils/format';

/** C11 Booking detail (reschedule / cancel) */
export default function BookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tr } = useI18n();
  const f = useFmt();
  const toast = useToast();
  const { loading } = useAsync(() => bookingService.getBooking(id!), [id]);
  const b = useApp((s) => s.bookings.find((x) => x.id === id));
  const [cancel, setCancel] = useState(false);
  const [busy, setBusy] = useState(false);
  if (loading || !b) return <Screen title=" "><Skeleton h={200} r={24} /></Screen>;
  const coach = coachSync(b.coach);
  const pkg = b.kind === 'service' && b.pkg ? serviceSync(b.ref).packages.find((p) => p.id === b.pkg) : null;
  return (
    <Screen title={t('booking.detail')} footer={b.status === 'upcoming' ? (
      <Row gap={10}>
        <Button testID="bk-reschedule" title={t('booking.reschedule')} variant="outline" full={false} style={{ flex: 1 }} onPress={() => { useApp.getState().set({ booking: { serviceId: b.ref, pkg: b.pkg ?? null, coachId: b.coach, classId: null, date: b.date, time: b.time } }); router.push(`/booking/slot?reschedule=${b.id}`); }} />
        <Button testID="bk-cancel" title={t('booking.cancel')} variant="danger" full={false} style={{ flex: 1 }} onPress={() => setCancel(true)} />
      </Row>) : undefined}>
      <Img src={images[bookingService.bookingImg(b)]} style={{ height: 190, width: '100%' }} radius={radius.xl} />
      <Row justify="space-between"><T v="h1" style={{ flex: 1 }}>{tr(bookingService.bookingTitle(b))}</T><StatusBadge status={b.status} /></Row>
      <Card>
        <KV k={t('booking.ref')} v={b.id} />
        <KV k={t('booking.when')} v={`${f.dow(b.date)} ${f.date(b.date)}`} />
        <KV k={t('common.from')} v={f.time(b.time)} />
        {coach ? <KV k={t('booking.coach')} v={tr(coach.name)} /> : null}
        <KV k={t('info.location')} v={t('booking.location')} />
      </Card>
      {pkg ? <Card><Row gap={10}><Icon name="layers-outline" color={colors.yellowDark} /><T v="body">{t('booking.sessionsLeft', { n: Math.max(0, pkg.sessions - (b.used ?? 0) - 1), m: pkg.sessions })}</T></Row></Card> : null}
      <Row gap={8}><Icon name="information-circle-outline" size={18} color={colors.textMuted} /><T v="caption" color={colors.textMuted}>{t('booking.policy')}</T></Row>
      <Dialog visible={cancel} onClose={() => setCancel(false)} danger icon="calendar-clear-outline" title={t('booking.cancelQ')} body={t('booking.cancelBody')} confirm={t('booking.cancel')} cancel={t('common.back')} loading={busy}
        onConfirm={async () => { setBusy(true); await bookingService.cancelBooking(b.id); setBusy(false); setCancel(false); toast(t('booking.cancelledToast'), 'info'); }} />
      <Col />
    </Screen>
  );
}
