import React from 'react';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, SkeletonList, SectionHeader, HList, IconName } from '../../src/components';
import { colors } from '../../src/theme';
import { images } from '../../src/data/images';
import { bookingService } from '../../src/services/bookingService';
import { useAsync } from '../../src/utils/useAsync';

/** C01 Services */
export default function Services() {
  const { t, tr, money } = useI18n();
  const { data, loading } = useAsync(() => bookingService.getServices(), []);
  const coaches = bookingService.coachesSync();
  return (
    <Screen title={t('services.title')} header={{ subtitle: t('services.sub') }}>
      {loading ? <SkeletonList rows={5} card={96} /> : (data ?? []).map((s) => (
        <Card key={s.id} testID={`svc-${s.id}`} padded={false} onPress={() => (s.kind === 'classes' ? router.push('/classes') : s.kind === 'plan' ? router.push('/plans') : router.push(`/services/${s.id}`))}>
          <Row gap={12} style={{ padding: 10 }}>
            <Img src={images[s.img]} style={{ width: 92, height: 92 }} radius={16} />
            <Col style={{ flex: 1 }} gap={4}>
              <Row gap={6}><Icon name={s.icon as IconName} size={16} color={colors.yellowDark} /><T v="bodyStrong" style={{ flex: 1 }} numberOfLines={1}>{tr(s.name)}</T></Row>
              <T v="caption" color={colors.textMuted} numberOfLines={2}>{tr(s.short)}</T>
              {s.packages[0] ? <T v="captionStrong">{t('common.from')} {money(s.packages[0].price)}</T> : null}
            </Col>
            <Icon name="chevron-forward" size={18} color={colors.textSubtle} />
          </Row>
        </Card>
      ))}
      <SectionHeader title={t('services.coaches')} />
      <HList data={coaches} keyExtractor={(c) => c.id} renderItem={(c) => (
        <Card testID={`coach-${c.id}`} padded={false} style={{ width: 150 }} onPress={() => router.push(`/coach/${c.id}`)}>
          <Img src={images[c.img]} style={{ height: 150, width: '100%' }} />
          <Col style={{ padding: 10 }} gap={2}><T v="captionStrong" numberOfLines={1}>{tr(c.name)}</T><T v="micro" color={colors.textMuted} numberOfLines={1}>{tr(c.role)}</T><Row gap={4}><Icon name="star" size={12} color={colors.gold} /><T v="micro">{c.rating}</T></Row></Col>
        </Card>
      )} />
    </Screen>
  );
}
