import React, { useState } from 'react';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Card, Img, Segmented, StatusBadge, SkeletonList, EmptyState } from '../../src/components';
import { colors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { images } from '../../src/data/images';
import { bookingService, coachSync } from '../../src/services/bookingService';
import { useAsync } from '../../src/utils/useAsync';
import { useFmt } from '../../src/utils/format';

/** C10 My bookings */
export default function Bookings() {
  const { t, tr } = useI18n();
  const f = useFmt();
  const [tab, setTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const all = useApp((s) => s.bookings);
  const { loading, refreshing, refresh } = useAsync(() => bookingService.getBookings(), []);
  const list = all.filter((b) => b.status === tab).sort((a, b) => (tab === 'upcoming' ? (a.date + a.time).localeCompare(b.date + b.time) : (b.date + b.time).localeCompare(a.date + a.time)));
  return (
    <Screen title={t('booking.myBookings')} refreshing={refreshing} onRefresh={refresh}>
      <Segmented items={[{ key: 'upcoming', label: t('booking.upcoming'), count: all.filter((b) => b.status === 'upcoming').length }, { key: 'completed', label: t('booking.completed') }, { key: 'cancelled', label: t('booking.cancelled') }]} value={tab} onChange={setTab} />
      {loading ? <SkeletonList rows={5} /> : !list.length ? <EmptyState icon="calendar-outline" title={t('booking.empty')} body={t('booking.emptyBody')} action={t('services.book')} onAction={() => router.push('/services')} /> : list.map((b) => {
        const coach = coachSync(b.coach);
        return (
          <Card key={b.id} testID={`bk-${b.id}`} padded={false} onPress={() => router.push(`/bookings/${b.id}`)}>
            <Row gap={12} style={{ padding: 10 }}>
              <Img src={images[bookingService.bookingImg(b)]} style={{ width: 64, height: 64 }} radius={14} />
              <Col style={{ flex: 1 }} gap={2}>
                <T v="bodyStrong" numberOfLines={1}>{tr(bookingService.bookingTitle(b))}</T>
                <T v="caption" color={colors.textMuted}>{f.dow(b.date)} {f.short(b.date)} · {f.time(b.time)}</T>
                {coach ? <T v="micro" color={colors.textMuted}>{tr(coach.name)}</T> : null}
              </Col>
              <StatusBadge status={b.status} />
            </Row>
          </Card>
        );
      })}
    </Screen>
  );
}
