import React, { useState } from 'react';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, LineChart, ChipRow, Button, SectionHeader, Img, SkeletonList } from '../../src/components';
import { colors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { images } from '../../src/data/images';
import { trainingService, exerciseSync } from '../../src/services/trainingService';
import { useAsync } from '../../src/utils/useAsync';
import { useFmt } from '../../src/utils/format';

/** T11 Progress & PRs */
export default function Progress() {
  const { t, tr } = useI18n();
  const f = useFmt();
  const records = useApp((s) => s.records);
  const ms = useApp((s) => s.measurements);
  const { loading } = useAsync(() => trainingService.getRecords(), []);
  const [sel, setSel] = useState('ex-goblet');
  const r = records.find((x) => x.ex === sel) ?? records[0];
  const first = ms[0], last = ms[ms.length - 1];
  return (
    <Screen title={t('training.progressTitle')} header={{ right: <Button testID="pr-add" small full={false} icon="add" title={t('training.addRecord')} onPress={() => router.push('/progress/add-record')} /> }}>
      <ChipRow items={records.map((x) => ({ key: x.ex, label: tr(exerciseSync(x.ex).name) }))} value={sel} onChange={setSel} />
      {loading ? <SkeletonList rows={2} card={160} /> : r ? (
        <Card testID="pr-chart">
          <Row justify="space-between" align="flex-start">
            <Col><T v="h2">{tr(exerciseSync(r.ex).name)}</T><T v="caption" color={colors.textMuted}>{t('training.weightKg')}</T></Col>
            <Img src={images[exerciseSync(r.ex).img]} style={{ width: 44, height: 44 }} radius={12} />
          </Row>
          <LineChart data={r.history.map((h) => h.v)} labels={r.history.map((h) => f.short(h.date))} unit=" kg" height={190} />
        </Card>
      ) : null}
      <SectionHeader title={t('training.records')} />
      <Card style={{ paddingVertical: 4 }}>
        {records.map((x, i) => {
          const best = Math.max(...x.history.map((h) => h.v));
          const ex = exerciseSync(x.ex);
          return (
            <Row key={x.ex} gap={12} style={{ paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}>
              <Icon name="medal-outline" color={colors.gold} />
              <T v="bodyStrong" style={{ flex: 1 }}>{tr(ex.name)}</T>
              <T v="h3">{best} kg</T>
            </Row>
          );
        })}
      </Card>
      <SectionHeader title={t('training.body')} action={t('common.seeAll')} onAction={() => router.push('/progress/body')} />
      <Card testID="pr-body" onPress={() => router.push('/progress/body')}>
        <Row justify="space-between"><T v="h3">{t('training.weightTrend')}</T><T v="captionStrong" color={colors.success}>{t('training.change', { v: `${(last.weight - first.weight).toFixed(1)} kg`, d: f.short(first.date) })}</T></Row>
        <LineChart data={ms.map((m) => m.weight)} labels={ms.map((m) => f.short(m.date).split(' ')[1])} color={colors.black} unit=" kg" height={150} />
      </Card>
    </Screen>
  );
}
