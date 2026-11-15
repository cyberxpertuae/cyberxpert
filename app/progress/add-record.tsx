import React, { useState } from 'react';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Col, Button, Input, ChipRow, DateStrip, useToast } from '../../src/components';
import { colors } from '../../src/theme';
import { trainingService, exerciseSync } from '../../src/services/trainingService';
import { addDays } from '../../src/services/api';
import { TODAY } from '../../src/store/app';

/** T12 Add personal record */
export default function AddRecord() {
  const { t, tr } = useI18n();
  const toast = useToast();
  const opts = ['ex-bench', 'ex-squat', 'ex-deadlift', 'ex-goblet', 'ex-lat', 'ex-shoulder', 'ex-leg-press'];
  const [ex, setEx] = useState(opts[0]);
  const [kg, setKg] = useState('');
  const [date, setDate] = useState(TODAY);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async () => {
    const v = parseFloat(kg);
    if (!v || v <= 0 || v > 500) { setErr(t('training.recordErr')); return; }
    setBusy(true); await trainingService.addRecord(ex, v, date); setBusy(false);
    toast(t('training.recordSaved')); router.back();
  };
  return (
    <Screen title={t('training.recordTitle')} footer={<Button testID="rec-save" title={t('common.save')} loading={busy} onPress={save} />}>
      <T v="captionStrong" color={colors.textMuted}>{t('training.exercise')}</T>
      <ChipRow items={opts.map((o) => ({ key: o, label: tr(exerciseSync(o).name) }))} value={ex} onChange={setEx} />
      <Input testID="rec-kg" label={t('training.weightKg')} keyboardType="decimal-pad" value={kg} onChangeText={(v) => { setKg(v.replace(/[^\d.]/g, '')); setErr(''); }} error={err} rightText="kg" />
      <Col gap={6}><T v="captionStrong" color={colors.textMuted}>{t('training.date')}</T><DateStrip dates={Array.from({ length: 7 }, (_, i) => addDays(TODAY, i - 6)).reverse()} value={date} onChange={setDate} /></Col>
    </Screen>
  );
}
