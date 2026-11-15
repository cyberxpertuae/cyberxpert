import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Col, Button, SuccessBurst } from '../../src/components';
import { colors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { bookingService } from '../../src/services/bookingService';
import { useFmt } from '../../src/utils/format';

/** C07 Booking confirmed */
export default function BookingSuccess() {
  const { t, tr } = useI18n();
  const f = useFmt();
  const { id } = useLocalSearchParams<{ id: string }>();
  const b = useApp((s) => s.bookings.find((x) => x.id === id));
  return (
    <Screen header={false} scroll={false} footer={<Col gap={8}><Button testID="bs-bookings" title={t('booking.myBookings')} onPress={() => router.replace('/bookings')} /><Button title={t('checkout.goHome')} variant="ghost" onPress={() => router.replace('/(tabs)/home')} /></Col>}>
      <Col gap={10} style={{ flex: 1, justifyContent: 'center' }}>
        <SuccessBurst icon="calendar" />
        <T v="display" center>{t('booking.successTitle')}</T>
        {b ? <T v="body" center color={colors.textMuted}>{t('booking.successBody', { what: tr(bookingService.bookingTitle(b)), when: `${f.dow(b.date)} ${f.short(b.date)} · ${f.time(b.time)}` })}</T> : null}
      </Col>
    </Screen>
  );
}
