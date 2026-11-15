import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, Button, Skeleton, Pill } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { images } from '../../src/data/images';
import { bookingService } from '../../src/services/bookingService';
import { rewardsService } from '../../src/services/rewardsService';
import { useAsync } from '../../src/utils/useAsync';
import { requireAuth } from '../../src/utils/guard';

/** C02 Service detail */
export default function ServiceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tr, money } = useI18n();
  const user = useApp((s) => s.user);
  const { data: s, loading } = useAsync(() => bookingService.getService(id!), [id]);
  const [pkg, setPkg] = useState<string | null>(null);
  if (loading || !s) return <Screen title=" "><Skeleton h={220} r={24} /><Skeleton h={24} w="60%" /></Screen>;
  const sel = s.packages.find((p) => p.id === (pkg ?? s.packages[0]?.id));
  const disc = user ? rewardsService.summary().discount : 0;
  const book = () => requireAuth(() => {
    if (s.kind === 'classes') return router.push('/classes');
    useApp.getState().set({ booking: { serviceId: s.id, pkg: sel?.id ?? '1', coachId: null, classId: null, date: null, time: null } });
    router.push(s.kind === 'coach' ? '/booking/coach' : '/booking/slot');
  });
  return (
    <Screen title={tr(s.name)} footer={<Button testID="svc-book" title={s.kind === 'classes' ? t('services.seeSchedule') : t('services.book')} onPress={book} iconEnd="arrow-forward" />}>
      <Img src={images[s.img]} style={{ height: 220, width: '100%' }} radius={radius.xl} />
      <Row gap={8}><Pill label={t('services.durationMin', { n: s.duration })} icon="time-outline" bg={colors.surface} />{disc ? <Pill label={t('services.memberDisc', { n: disc, tier: t(`tier.${user?.tier}`) })} icon="star" bg={colors.black} fg={colors.gold} /> : null}</Row>
      <T v="display">{tr(s.name)}</T>
      <T v="body" color={colors.textMuted}>{tr(s.desc)}</T>
      {s.packages.length ? <T v="h3">{t('services.packages')}</T> : null}
      {s.packages.map((p) => {
        const on = (pkg ?? s.packages[0].id) === p.id;
        return (
          <Pressable testID={`pkg-${p.id}`} key={p.id} onPress={() => setPkg(p.id)}>
            <Row gap={12} style={{ backgroundColor: on ? colors.black : colors.surface, borderRadius: radius.lg, padding: 14, borderWidth: 1.5, borderColor: on ? colors.yellow : colors.border }}>
              <Icon name={on ? 'radio-button-on' : 'radio-button-off'} color={on ? colors.yellow : colors.textSubtle} />
              <Col style={{ flex: 1 }}><T v="bodyStrong" color={on ? colors.onDark : colors.text}>{p.sessions === 1 ? t('services.session1') : t('services.sessions', { n: p.sessions })}</T><T v="micro" color={on ? colors.onDarkMuted : colors.textMuted}>{t('services.perSession', { p: Math.round(p.price / p.sessions) })}</T></Col>
              <Col style={{ alignItems: 'flex-end' }}>
                <T v="h3" color={on ? colors.yellow : colors.text}>{money(Math.round(p.price * (1 - disc / 100)))}</T>
                {disc ? <T v="micro" color={on ? colors.onDarkMuted : colors.textSubtle} style={{ textDecorationLine: 'line-through' }}>{money(p.price)}</T> : null}
              </Col>
            </Row>
          </Pressable>
        );
      })}
      <Card><Row gap={10}><Icon name="information-circle-outline" color={colors.textMuted} /><T v="caption" color={colors.textMuted} style={{ flex: 1 }}>{t('booking.policy')}</T></Row></Card>
    </Screen>
  );
}
