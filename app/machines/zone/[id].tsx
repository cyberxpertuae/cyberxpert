import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useI18n } from '../../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, SkeletonList, Pill } from '../../../src/components';
import { colors } from '../../../src/theme';
import { images } from '../../../src/data/images';
import { machinesService } from '../../../src/services/machinesService';
import { useAsync } from '../../../src/utils/useAsync';

/** E02 Machines in a zone */
export default function Zone() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tr } = useI18n();
  const zone = useAsync(() => machinesService.getZone(id!), [id]);
  const { data, loading } = useAsync(() => machinesService.getMachines(id!), [id]);
  return (
    <Screen title={tr(zone.data?.name)} header={{ subtitle: tr(zone.data?.floor) }}>
      {loading ? <SkeletonList rows={4} card={96} /> : (data ?? []).map((m) => (
        <Card key={m.id} testID={`machine-${m.id}`} padded={false} onPress={() => router.push(`/machines/${m.id}`)}>
          <Row gap={12} style={{ padding: 10 }}>
            <Img src={images[m.img]} style={{ width: 92, height: 92 }} radius={16} />
            <Col style={{ flex: 1 }} gap={4}>
              <T v="bodyStrong">{tr(m.name)}</T>
              <T v="caption" color={colors.textMuted} numberOfLines={2}>{tr(m.muscles)}</T>
              <Row gap={6}><Pill label={t(`machines.level${m.level}`)} bg={m.level === 1 ? colors.successSoft : m.level === 2 ? colors.warningSoft : colors.dangerSoft} fg={m.level === 1 ? colors.success : m.level === 2 ? colors.warning : colors.danger} /><Pill label={m.code} bg={colors.surface2} icon="qr-code-outline" /></Row>
            </Col>
            <Icon name="play-circle" size={30} color={colors.yellow} />
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
