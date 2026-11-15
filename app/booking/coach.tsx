import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, Button, Steps, SkeletonList } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { images } from '../../src/data/images';
import { bookingService } from '../../src/services/bookingService';
import { useAsync } from '../../src/utils/useAsync';

/** C03 Choose coach (step 1/3) */
export default function ChooseCoach() {
  const { t, tr } = useI18n();
  const d = useApp((s) => s.booking);
  const { data, loading } = useAsync(() => bookingService.getCoaches(), []);
  const pick = (id: string | null) => useApp.getState().set({ booking: { ...d, coachId: id } });
  return (
    <Screen title={t('booking.coachTitle')} footer={<Button testID="bk-next" title={t('common.next')} onPress={() => router.push('/booking/slot')} />}>
      <Steps total={3} current={0} />
      <T v="captionStrong" color={colors.yellowDark}>{t('booking.step', { a: 1 })}</T>
      <Pressable testID="coach-any" onPress={() => pick(null)}>
        <Row gap={12} style={{ backgroundColor: d.coachId === null ? colors.black : colors.surface, borderRadius: radius.xl, padding: 14, borderWidth: 1.5, borderColor: d.coachId === null ? colors.yellow : colors.border }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center' }}><Icon name="flash" color={colors.black} /></View>
          <Col style={{ flex: 1 }}><T v="bodyStrong" color={d.coachId === null ? colors.onDark : colors.text}>{t('booking.any')}</T><T v="caption" color={d.coachId === null ? colors.onDarkMuted : colors.textMuted}>{t('booking.anySub')}</T></Col>
          <Icon name={d.coachId === null ? 'checkmark-circle' : 'ellipse-outline'} color={d.coachId === null ? colors.yellow : colors.textSubtle} />
        </Row>
      </Pressable>
      {loading ? <SkeletonList rows={4} /> : (data ?? []).map((c) => {
        const on = d.coachId === c.id;
        return (
          <Card key={c.id} testID={`pick-${c.id}`} padded={false} onPress={() => pick(c.id)} style={{ borderWidth: 1.5, borderColor: on ? colors.yellow : 'transparent' }}>
            <Row gap={12} style={{ padding: 12 }}>
              <Img src={images[c.img]} style={{ width: 64, height: 64 }} radius={32} />
              <Col style={{ flex: 1 }} gap={2}>
                <T v="bodyStrong">{tr(c.name)}</T>
                <T v="caption" color={colors.textMuted}>{tr(c.role)}</T>
                <Row gap={8}><Row gap={3}><Icon name="star" size={13} color={colors.gold} /><T v="micro">{c.rating} ({c.reviews})</T></Row><T v="micro" color={colors.textMuted}>{t('booking.years', { n: c.years })}</T></Row>
              </Col>
              <Col gap={8} style={{ alignItems: 'center' }}>
                <Icon name={on ? 'checkmark-circle' : 'ellipse-outline'} color={on ? colors.yellowDark : colors.textSubtle} />
                <T v="micro" color={colors.yellowDark} onPress={() => router.push(`/coach/${c.id}`)}>{t('booking.profile')}</T>
              </Col>
            </Row>
          </Card>
        );
      })}
    </Screen>
  );
}
