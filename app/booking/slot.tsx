import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Button, Steps, DateStrip, Skeleton, useToast } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { bookingService } from '../../src/services/bookingService';
import { useFmt } from '../../src/utils/format';

/** C05 Date & time (step 2/3). Also used to reschedule (?reschedule=ID). */
export default function Slot() {
  const { t } = useI18n();
  const f = useFmt();
  const toast = useToast();
  const { reschedule } = useLocalSearchParams<{ reschedule?: string }>();
  const d = useApp((s) => s.booking);
  const week = bookingService.week();
  const [date, setDate] = useState(d.date ?? week[1]);
  const [time, setTime] = useState<string | null>(d.time);
  const [slots, setSlots] = useState<{ time: string; taken: boolean }[] | null>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { setSlots(null); bookingService.getSlots(d.coachId, date).then(setSlots); }, [date, d.coachId]);
  const next = async () => {
    if (!time) { setErr(t('booking.noSlot')); return; }
    if (reschedule) { setBusy(true); await bookingService.reschedule(reschedule, date, time); setBusy(false); toast(t('booking.rescheduled', { d: `${f.short(date)} ${f.time(time)}` })); router.back(); return; }
    useApp.getState().set({ booking: { ...d, date, time } });
    router.push('/booking/review');
  };
  const group = (label: string, list: { time: string; taken: boolean }[]) => (
    <Col gap={8}>
      <T v="captionStrong" color={colors.textMuted}>{label}</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {list.map((s) => {
          const on = time === s.time;
          return (
            <Pressable testID={`slot-${s.time}`} key={s.time} disabled={s.taken} onPress={() => { setTime(s.time); setErr(''); }} style={{ width: '31%', height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? colors.yellow : s.taken ? colors.surface2 : colors.surface, borderWidth: 1, borderColor: on ? colors.yellow : colors.border }}>
              <T v="captionStrong" color={s.taken ? colors.textSubtle : colors.text} style={{ textDecorationLine: s.taken ? 'line-through' : 'none' }}>{f.time(s.time)}</T>
            </Pressable>
          );
        })}
      </View>
    </Col>
  );
  return (
    <Screen title={reschedule ? t('booking.reschedule') : t('booking.slotTitle')} footer={<Button testID="bk-next" title={reschedule ? t('common.confirm') : t('common.next')} loading={busy} onPress={next} />}>
      {!reschedule ? <><Steps total={3} current={1} /><T v="captionStrong" color={colors.yellowDark}>{t('booking.step', { a: 2 })}</T></> : null}
      <DateStrip dates={week} value={date} onChange={(x) => { setDate(x); setTime(null); }} />
      {!slots ? <Col gap={8}><Skeleton h={44} /><Skeleton h={44} /><Skeleton h={44} /></Col> : (
        <>
          {group(t('booking.morning'), slots.filter((s) => s.time < '12:00'))}
          {group(t('booking.afternoon'), slots.filter((s) => s.time >= '12:00'))}
        </>
      )}
      {err ? <T v="caption" color={colors.danger}>{err}</T> : null}
    </Screen>
  );
}
