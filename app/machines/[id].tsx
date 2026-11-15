import React from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, Skeleton, Pill, HList } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { images } from '../../src/data/images';
import { machinesService } from '../../src/services/machinesService';
import { useAsync } from '../../src/utils/useAsync';

/** E03 Machine detail — how to use, video, muscles, tips */
export default function MachineDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tr } = useI18n();
  const { data: m, loading } = useAsync(() => machinesService.getMachine(id!), [id]);
  if (loading || !m) return <Screen title=" "><Skeleton h={260} r={24} /><Skeleton h={120} r={24} /></Screen>;
  const related = machinesService.relatedExercises(m.id);
  const list = (title: string, items: { en: string; ar: string }[], icon: any, color: string, bg = colors.surface) => (
    <Card style={{ gap: 8, backgroundColor: bg }}>
      <T v="h3">{title}</T>
      {items.map((s, i) => <Row key={i} gap={8} align="flex-start"><Icon name={icon} size={18} color={color} /><T v="body" style={{ flex: 1 }}>{tr(s)}</T></Row>)}
    </Card>
  );
  return (
    <Screen title={tr(m.name)}>
      <Img src={images[m.img]} style={{ height: 260, width: '100%', backgroundColor: '#E9EAEC' }} radius={radius.xl} contentFit="contain" />
      <Row gap={8} wrap><Pill label={t(`machines.level${m.level}`)} icon="speedometer-outline" /><Pill label={t('machines.code', { c: m.code })} bg={colors.surface} icon="qr-code-outline" /></Row>
      <T v="display">{tr(m.name)}</T>
      <Row gap={8}><Icon name="body-outline" size={18} color={colors.yellowDark} /><T v="body" color={colors.textMuted} style={{ flex: 1 }}>{tr(m.muscles)}</T></Row>
      <Pressable testID="mc-video" onPress={() => router.push(`/machines/video?id=${m.id}`)}>
        <View style={{ height: 120, borderRadius: radius.xl, overflow: 'hidden' }}>
          <Img src={images[m.img]} style={{ position: 'absolute', width: '100%', height: '100%' }} />
          <LinearGradient colors={['rgba(11,11,12,0.92)', 'rgba(11,11,12,0.5)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
            <Row gap={14}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center' }}><Icon name="play" size={26} color={colors.black} noFlip /></View>
              <Col style={{ flex: 1 }}><T v="h3" color={colors.onDark}>{t('machines.video')}</T><T v="caption" color={colors.onDarkMuted}>{t('machines.videoSub')}</T></Col>
            </Row>
          </LinearGradient>
        </View>
      </Pressable>
      <Card style={{ gap: 10 }}>
        <T v="h3">{t('machines.steps')}</T>
        {m.steps.map((s, i) => <Row key={i} gap={10} align="flex-start"><View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' }}><T v="micro" color={colors.yellow} weight="bold">{i + 1}</T></View><T v="body" style={{ flex: 1 }}>{tr(s)}</T></Row>)}
      </Card>
      {list(t('machines.settings'), m.settings, 'options-outline', colors.info)}
      {list(t('training.tips'), m.tips, 'bulb-outline', colors.success, colors.successSoft)}
      {list(t('training.mistakes'), m.mistakes, 'close-circle-outline', colors.danger, colors.dangerSoft)}
      {related.length ? (
        <Col gap={8}>
          <T v="h3">{t('machines.related')}</T>
          <HList data={related} keyExtractor={(e) => e.id} renderItem={(e) => (
            <Card padded={false} style={{ width: 160 }} onPress={() => router.push(`/training/exercise/${e.id}`)}>
              <Img src={images[e.img]} style={{ height: 90, width: '100%' }} />
              <Col style={{ padding: 10 }}><T v="captionStrong" numberOfLines={1}>{tr(e.name)}</T><T v="micro" color={colors.textMuted}>{e.sets} × {e.reps}</T></Col>
            </Card>
          )} />
        </Col>
      ) : null}
      <Row gap={8} style={{ backgroundColor: colors.yellowSoft, borderRadius: radius.md, padding: 12 }}><Icon name="shield-checkmark-outline" color={colors.yellowDark} /><T v="caption" style={{ flex: 1 }}>{t('machines.safety')}</T></Row>
    </Screen>
  );
}
