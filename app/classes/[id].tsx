import React, { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, Button, Skeleton, Stat, ProgressBar, useToast } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { images } from '../../src/data/images';
import { bookingService } from '../../src/services/bookingService';
import { useAsync } from '../../src/utils/useAsync';
import { useFmt } from '../../src/utils/format';
import { requireAuth } from '../../src/utils/guard';

/** C09 Class detail */
export default function ClassDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tr } = useI18n();
  const f = useFmt();
  const toast = useToast();
  const { data: c, loading } = useAsync(() => bookingService.getClass(id!), [id]);
  const booked = useApp((s) => !!c && s.bookings.some((b) => b.kind === 'class' && b.ref === c.type.id && b.date === c.date && b.time === c.time && b.status === 'upcoming'));
  const [busy, setBusy] = useState(false);
  const [waiting, setWaiting] = useState(false);
  if (loading || !c) return <Screen title=" "><Skeleton h={240} r={24} /></Screen>;
  const book = () => requireAuth(async () => {
    if (!c.spotsLeft) { setWaiting(true); toast(t('classes.waitlisted'), 'info'); return; }
    setBusy(true);
    useApp.getState().set({ booking: { serviceId: null, pkg: null, coachId: c.coach.id, classId: c.id, date: c.date, time: c.time } });
    const b = await bookingService.bookDraft();
    setBusy(false);
    router.replace({ pathname: '/booking/success', params: { id: b.id } });
  });
  return (
    <Screen title={tr(c.type.name)} footer={booked ? <Button title={t('classes.booked')} disabled icon="checkmark" /> : <Button testID="cls-book" title={c.spotsLeft ? t('classes.book') : waiting ? t('classes.waitlisted') : t('classes.waitlist')} variant={c.spotsLeft ? 'primary' : 'dark'} loading={busy} disabled={waiting} onPress={book} />}>
      <View style={{ height: 230, borderRadius: radius.xl, overflow: 'hidden' }}>
        <Img src={images[c.type.img]} style={{ position: 'absolute', width: '100%', height: '100%' }} />
        <LinearGradient colors={['transparent', 'rgba(11,11,12,0.9)']} style={{ flex: 1, justifyContent: 'flex-end', padding: 16 }}>
          <T v="display" color={colors.onDark}>{tr(c.type.name)}</T>
          <T v="body" color={colors.gold}>{f.dow(c.date)} {f.short(c.date)} · {f.time(c.time)}</T>
        </LinearGradient>
      </View>
      <Row gap={10}>
        <Stat icon="time-outline" value={t('services.durationMin', { n: c.type.duration })} label={t('classes.duration')} />
        <Stat icon="flash-outline" value={t(`classes.i${c.type.intensity}`)} label={t('classes.intensity')} />
        <Stat icon="flame-outline" value={`~${c.type.kcal}`} label={t('classes.burn')} />
      </Row>
      <T v="body" color={colors.textMuted}>{tr(c.type.desc)}</T>
      <Card onPress={() => router.push(`/coach/${c.coach.id}`)}><Row gap={12}><Img src={images[c.coach.img]} style={{ width: 52, height: 52 }} radius={26} /><Col style={{ flex: 1 }}><T v="micro" color={colors.textMuted}>{t('classes.coach')}</T><T v="bodyStrong">{tr(c.coach.name)}</T></Col><Icon name="chevron-forward" size={18} color={colors.textSubtle} /></Row></Card>
      <Card style={{ gap: 8 }}>
        <Row justify="space-between"><T v="bodyStrong">{t('classes.capacity')}</T><T v="captionStrong" color={c.spotsLeft ? colors.success : colors.danger}>{c.spotsLeft ? t('classes.spotsLeft', { n: c.spotsLeft }) : t('classes.full')}</T></Row>
        <ProgressBar value={(c.type.capacity - c.spotsLeft) / c.type.capacity} color={c.spotsLeft ? colors.yellow : colors.danger} />
      </Card>
      <Row gap={8}><Icon name="information-circle-outline" size={18} color={colors.textMuted} /><T v="caption" color={colors.textMuted} style={{ flex: 1 }}>{t('classes.bring')}</T></Row>
    </Screen>
  );
}
