import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useI18n } from '../../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, Button, Skeleton, Pill, ListRow } from '../../../src/components';
import { colors, radius } from '../../../src/theme';
import { images } from '../../../src/data/images';
import { trainingService } from '../../../src/services/trainingService';
import { machineSync } from '../../../src/services/machinesService';
import { useAsync } from '../../../src/utils/useAsync';

/** T05 Exercise detail */
export default function ExerciseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tr } = useI18n();
  const { data: ex, loading } = useAsync(() => trainingService.getExercise(id!), [id]);
  if (loading || !ex) return <Screen title=" "><Skeleton h={220} r={24} /></Screen>;
  const m = machineSync(ex.machine);
  const steps = m?.steps ?? [{ en: 'Brace your core and keep a neutral spine.', ar: 'شدّ عضلات البطن وحافظ على استقامة العمود الفقري.' }, { en: 'Move with control for the full time or reps.', ar: 'تحرّك بتحكم طوال الوقت أو التكرارات.' }, { en: 'Breathe steadily — don\'t hold your breath.', ar: 'تنفّس بانتظام — لا تحبس نفسك.' }];
  return (
    <Screen title={tr(ex.name)} footer={m ? <Button testID="ex-video" title={t('machines.video')} icon="play-circle" variant="dark" onPress={() => router.push(`/machines/video?id=${m.id}`)} /> : undefined}>
      <Img src={images[ex.img]} style={{ height: 220, width: '100%' }} radius={radius.xl} />
      <Row gap={8} wrap><Pill label={t(`group.${ex.group}`)} icon="body-outline" /><Pill label={`${ex.sets} × ${ex.reps}`} bg={colors.surface} icon="repeat-outline" />{ex.rest ? <Pill label={t('training.rest', { n: ex.rest })} bg={colors.surface} icon="time-outline" /> : null}</Row>
      <T v="display">{tr(ex.name)}</T>
      {m ? <T v="body" color={colors.textMuted}>{t('training.muscles')}: {tr(m.muscles)}</T> : null}
      <Card style={{ gap: 10 }}>
        <T v="h3">{t('training.howTo')}</T>
        {steps.map((s, i) => <Row key={i} gap={10} align="flex-start"><Col style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center' }}><T v="micro" weight="bold">{i + 1}</T></Col><T v="body" style={{ flex: 1 }}>{tr(s)}</T></Row>)}
      </Card>
      {m?.tips?.length ? <Card style={{ gap: 8, backgroundColor: colors.successSoft }}><T v="h3">{t('training.tips')}</T>{m.tips.map((s, i) => <Row key={i} gap={8}><Icon name="bulb-outline" size={18} color={colors.success} /><T v="body" style={{ flex: 1 }}>{tr(s)}</T></Row>)}</Card> : null}
      {m?.mistakes?.length ? <Card style={{ gap: 8, backgroundColor: colors.dangerSoft }}><T v="h3">{t('training.mistakes')}</T>{m.mistakes.map((s, i) => <Row key={i} gap={8}><Icon name="close-circle-outline" size={18} color={colors.danger} /><T v="body" style={{ flex: 1 }}>{tr(s)}</T></Row>)}</Card> : null}
      {m ? <Card style={{ paddingVertical: 4 }}><ListRow testID="ex-machine" icon="construct-outline" title={t('training.viewMachine')} subtitle={tr(m.name)} onPress={() => router.push(`/machines/${m.id}`)} /></Card> : <T v="caption" color={colors.textMuted}>{t('training.noMachine')}</T>}
    </Screen>
  );
}
