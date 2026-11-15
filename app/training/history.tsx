import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, SkeletonList, EmptyState } from '../../src/components';
import { colors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { trainingService, programSync } from '../../src/services/trainingService';
import { useAsync } from '../../src/utils/useAsync';
import { useFmt } from '../../src/utils/format';

/** T08 Workout history */
export default function History() {
  const { t, tr, num } = useI18n();
  const f = useFmt();
  const list = useApp((s) => s.history);
  const { loading, refreshing, refresh } = useAsync(() => trainingService.getHistory(), []);
  return (
    <Screen title={t('training.historyTitle')} refreshing={refreshing} onRefresh={refresh}>
      {loading ? <SkeletonList rows={6} card={64} /> : !list.length ? <EmptyState icon="barbell-outline" title={t('training.historyEmpty')} body={t('training.historyEmptyBody')} /> : list.map((h) => {
        const p = programSync(h.program);
        const d = p?.days.find((x) => x.id === h.day);
        return (
          <Card key={h.id} testID={`hist-${h.id}`} onPress={() => (p && d ? router.push(`/training/workout/${p.id}?day=${d.id}`) : undefined)}>
            <Row gap={12}>
              <Col style={{ width: 50, alignItems: 'center', backgroundColor: colors.black, borderRadius: 14, paddingVertical: 6 }}><T v="h3" color={colors.yellow}>{f.dayNum(h.date)}</T><T v="micro" color={colors.onDarkMuted}>{f.dow(h.date)}</T></Col>
              <Col style={{ flex: 1 }} gap={2}>
                <T v="bodyStrong" numberOfLines={1}>{d ? tr(d.name) : h.name ?? t('training.custom')}</T>
                <Row gap={10}><Row gap={3}><Icon name="time-outline" size={13} color={colors.textMuted} /><T v="micro" color={colors.textMuted}>{h.min} {t('common.min')}</T></Row><Row gap={3}><Icon name="flame-outline" size={13} color={colors.textMuted} /><T v="micro" color={colors.textMuted}>{num(h.kcal)}</T></Row><Row gap={3}><Icon name="layers-outline" size={13} color={colors.textMuted} /><T v="micro" color={colors.textMuted}>{h.sets} {t('common.sets')}</T></Row></Row>
              </Col>
              {h.volume ? <T v="captionStrong">{num(h.volume)} kg</T> : null}
            </Row>
          </Card>
        );
      })}
      <View />
    </Screen>
  );
}
