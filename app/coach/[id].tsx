import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, Button, Chip, Skeleton, Stat } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { images } from '../../src/data/images';
import { bookingService } from '../../src/services/bookingService';
import { useAsync } from '../../src/utils/useAsync';
import { requireAuth } from '../../src/utils/guard';

/** C04 Coach profile */
export default function CoachProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tr, num, lang } = useI18n();
  const { data: c, loading } = useAsync(() => bookingService.getCoach(id!), [id]);
  if (loading || !c) return <Screen title=" "><Skeleton h={300} r={24} /></Screen>;
  const reviews = [
    { n: lang === 'ar' ? 'سعيد م.' : 'Saeed M.', r: 5, x: lang === 'ar' ? 'أفضل مدرب تعاملت معه، تعليمات واضحة ونتائج حقيقية.' : 'Best coach I\'ve trained with — clear cues and real results.' },
    { n: lang === 'ar' ? 'مريم ن.' : 'Mariam N.', r: 5, x: lang === 'ar' ? 'برنامج مناسب لجدولي، وخسرت ٦ كجم في شهرين.' : 'Program fits my schedule, lost 6 kg in two months.' },
  ];
  const book = () => requireAuth(() => { useApp.getState().set({ booking: { serviceId: 'sv-pt', pkg: '1', coachId: c.id, classId: null, date: null, time: null } }); router.push('/booking/slot'); });
  return (
    <Screen title={tr(c.name)} footer={<Button testID="coach-book" title={t('booking.bookWith', { name: tr(c.name).split(' ')[0] })} onPress={book} />}>
      <View style={{ height: 300, borderRadius: radius.xl, overflow: 'hidden' }}>
        <Img src={images[c.img]} style={{ position: 'absolute', width: '100%', height: '100%' }} />
        <LinearGradient colors={['transparent', 'rgba(11,11,12,0.9)']} style={{ flex: 1, justifyContent: 'flex-end', padding: 16 }}>
          <T v="display" color={colors.onDark}>{tr(c.name)}</T>
          <T v="body" color={colors.gold}>{tr(c.role)}</T>
        </LinearGradient>
      </View>
      <Row gap={10}><Stat icon="star" value={String(c.rating)} label={t('booking.reviews')} /><Stat icon="ribbon-outline" value={num(c.years)} label={t('booking.years', { n: '' }).trim()} /><Stat icon="people-outline" value={num(c.clients)} label={t('booking.clients', { n: '' }).trim()} /></Row>
      <Card><T v="h3" style={{ marginBottom: 6 }}>{t('booking.about')}</T><T v="body" color={colors.textMuted}>{tr(c.bio)}</T></Card>
      <T v="h3">{t('booking.specialties')}</T>
      <Row gap={8} wrap>{c.tags.map((x, i) => <Chip key={i} label={tr(x)} />)}</Row>
      <Card style={{ gap: 8 }}><T v="h3">{t('booking.certs')}</T>{c.certs.map((x, i) => <Row key={i} gap={8}><Icon name="ribbon" size={16} color={colors.gold} /><T v="body">{tr(x)}</T></Row>)}</Card>
      <T v="h3">{t('booking.reviews')}</T>
      {reviews.map((r, i) => <Card key={i}><Row justify="space-between"><T v="bodyStrong">{r.n}</T><Row gap={2}>{Array.from({ length: r.r }).map((_, k) => <Icon key={k} name="star" size={13} color={colors.gold} />)}</Row></Row><T v="caption" color={colors.textMuted}>{r.x}</T></Card>)}
    </Screen>
  );
}
