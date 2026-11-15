import React from 'react';
import { Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { useI18n } from '../../../src/i18n';
import { Screen, T, Col, Card, Button, SuccessBurst, KV } from '../../../src/components';
import { colors } from '../../../src/theme';
import { useApp } from '../../../src/store/app';
import { catalogService } from '../../../src/services/catalogService';
import { useStaffDraft } from '../../../src/store/staffDraft';
import { useFmt } from '../../../src/utils/format';

/** R06 Member registered / renewed */
export default function Success() {
  const { t, tr } = useI18n();
  const f = useFmt();
  const { id, renew } = useLocalSearchParams<{ id: string; renew?: string }>();
  const m = useApp((s) => s.members.find((x) => x.id === id));
  if (!m) return null;
  const pending = m.status === 'pending';
  return (
    <Screen header={false} footer={<Col gap={8}><Button testID="nm-view" title={t('staff.viewMember')} onPress={() => router.replace(`/staff/member/${m.id}`)} /><Button testID="nm-another" title={renew ? t('checkout.goHome') : t('staff.newAnother')} variant="ghost" onPress={() => { useStaffDraft.getState().reset(); router.replace(renew ? '/staff/(tabs)/dashboard' : '/staff/new-member/details'); }} /></Col>}>
      <SuccessBurst icon={pending ? 'paper-plane' : 'person-add'} />
      <T v="display" center>{renew ? t('staff.renewed') : pending ? t('staff.pendingReg') : t('staff.registered')}</T>
      <T v="body" center color={colors.textMuted}>{pending ? t('staff.pendingRegBody', { name: tr(m.name) }) : t('staff.registeredBody', { name: tr(m.name) })}</T>
      <Card style={{ alignItems: 'center', gap: 10 }}>
        <QRCode value={`EMPIRE:${m.id}`} size={150} />
        <KV k={t('card.memberId')} v={m.id} />
        <KV k={t('card.plan')} v={tr(catalogService.planSync(m.plan)?.name)} />
        <KV k={t('card.valid')} v={f.date(m.end)} />
      </Card>
      <Button title={t('staff.sendWa')} icon="logo-whatsapp" variant="outline" onPress={() => Linking.openURL(`https://wa.me/971${m.phone.replace(/\s/g, '')}?text=${encodeURIComponent('Empire Gym · ' + m.id)}`)} />
    </Screen>
  );
}
