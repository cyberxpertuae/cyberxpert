import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, StatusBadge, SkeletonList, EmptyState } from '../../src/components';
import { colors } from '../../src/theme';
import { membershipService } from '../../src/services/membershipService';
import { useAsync } from '../../src/utils/useAsync';
import { useFmt } from '../../src/utils/format';

/** M10 Invoices / payment history */
export default function Invoices() {
  const { t, tr, money } = useI18n();
  const f = useFmt();
  const { data, loading, refreshing, refresh } = useAsync(() => membershipService.getInvoices(), []);
  return (
    <Screen title={t('membership.invoices')} refreshing={refreshing} onRefresh={refresh}>
      {loading ? <SkeletonList rows={6} card={64} /> : !data?.length ? <EmptyState icon="receipt-outline" title={t('membership.emptyInv')} /> : data.map((i) => (
        <Card key={i.id} testID={`inv-${i.id}`} onPress={() => router.push(`/membership/invoice/${i.id}`)}>
          <Row gap={12}>
            <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: colors.yellowSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name="receipt-outline" size={20} /></View>
            <Col style={{ flex: 1 }} gap={2}><T v="bodyStrong" numberOfLines={1}>{tr(i.title)}</T><T v="caption" color={colors.textMuted}>{f.date(i.date)} · {t(`pay.${i.method}`)}</T></Col>
            <Col style={{ alignItems: 'flex-end' }} gap={4}><T v="bodyStrong">{money(i.amount)}</T><StatusBadge status={i.status} /></Col>
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
