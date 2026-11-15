import React, { useState } from 'react';
import { router } from 'expo-router';
import { useI18n } from '../../../src/i18n';
import { Screen, T, Row, Col, Card, Button, Steps, Segmented, Input, KV, Divider } from '../../../src/components';
import { colors } from '../../../src/theme';
import { useStaffDraft } from '../../../src/store/staffDraft';
import { catalogService } from '../../../src/services/catalogService';
import { staffService } from '../../../src/services/staffService';

/** R05 Walk-in: payment (3/3) */
export default function Payment() {
  const { t, tr, money } = useI18n();
  const d = useStaffDraft();
  const plan = catalogService.planSync(d.planId)!;
  const [received, setReceived] = useState(String(plan.price));
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const change = Math.max(0, (parseFloat(received) || 0) - plan.price);
  const submit = async () => {
    if (d.method === 'cash' && (parseFloat(received) || 0) < plan.price) { setErr(t('staff.insufficient')); return; }
    setBusy(true);
    if (d.renewId) {
      await staffService.renew(d.renewId, d.planId, plan.price);
      setBusy(false);
      router.replace({ pathname: '/staff/new-member/success', params: { id: d.renewId, renew: '1' } });
      return;
    }
    const m = await staffService.register({ name: d.name, phone: d.phone, eid: d.eid, gender: d.gender, planId: d.planId, start: d.start, method: d.method, total: plan.price });
    setBusy(false);
    router.replace({ pathname: '/staff/new-member/success', params: { id: m.id } });
  };
  return (
    <Screen title={t('staff.nmPay')} footer={<Button testID="nm-pay" title={d.method === 'link' ? t('staff.sendLink') : t('staff.collect', { a: money(plan.price) })} loading={busy} onPress={submit} />}>
      <Steps total={3} current={2} />
      <Card>
        <KV k={tr(plan.name)} v={money(plan.price)} />
        <KV k={t('common.vatIncl')} v={money(+(plan.price - plan.price / 1.05).toFixed(2))} />
        <Divider style={{ marginVertical: 6 }} />
        <KV k={t('common.total')} v={money(plan.price)} strong />
      </Card>
      <Segmented items={[{ key: 'cash', label: t('pay.cash') }, { key: 'terminal', label: t('pay.terminal') }, ...(d.renewId ? [] : [{ key: 'link', label: t('pay.link') }])]} value={d.method} onChange={(m) => { d.set({ method: m }); setErr(''); }} />
      {d.method === 'cash' ? (
        <Col gap={10}>
          <Input testID="nm-received" label={t('staff.received')} keyboardType="decimal-pad" value={received} onChangeText={(v) => { setReceived(v.replace(/[^\d.]/g, '')); setErr(''); }} error={err} rightText="AED" />
          <Row justify="space-between" style={{ backgroundColor: colors.successSoft, borderRadius: 12, padding: 12 }}><T v="bodyStrong">{t('staff.change')}</T><T v="h3" color={colors.success}>{money(change)}</T></Row>
        </Col>
      ) : null}
    </Screen>
  );
}
