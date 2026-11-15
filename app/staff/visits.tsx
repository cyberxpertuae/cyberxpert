import React from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Card, StatusBadge, SkeletonList } from '../../src/components';
import { colors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { staffService } from '../../src/services/staffService';
import { useAsync } from '../../src/utils/useAsync';
import { useFmt } from '../../src/utils/format';

/** R10 Today's visits */
export default function Visits() {
  const { t, tr } = useI18n();
  const f = useFmt();
  const visits = useApp((s) => s.visits);
  const { loading } = useAsync(() => staffService.visits(), []);
  return (
    <Screen title={t('staff.visitsTitle')}>
      {loading ? <SkeletonList rows={8} card={56} /> : (
        <Card style={{ paddingVertical: 4 }}>
          {visits.map((v, i) => {
            const m = staffService.memberSync(v.member);
            return (
              <Row key={v.id} gap={12} style={{ paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }} onTouchEnd={() => m && router.push(`/staff/member/${m.id}`)}>
                <T v="captionStrong" style={{ width: 70 }}>{f.time(v.time)}</T>
                <Col style={{ flex: 1 }}><T v="bodyStrong" numberOfLines={1}>{m ? tr(m.name) : v.member}</T><T v="micro" color={colors.textMuted}>{v.member}</T></Col>
                <StatusBadge status={v.result} />
              </Row>
            );
          })}
        </Card>
      )}
      <View />
    </Screen>
  );
}
