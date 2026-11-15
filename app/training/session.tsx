import React, { useEffect, useState } from 'react';
import { BackHandler, Pressable, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, Button, Dialog, IconButton, ProgressBar } from '../../src/components';
import { colors, fonts, radius } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { images } from '../../src/data/images';
import { trainingService, exerciseSync, programSync } from '../../src/services/trainingService';

const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/** T06 Active workout session */
export default function Session() {
  const { t, tr } = useI18n();
  const session = useApp((s) => s.session);
  const records = useApp((s) => s.records);
  const [idx, setIdx] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [rest, setRest] = useState(0);
  const [finish, setFinish] = useState(false);
  const [quit, setQuit] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { const id = setInterval(() => { setNow(Date.now()); setRest((r) => (r > 0 ? r - 1 : 0)); }, 1000); return () => clearInterval(id); }, []);
  useEffect(() => { const sub = BackHandler.addEventListener('hardwareBackPress', () => { setQuit(true); return true; }); return () => sub.remove(); }, []);
  if (!session) return <Screen title={t('training.session')}><Button title={t('common.back')} onPress={() => router.back()} /></Screen>;
  const cur = session.exercises[idx];
  const ex = exerciseSync(cur.id);
  const best = records.find((r) => r.ex === cur.id);
  const done = session.exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
  const totalSets = session.exercises.reduce((a, e) => a + e.sets.length, 0);
  const update = (si: number, patch: Partial<{ kg: string; reps: string; done: boolean }>) => {
    const exs = session.exercises.map((e, i) => (i !== idx ? e : { ...e, sets: e.sets.map((s, j) => (j === si ? { ...s, ...patch } : s)) }));
    useApp.getState().set({ session: { ...session, exercises: exs } });
  };
  const toggle = (si: number) => {
    const s = cur.sets[si];
    const kg = s.kg || (best ? String(best.history[best.history.length - 1].v * 0.8) : '20');
    const reps = s.reps || String(parseInt(ex.reps, 10) || 10);
    update(si, { done: !s.done, kg, reps });
    if (!s.done && ex.rest) setRest(ex.rest);
  };
  const addSet = () => useApp.getState().set({ session: { ...session, exercises: session.exercises.map((e, i) => (i !== idx ? e : { ...e, sets: [...e.sets, { kg: '', reps: '', done: false }] })) } });
  const input = (v: string, onChange: (x: string) => void, ph: string, id: string) => (
    <TextInput testID={id} value={v} onChangeText={(x) => onChange(x.replace(/[^\d.]/g, ''))} placeholder={ph} placeholderTextColor={colors.textSubtle} keyboardType="decimal-pad" style={{ flex: 1, flexBasis: 0, minWidth: 0, height: 42, borderRadius: radius.md, backgroundColor: colors.surface2, textAlign: 'center', fontFamily: fonts.semibold, fontSize: 15, color: colors.text }} />
  );
  return (
    <Screen title={(() => { const d = programSync(session.programId)?.days.find((x) => x.id === session.dayId); return d ? tr(d.name) : session.name; })()} header={{ onBack: () => setQuit(true), right: <T v="h3" color={colors.yellowDark}>{mmss(Math.floor((now - session.startedAt) / 1000))}</T> }}
      footer={<Row gap={10}>
        <Button title={t('training.prevEx')} variant="outline" full={false} disabled={idx === 0} onPress={() => setIdx(idx - 1)} style={{ flex: 1 }} />
        {idx < session.exercises.length - 1 ? <Button testID="ses-next" title={t('training.nextEx')} full={false} style={{ flex: 1.4 }} iconEnd="arrow-forward" onPress={() => setIdx(idx + 1)} /> : <Button testID="ses-finish" title={t('training.finish')} variant="dark" full={false} style={{ flex: 1.4 }} icon="flag" onPress={() => setFinish(true)} />}
      </Row>}>
      <Col gap={6}>
        <Row justify="space-between"><T v="captionStrong" color={colors.textMuted}>{t('training.exOf', { a: idx + 1, b: session.exercises.length })}</T><T v="captionStrong" color={colors.textMuted}>{done}/{totalSets} {t('common.sets')}</T></Row>
        <ProgressBar value={done / Math.max(1, totalSets)} />
      </Col>
      <Card padded={false}>
        <Row gap={12} style={{ padding: 12 }}>
          <Img src={images[ex.img]} style={{ width: 76, height: 76 }} radius={14} />
          <Col style={{ flex: 1 }} gap={2}>
            <T v="h2">{tr(ex.name)}</T>
            <T v="caption" color={colors.textMuted}>{t('training.target')}: {ex.sets} × {ex.reps}</T>
            {best ? <T v="micro" color={colors.yellowDark}>{t('training.best')}: {best.history[best.history.length - 1].v} kg</T> : null}
          </Col>
          <IconButton name="information-circle-outline" onPress={() => router.push(`/training/exercise/${ex.id}`)} />
        </Row>
      </Card>
      {rest > 0 ? (
        <Row gap={12} style={{ backgroundColor: colors.black, borderRadius: radius.lg, padding: 14 }} testID="rest">
          <Icon name="hourglass-outline" color={colors.yellow} />
          <T v="h2" color={colors.onDark} style={{ flex: 1 }}>{t('training.restTimer')} {mmss(rest)}</T>
          <Pressable onPress={() => setRest(0)}><T v="captionStrong" color={colors.yellow}>{t('training.skipRest')}</T></Pressable>
        </Row>
      ) : <T v="caption" color={colors.textMuted}>{t('training.logHint')}</T>}
      <Card style={{ gap: 10 }}>
        <Row gap={10}><T v="micro" color={colors.textMuted} style={{ width: 34 }} center>{t('training.setN')}</T><T v="micro" color={colors.textMuted} style={{ flex: 1 }} center>{t('common.kg')}</T><T v="micro" color={colors.textMuted} style={{ flex: 1 }} center>{t('common.reps')}</T><View style={{ width: 42 }} /></Row>
        {cur.sets.map((s, si) => (
          <Row key={si} gap={10} style={{ opacity: s.done ? 0.75 : 1 }}>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: s.done ? colors.yellow : colors.surface2, alignItems: 'center', justifyContent: 'center' }}><T v="captionStrong">{si + 1}</T></View>
            {input(s.kg, (x) => update(si, { kg: x }), best ? String(best.history[best.history.length - 1].v * 0.8) : '20', `kg-${si}`)}
            {input(s.reps, (x) => update(si, { reps: x }), String(parseInt(ex.reps, 10) || 10), `reps-${si}`)}
            <Pressable testID={`done-${si}`} onPress={() => toggle(si)} style={{ width: 42, height: 42, borderRadius: radius.md, backgroundColor: s.done ? colors.success : colors.surface, borderWidth: 1.5, borderColor: s.done ? colors.success : colors.border, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="checkmark" size={20} color={s.done ? '#fff' : colors.textSubtle} />
            </Pressable>
          </Row>
        ))}
        <Pressable testID="add-set" onPress={addSet}><Row gap={6} justify="center" style={{ paddingVertical: 6 }}><Icon name="add-circle-outline" size={18} color={colors.yellowDark} /><T v="captionStrong" color={colors.yellowDark}>{t('training.addSet')}</T></Row></Pressable>
      </Card>
      <Dialog visible={finish} onClose={() => setFinish(false)} icon="flag-outline" title={t('training.finishQ')} body={t('training.finishBody', { n: done })} confirm={t('training.finish')} cancel={t('common.cancel')} loading={busy}
        onConfirm={async () => { setBusy(true); const r = await trainingService.finishSession(); setBusy(false); setFinish(false); router.replace({ pathname: '/training/complete', params: { prs: JSON.stringify(r?.prs ?? []) } }); }} />
      <Dialog visible={quit} onClose={() => setQuit(false)} danger icon="exit-outline" title={t('training.quitQ')} body={t('training.quitBody')} confirm={t('training.quit')} cancel={t('common.cancel')}
        onConfirm={() => { setQuit(false); useApp.getState().set({ session: null }); router.back(); }} />
    </Screen>
  );
}
