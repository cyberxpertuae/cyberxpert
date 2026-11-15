import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Button, Chip, HList, Dialog, useToast, Card } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { membershipService } from '../../src/services/membershipService';
import { bookingService } from '../../src/services/bookingService';
import { addDays } from '../../src/services/api';
import { useFmt } from '../../src/utils/format';

/** M09 Freeze membership */
export default function Freeze() {
  const { t } = useI18n();
  const f = useFmt();
  const toast = useToast();
  const m = useApp((s) => s.membership)!;
  const [days, setDays] = useState(Math.min(7, m.freezeLeft));
  const [from, setFrom] = useState(bookingService.week()[1]);
  const [reason, setReason] = useState('travel');
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const options = [7, 14, 30, 60].filter((d) => d <= Math.max(7, m.freezeLeft));
  const ok = days <= m.freezeLeft && days > 0;
  return (
    <Screen title={t('membership.freezeTitle')} footer={<Button testID="fz-submit" title={t('membership.freeze')} icon="snow-outline" disabled={!ok} onPress={() => setConfirm(true)} />}>
      <T v="body" color={colors.textMuted}>{t('membership.freezeSub')}</T>
      <Card><Row gap={10}><Icon name="snow" color={colors.info} /><T v="bodyStrong">{t('membership.freezeLeft')}: {m.freezeLeft} {t('common.days')}</T></Row></Card>
      <T v="h3">{t('membership.howLong')}</T>
      <Row gap={8} wrap>{options.map((d) => <Chip testID={`fz-${d}`} key={d} label={`${d} ${t('common.days')}`} selected={days === d} onPress={() => setDays(d)} />)}</Row>
      {!ok ? <T v="caption" color={colors.danger}>{t('membership.noFreeze')}</T> : null}
      <T v="h3">{t('membership.startFrom')}</T>
      <HList data={bookingService.week()} keyExtractor={(x) => x} renderItem={(x) => (
        <Pressable onPress={() => setFrom(x)} style={{ width: 62, height: 76, borderRadius: radius.lg, backgroundColor: x === from ? colors.black : colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: x === from ? 0 : 1, borderColor: colors.border }}>
          <T v="micro" color={x === from ? colors.onDarkMuted : colors.textMuted}>{f.dow(x)}</T>
          <T v="h2" color={x === from ? colors.yellow : colors.text}>{f.dayNum(x)}</T>
        </Pressable>
      )} />
      <T v="h3">{t('membership.reason')}</T>
      <Row gap={8} wrap>{['travel', 'injury', 'medical', 'other'].map((r) => <Chip key={r} label={t(`membership.reasons_${r}`)} selected={reason === r} onPress={() => setReason(r)} />)}</Row>
      <Row gap={8} style={{ backgroundColor: colors.infoSoft, borderRadius: radius.md, padding: 12 }}><Icon name="calendar-outline" color={colors.info} /><T v="bodyStrong">{t('membership.newEnd', { d: f.date(addDays(m.end, days)) })}</T></Row>
      <Col />
      <Dialog visible={confirm} onClose={() => setConfirm(false)} icon="snow-outline" title={t('membership.confirmFreeze', { n: days })} body={t('membership.confirmFreezeBody')} confirm={t('common.confirm')} cancel={t('common.cancel')} loading={busy}
        onConfirm={async () => { setBusy(true); await membershipService.freeze(from, days); setBusy(false); setConfirm(false); toast(t('membership.frozenDone')); router.back(); }} />
    </Screen>
  );
}
