import React from 'react';
import { Share } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { useI18n } from '../../../src/i18n';
import { Screen, T, Row, Col, Card, KV, Divider, Button, StatusBadge, Skeleton } from '../../../src/components';
import { colors } from '../../../src/theme';
import { images } from '../../../src/data/images';
import { gym } from '../../../src/services/catalogService';
import { membershipService } from '../../../src/services/membershipService';
import { useAsync } from '../../../src/utils/useAsync';
import { useFmt } from '../../../src/utils/format';

/** M11 Invoice detail */
export default function Invoice() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tr, money } = useI18n();
  const f = useFmt();
  const { data: i, loading } = useAsync(() => membershipService.getInvoice(id!), [id]);
  if (loading || !i) return <Screen title={t('membership.invoiceTitle')}><Skeleton h={360} r={24} /></Screen>;
  const net = +(i.amount / 1.05).toFixed(2);
  return (
    <Screen title={t('membership.invoiceTitle')} footer={<Button testID="inv-share" icon="share-outline" title={t('membership.download')} variant="dark" onPress={() => Share.share({ message: `${tr(gym.name)} · ${i.id} · ${money(i.amount)}` })} />}>
      <Card style={{ gap: 6 }}>
        <Row justify="space-between">
          <Row gap={10}><Image source={images.icon} style={{ width: 44, height: 44, borderRadius: 12 }} /><Col><T v="h3">{tr(gym.name)}</T><T v="micro" color={colors.textMuted}>{t('membership.trn')}</T></Col></Row>
          <StatusBadge status={i.status} />
        </Row>
        <Divider style={{ marginVertical: 8 }} />
        <KV k={t('membership.invoiceNo')} v={i.id} />
        <KV k={t('membership.date')} v={f.date(i.date)} />
        <KV k={t('membership.method')} v={t(`pay.${i.method}`)} />
        <Divider style={{ marginVertical: 8 }} />
        <KV k={tr(i.title)} v={money(net)} />
        <KV k={t('common.vatIncl')} v={money(+(i.amount - net).toFixed(2))} />
        <Divider style={{ marginVertical: 8 }} />
        <KV k={t('common.total')} v={money(i.amount)} strong />
        <T v="micro" color={colors.textSubtle} style={{ marginTop: 8 }}>{tr(gym.address)}</T>
      </Card>
    </Screen>
  );
}
