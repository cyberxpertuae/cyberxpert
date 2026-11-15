import React, { useState } from 'react';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Card, LineChart, Segmented, Button, Stat, ListRow } from '../../src/components';
import { colors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { useFmt } from '../../src/utils/format';

/** T13 Body measurements */
export default function Body() {
  const { t } = useI18n();
  const f = useFmt();
  const ms = useApp((s) => s.measurements);
  const [k, setK] = useState<'weight' | 'fat' | 'muscle' | 'waist'>('weight');
  const last = ms[ms.length - 1], prev = ms[ms.length - 2] ?? last;
  const unit = { weight: ' kg', fat: '%', muscle: ' kg', waist: ' cm' }[k];
  return (
    <Screen title={t('training.bodyTitle')} footer={<Button testID="body-add" title={t('training.addMeasure')} icon="add" onPress={() => router.push('/progress/add-measurement')} />}>
      <Row gap={10}>
        <Stat icon="scale-outline" value={`${last.weight} kg`} label={t('training.weight')} />
        <Stat icon="water-outline" value={`${last.fat}%`} label={t('training.fat')} />
        <Stat icon="barbell-outline" value={`${last.muscle} kg`} label={t('training.muscle')} />
      </Row>
      <Segmented items={[{ key: 'weight', label: t('training.weight') }, { key: 'fat', label: t('training.fat') }, { key: 'muscle', label: t('training.muscle') }, { key: 'waist', label: t('training.waist') }]} value={k} onChange={setK} />
      <Card>
        <Row justify="space-between"><T v="h2">{last[k]}{unit}</T><T v="captionStrong" color={last[k] - prev[k] <= 0 === (k !== 'muscle') ? colors.success : colors.warning}>{(last[k] - prev[k] > 0 ? '+' : '') + (last[k] - prev[k]).toFixed(1)}{unit}</T></Row>
        <LineChart data={ms.map((m) => m[k])} labels={ms.map((m) => f.short(m.date).split(' ')[1])} unit={unit} height={180} />
      </Card>
      <T v="h3">{t('training.log')}</T>
      <Card style={{ paddingVertical: 4 }}>
        {[...ms].reverse().map((m, i) => (
          <Row key={m.date} justify="space-between" style={{ paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}>
            <T v="bodyStrong">{f.date(m.date)}</T>
            <T v="caption" color={colors.textMuted}>{m.weight} kg · {m.fat}% · {m.waist} cm</T>
          </Row>
        ))}
      </Card>
      <Card style={{ paddingVertical: 4 }}><ListRow icon="body-outline" title={t('training.inbodyCta')} onPress={() => router.push('/services/sv-inbody')} /></Card>
      <Col />
    </Screen>
  );
}
