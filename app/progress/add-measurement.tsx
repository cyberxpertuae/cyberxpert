import React, { useState } from 'react';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, Row, Col, Button, Input, useToast } from '../../src/components';
import { useApp, TODAY } from '../../src/store/app';
import { trainingService } from '../../src/services/trainingService';

/** T14 Add measurement */
export default function AddMeasurement() {
  const { t } = useI18n();
  const toast = useToast();
  const last = useApp((s) => s.measurements[s.measurements.length - 1]);
  const [f, setF] = useState({ weight: String(last.weight), fat: String(last.fat), muscle: String(last.muscle), waist: String(last.waist) });
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const n = (v: string) => v.replace(/[^\d.]/g, '').slice(0, 5);
  const save = async () => {
    const e: Record<string, string> = {};
    (Object.keys(f) as (keyof typeof f)[]).forEach((k) => { if (!parseFloat(f[k])) e[k] = t('common.required'); });
    setErr(e); if (Object.keys(e).length) return;
    setBusy(true); await trainingService.addMeasurement({ date: TODAY, weight: +f.weight, fat: +f.fat, muscle: +f.muscle, waist: +f.waist }); setBusy(false);
    toast(t('training.measureSaved')); router.back();
  };
  return (
    <Screen title={t('training.addMeasure')} footer={<Button testID="ms-save" title={t('common.save')} loading={busy} onPress={save} />}>
      <Row gap={12} align="flex-start">
        <Col style={{ flex: 1 }}><Input testID="ms-weight" label={t('training.weight')} keyboardType="decimal-pad" rightText="kg" value={f.weight} onChangeText={(v) => setF({ ...f, weight: n(v) })} error={err.weight} /></Col>
        <Col style={{ flex: 1 }}><Input label={t('training.fat')} keyboardType="decimal-pad" rightText="%" value={f.fat} onChangeText={(v) => setF({ ...f, fat: n(v) })} error={err.fat} /></Col>
      </Row>
      <Row gap={12} align="flex-start">
        <Col style={{ flex: 1 }}><Input label={t('training.muscle')} keyboardType="decimal-pad" rightText="kg" value={f.muscle} onChangeText={(v) => setF({ ...f, muscle: n(v) })} error={err.muscle} /></Col>
        <Col style={{ flex: 1 }}><Input label={t('training.waist')} keyboardType="decimal-pad" rightText="cm" value={f.waist} onChangeText={(v) => setF({ ...f, waist: n(v) })} error={err.waist} /></Col>
      </Row>
    </Screen>
  );
}
