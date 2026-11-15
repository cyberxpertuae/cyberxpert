import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, ChipRow, DateStrip, SkeletonList, EmptyState, Pill } from '../../src/components';
import { colors } from '../../src/theme';
import { images } from '../../src/data/images';
import { bookingService } from '../../src/services/bookingService';
import { useAsync } from '../../src/utils/useAsync';
import { useFmt } from '../../src/utils/format';

/** C08 Class schedule */
export default function Classes() {
  const { t, tr } = useI18n();
  const f = useFmt();
  const week = bookingService.week();
  const [date, setDate] = useState(week[0]);
  const [type, setType] = useState('all');
  const { data, loading } = useAsync(() => bookingService.getClasses(date, type), [date, type]);
  const types = [{ key: 'all', label: t('classes.all') }, ...bookingService.classTypes().map((c) => ({ key: c.id, label: tr(c.name) }))];
  return (
    <Screen title={t('classes.title')}>
      <DateStrip dates={week} value={date} onChange={setDate} />
      <ChipRow items={types} value={type} onChange={setType} />
      {loading ? <SkeletonList rows={5} /> : !data?.length ? <EmptyState icon="calendar-clear-outline" title={t('classes.none')} /> : data.map((c) => (
        <Card key={c.id} testID={`cls-${c.id}`} padded={false} onPress={() => router.push(`/classes/${c.id}`)}>
          <Row gap={12} style={{ padding: 10 }}>
            <Col style={{ width: 58, alignItems: 'center' }}><T v="h3">{f.time(c.time).split(' ')[0]}</T><T v="micro" color={colors.textMuted}>{f.time(c.time).split(' ')[1]}</T></Col>
            <Img src={images[c.type.img]} style={{ width: 64, height: 64 }} radius={14} />
            <Col style={{ flex: 1 }} gap={2}>
              <Row gap={6}><T v="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>{tr(c.type.name)}</T>{c.ladies ? <Pill label={t('classes.ladies')} bg="#FCE7F3" fg="#BE185D" /> : null}</Row>
              <T v="caption" color={colors.textMuted}>{tr(c.coach.name)} · {t('services.durationMin', { n: c.type.duration })}</T>
              <Row gap={4}><Icon name={c.spotsLeft ? 'people-outline' : 'alert-circle-outline'} size={13} color={c.spotsLeft ? colors.success : colors.danger} /><T v="micro" color={c.spotsLeft ? colors.success : colors.danger}>{c.spotsLeft ? t('classes.spotsLeft', { n: c.spotsLeft }) : t('classes.full')}</T></Row>
            </Col>
            <Icon name="chevron-forward" size={18} color={colors.textSubtle} />
          </Row>
        </Card>
      ))}
      <View />
    </Screen>
  );
}
