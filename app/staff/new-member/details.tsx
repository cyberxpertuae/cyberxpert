import React, { useState } from 'react';
import { router } from 'expo-router';
import { useI18n } from '../../../src/i18n';
import { Screen, T, Row, Col, Button, Input, Chip, Steps } from '../../../src/components';
import { colors } from '../../../src/theme';
import { useStaffDraft } from '../../../src/store/staffDraft';
import { isUaePhone, formatPhone } from '../../../src/utils/validate';

/** R03 Walk-in: member details (1/3) */
export default function Details() {
  const { t } = useI18n();
  const d = useStaffDraft();
  const [err, setErr] = useState<Record<string, string>>({});
  const eidMask = (v: string) => { const x = v.replace(/\D/g, '').slice(0, 15); return [x.slice(0, 3), x.slice(3, 7), x.slice(7, 14), x.slice(14, 15)].filter(Boolean).join('-'); };
  const next = () => {
    const e: Record<string, string> = {};
    if (d.name.trim().length < 3) e.name = t('common.required');
    if (!isUaePhone(d.phone)) e.phone = t('common.invalidPhone');
    if (d.eid.replace(/\D/g, '').length !== 15 || !d.eid.startsWith('784')) e.eid = t('staff.eidErr');
    setErr(e); if (!Object.keys(e).length) router.push('/staff/new-member/plan');
  };
  return (
    <Screen title={t('staff.a_new')} footer={<Button testID="nm-next" title={t('common.next')} onPress={next} />}>
      <Steps total={3} current={0} />
      <T v="captionStrong" color={colors.yellowDark}>{t('staff.nmDetails')}</T>
      <Input testID="nm-name" label={t('auth.fullName')} icon="person-outline" value={d.name} onChangeText={(v) => d.set({ name: v })} error={err.name} placeholder={t('auth.namePh')} />
      <Input testID="nm-phone" label={t('auth.phone')} prefix="+971" keyboardType="phone-pad" value={d.phone} onChangeText={(v) => d.set({ phone: formatPhone(v) })} error={err.phone} placeholder="50 123 4567" />
      <Input testID="nm-eid" label={t('staff.eid')} icon="card-outline" keyboardType="number-pad" value={d.eid} onChangeText={(v) => d.set({ eid: eidMask(v) })} error={err.eid} placeholder={t('staff.eidPh')} />
      <Col gap={6}><T v="captionStrong" color={colors.textMuted}>{t('auth.gender')}</T><Row gap={8}>{['male', 'female'].map((g) => <Chip key={g} label={t(`gender.${g}`)} selected={d.gender === g} onPress={() => d.set({ gender: g })} />)}</Row></Col>
      <T v="h3">{t('profile.emergency')}</T>
      <Input label={t('profile.emergencyName')} icon="people-outline" value={d.eName} onChangeText={(v) => d.set({ eName: v })} placeholder={t('common.optional')} />
      <Input label={t('profile.emergencyPhone')} prefix="+971" keyboardType="phone-pad" value={d.ePhone} onChangeText={(v) => d.set({ ePhone: formatPhone(v) })} placeholder={t('common.optional')} />
    </Screen>
  );
}
