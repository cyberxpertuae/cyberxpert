import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, Button, Input, Chip, Sheet, ChipRow, useToast } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { images } from '../../src/data/images';
import { trainingService, exerciseSync, Exercise } from '../../src/services/trainingService';
import { useAsync } from '../../src/utils/useAsync';

const DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

/** T10 Create workout (+ exercise picker sheet) */
export default function Create() {
  const { t, tr } = useI18n();
  const toast = useToast();
  const [name, setName] = useState('');
  const [day, setDay] = useState('Sat');
  const [items, setItems] = useState<{ id: string; sets: number; reps: string }[]>([]);
  const [pick, setPick] = useState(false);
  const [group, setGroup] = useState('all');
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const { data: exercises } = useAsync(() => trainingService.getExercises(group), [group]);
  const save = async () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = t('common.required');
    if (!items.length) e.items = t('training.noEx');
    setErr(e); if (Object.keys(e).length) return;
    setBusy(true); await trainingService.saveCustom({ name: name.trim(), day, ex: items }); setBusy(false);
    toast(t('training.saved')); router.back();
  };
  const dayIdx: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const toggle = (x: Exercise) => setItems(items.some((i) => i.id === x.id) ? items.filter((i) => i.id !== x.id) : [...items, { id: x.id, sets: x.sets, reps: x.reps }]);
  return (
    <Screen title={t('training.createTitle')} footer={<Button testID="cw-save" title={t('common.save')} loading={busy} onPress={save} />}>
      <Input testID="cw-name" label={t('training.wName')} placeholder={t('training.wNamePh')} value={name} onChangeText={setName} error={err.name} />
      <Col gap={6}><T v="captionStrong" color={colors.textMuted}>{t('training.wDay')}</T><Row gap={6} wrap>{DAYS.map((d) => <Chip key={d} label={t(`days.${dayIdx[d]}`)} selected={day === d} onPress={() => setDay(d)} />)}</Row></Col>
      <Row justify="space-between"><T v="h3">{t('training.exercises')} ({items.length})</T><Button testID="cw-add" small full={false} title={t('training.addEx')} icon="add" variant="dark" onPress={() => setPick(true)} /></Row>
      {err.items ? <T v="caption" color={colors.danger}>{err.items}</T> : null}
      {items.map((it, i) => {
        const ex = exerciseSync(it.id);
        return (
          <Card key={it.id} padded={false}>
            <Row gap={10} style={{ padding: 10 }}>
              <Img src={images[ex.img]} style={{ width: 52, height: 52 }} radius={12} />
              <Col style={{ flex: 1 }}><T v="captionStrong" numberOfLines={1}>{tr(ex.name)}</T><T v="micro" color={colors.textMuted}>{it.sets} × {it.reps}</T></Col>
              <Row gap={6}>
                <Pressable onPress={() => setItems(items.map((x, j) => (j === i ? { ...x, sets: Math.max(1, x.sets - 1) } : x)))} style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}><Icon name="remove" size={16} /></Pressable>
                <T v="captionStrong">{it.sets}</T>
                <Pressable onPress={() => setItems(items.map((x, j) => (j === i ? { ...x, sets: x.sets + 1 } : x)))} style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' }}><Icon name="add" size={16} color={colors.yellow} /></Pressable>
              </Row>
              <Pressable onPress={() => setItems(items.filter((_, j) => j !== i))} hitSlop={8}><Icon name="close" size={20} color={colors.textSubtle} /></Pressable>
            </Row>
          </Card>
        );
      })}
      <Sheet visible={pick} onClose={() => setPick(false)} title={t('training.pickEx')}>
        <ChipRow items={['all', 'chest', 'shoulders', 'back', 'legs', 'arms', 'core', 'cardio'].map((k) => ({ key: k, label: t(`group.${k}`) }))} value={group} onChange={setGroup} style={{ marginBottom: 10 }} />
        <ScrollView style={{ maxHeight: 420 }}>
          <Col gap={8}>
            {(exercises ?? []).map((x) => {
              const on = items.some((i) => i.id === x.id);
              return (
                <Pressable testID={`pick-${x.id}`} key={x.id} onPress={() => toggle(x)}>
                  <Row gap={10} style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: 8, borderWidth: 1.5, borderColor: on ? colors.yellow : 'transparent' }}>
                    <Img src={images[x.img]} style={{ width: 48, height: 48 }} radius={10} />
                    <Col style={{ flex: 1 }}><T v="captionStrong">{tr(x.name)}</T><T v="micro" color={colors.textMuted}>{t(`group.${x.group}`)}</T></Col>
                    <Icon name={on ? 'checkmark-circle' : 'add-circle-outline'} color={on ? colors.yellowDark : colors.textSubtle} />
                  </Row>
                </Pressable>
              );
            })}
          </Col>
        </ScrollView>
        <Button title={`${t('common.done')} (${items.length})`} onPress={() => setPick(false)} style={{ marginTop: 10 }} />
      </Sheet>
      <View />
    </Screen>
  );
}
