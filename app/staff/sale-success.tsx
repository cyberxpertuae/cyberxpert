import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Card, Button, SuccessBurst, KV, Divider } from '../../src/components';
import { colors } from '../../src/theme';
import { productSync } from '../../src/services/shopService';

/** R12 Sale complete */
export default function SaleSuccess() {
  const { t, tr, money } = useI18n();
  const { r } = useLocalSearchParams<{ r: string }>();
  const rc = JSON.parse(r ?? '{}');
  return (
    <Screen header={false} footer={<Button testID="sale-new" title={t('staff.newSale')} onPress={() => router.replace('/staff/(tabs)/pos')} />}>
      <SuccessBurst icon="cash" />
      <T v="display" center>{t('staff.saleDone')}</T>
      <T v="body" center color={colors.textMuted}>{t('staff.receipt', { id: rc.id })}</T>
      <Card>
        {(rc.items ?? []).map((i: any) => <KV key={i.id} k={`${tr(productSync(i.id).name)} × ${i.qty}`} v={money(productSync(i.id).price * i.qty)} />)}
        <Divider style={{ marginVertical: 6 }} />
        {rc.disc ? <KV k={t('common.discount')} v={'− ' + money(rc.disc)} color={colors.success} /> : null}
        <KV k={t(`pay.${rc.method}`)} v={money(rc.total)} strong />
      </Card>
    </Screen>
  );
}
