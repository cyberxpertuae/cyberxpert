import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Button, EmptyState, SkeletonList, Dialog, useToast } from '../../src/components';
import { colors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { trainingService, exerciseSync } from '../../src/services/trainingService';
import { useAsync } from '../../src/utils/useAsync';
import { requireAuth } from '../../src/utils/guard';

/** T09 My workouts (custom) */
export default function MyWorkouts() {
  const { t, tr } = useI18n();
  const toast = useToast();
  const list = useApp((s) => s.customWorkouts);
  const { loading } = useAsync(() => trainingService.getCustom(), []);
  const [del, setDel] = useState<string | null>(null);
  return (
    <Screen title={t('training.myTitle')} footer={<Button testID="mw-create" title={t('training.create')} icon="add" onPress={() => requireAuth(() => router.push('/training/create'))} />}>
      {loading ? <SkeletonList rows={3} /> : !list.length ? <EmptyState icon="create-outline" title={t('training.myEmpty')} body={t('training.myEmptyBody')} /> : list.map((w) => (
        <Card key={w.id} testID={`cw-${w.id}`} onPress={() => router.push(`/training/workout/${w.id}`)}>
          <Row gap={12}>
            <Col style={{ flex: 1 }} gap={2}>
              <T v="bodyStrong">{w.name}</T>
              <T v="caption" color={colors.textMuted} numberOfLines={1}>{w.ex.map((e) => tr(exerciseSync(e.id).name)).join(' · ')}</T>
              <T v="micro" color={colors.yellowDark}>{w.day} · {w.ex.length} {t('training.exercises').toLowerCase()}</T>
            </Col>
            <Pressable testID={`cw-del-${w.id}`} hitSlop={8} onPress={() => setDel(w.id)}><Icon name="trash-outline" size={20} color={colors.danger} /></Pressable>
          </Row>
        </Card>
      ))}
      <Dialog visible={!!del} onClose={() => setDel(null)} danger icon="trash-outline" title={t('training.deleteQ')} confirm={t('common.delete')} cancel={t('common.cancel')} onConfirm={async () => { await trainingService.deleteCustom(del!); setDel(null); toast(t('common.done'), 'info'); }} />
    </Screen>
  );
}
