import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, ProgressBar, Button, SectionHeader, Bars, Stat, IconName, IconButton, Wrap } from '../../src/components';
import { colors, radius, shadow } from '../../src/theme';
import { useApp, TODAY } from '../../src/store/app';
import { images } from '../../src/data/images';
import { trainingService, exerciseSync } from '../../src/services/trainingService';
import { coachSync } from '../../src/services/bookingService';
import { addDays } from '../../src/services/api';

/** T01 Training hub */
export default function Training() {
  const { t, tr, num } = useI18n();
  const history = useApp((s) => s.history);
  useApp((s) => s.activeProgram);
  const today = trainingService.todayWorkout();
  const coach = coachSync(today.program.coach);
  const week = Array.from({ length: 7 }, (_, i) => addDays(TODAY, i - 6));
  const perDay = week.map((d) => history.filter((h) => h.date === d).reduce((a, h) => a + h.min, 0));
  const wk = history.filter((h) => h.date >= week[0]);
  const links: { icon: IconName; label: string; to: string }[] = [
    { icon: 'list-outline', label: t('training.plans'), to: '/training/plans' },
    { icon: 'create-outline', label: t('training.myWorkouts'), to: '/training/my-workouts' },
    { icon: 'time-outline', label: t('training.history'), to: '/training/history' },
    { icon: 'trending-up-outline', label: t('training.progress'), to: '/progress' },
    { icon: 'construct-outline', label: t('training.machines'), to: '/machines' },
    { icon: 'chatbubbles-outline', label: t('training.chat'), to: '/coach-chat' },
  ];
  return (
    <Screen contentStyle={{ paddingBottom: 110 }}>
      <Row justify="space-between">
        <T v="display">{t('training.title')}</T>
        <IconButton testID="tr-history" name="calendar-outline" onPress={() => router.push('/training/history')} />
      </Row>
      <Pressable testID="tr-today" onPress={() => router.push(`/training/workout/${today.program.id}?day=${today.day.id}`)}>
        <View style={[{ borderRadius: radius.xl, overflow: 'hidden', height: 230 }, shadow.raised]}>
          <Img src={images[today.program.img]} style={{ position: 'absolute', width: '100%', height: '100%' }} />
          <LinearGradient colors={['rgba(11,11,12,0.2)', 'rgba(11,11,12,0.95)']} style={{ flex: 1, padding: 16, justifyContent: 'flex-end', gap: 6 }}>
            <T v="micro" color={colors.gold}>{t('training.activePlan').toUpperCase()} · {t('training.weekOf', { a: today.week, b: today.program.weeks })}</T>
            <T v="h1" color={colors.onDark}>{tr(today.day.name)}</T>
            <T v="caption" color={colors.onDarkMuted} numberOfLines={1}>{today.day.ex.slice(0, 3).map((e) => tr(exerciseSync(e).name)).join(' · ')}</T>
            <ProgressBar value={today.progress} track="rgba(255,255,255,0.18)" />
            <Row gap={10} style={{ marginTop: 6 }}>
              <Button testID="tr-start" small full={false} style={{ flex: 1 }} icon="play" title={t('training.startWorkout')} onPress={() => router.push(`/training/workout/${today.program.id}?day=${today.day.id}`)} />
              {coach ? <Row gap={6}><Img src={images[coach.img]} style={{ width: 28, height: 28 }} radius={14} /><T v="micro" color={colors.onDarkMuted}>{t('training.byCoach', { name: tr(coach.name).split(' ')[0] })}</T></Row> : null}
            </Row>
          </LinearGradient>
        </View>
      </Pressable>
      <SectionHeader title={t('training.thisWeek')} />
      <Row gap={10}>
        <Stat icon="barbell-outline" value={num(wk.length)} label={t('training.workouts')} />
        <Stat icon="time-outline" value={num(wk.reduce((a, h) => a + h.min, 0))} label={t('training.minutes')} />
        <Stat icon="flame-outline" value={num(wk.reduce((a, h) => a + h.kcal, 0))} label={t('common.kcal')} />
      </Row>
      <Card><Bars data={perDay} labels={week.map((d) => t(`days.${new Date(d + 'T00:00:00').getDay()}`).slice(0, 2))} highlight={6} /></Card>
      <Wrap style={{ gap: 10 }}>
        {links.map((l) => (
          <Pressable testID={`tr-link-${l.to.split('/').pop()}`} key={l.to} onPress={() => router.push(l.to as any)} style={{ width: '48%', flexGrow: 1 }}>
            <Row gap={10} style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14 }}>
              <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: colors.yellowSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name={l.icon} size={19} /></View>
              <T v="captionStrong" style={{ flex: 1 }} numberOfLines={2}>{l.label}</T>
            </Row>
          </Pressable>
        ))}
      </Wrap>
    </Screen>
  );
}
