import React, { useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useI18n } from '../../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Button, Input, StatusBadge, TierBadge } from '../../../src/components';
import { colors, radius } from '../../../src/theme';
import { staffService } from '../../../src/services/staffService';
import { catalogService } from '../../../src/services/catalogService';
import { useFmt } from '../../../src/utils/format';
import type { StaffMember } from '../../../src/store/app';

/** R09 Check-in (scan member QR or enter ID) */
export default function CheckIn() {
  const { t, tr } = useI18n();
  const f = useFmt();
  const [perm, request] = useCameraPermissions();
  const [id, setId] = useState('');
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ member: StaffMember | null; allowed: boolean; reason: string } | null>(null);
  const lock = useRef(false);
  const go = async (code: string) => {
    setBusy(true);
    const memberId = code.startsWith('EMPIRE:') ? code.split(':')[1] : code;
    const r = await staffService.checkIn(memberId);
    setBusy(false); setRes(r);
  };
  const cam = Platform.OS !== 'web' && perm?.granted;
  if (res) {
    const m = res.member;
    return (
      <Screen title={t('staff.ciTitle')} header={{ back: false }} footer={<Col gap={8}>{m ? <Button title={t('staff.viewMember')} variant="outline" onPress={() => router.push(`/staff/member/${m.id}`)} /> : null}<Button testID="ci-next" title={t('staff.scanAgain')} onPress={() => { setRes(null); setId(''); lock.current = false; }} /></Col>}>
        <Col gap={12} style={{ alignItems: 'center', paddingVertical: 20 }} testID={res.allowed ? 'ci-ok' : 'ci-denied'}>
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: res.allowed ? colors.success : colors.danger, alignItems: 'center', justifyContent: 'center' }}><Icon name={res.allowed ? 'checkmark' : 'close'} size={64} color="#fff" /></View>
          <T v="display" center>{res.allowed && m ? t('staff.ciOk', { name: tr(m.name).split(' ')[0] }) : !m ? t('staff.ciNotFound') : t('staff.ciDenied')}</T>
          {m ? <T v="body" center color={colors.textMuted}>{res.allowed ? t('staff.ciOkBody', { plan: tr(catalogService.planSync(m.plan)?.name) }) : res.reason === 'expired' ? t('staff.ciExpired', { d: f.date(m.end) }) : res.reason === 'frozen' ? t('staff.ciFrozen') : t('staff.ciPending')}</T> : null}
        </Col>
        {m ? (
          <Card>
            <Row gap={12}>
              <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' }}><T v="h2" color={colors.yellow}>{tr(m.name).slice(0, 1)}</T></View>
              <Col style={{ flex: 1 }} gap={4}><T v="bodyStrong">{tr(m.name)}</T><Row gap={6}><StatusBadge status={m.status} /><TierBadge tier={m.tier} small /></Row></Col>
              <T v="captionStrong" color={colors.textMuted}>{m.id}</T>
            </Row>
          </Card>
        ) : null}
        {m && !res.allowed && res.reason !== 'frozen' ? <Button title={res.reason === 'pending' ? t('staff.activate') : t('staff.renew')} variant="dark" onPress={() => router.push(`/staff/member/${m.id}`)} /> : null}
      </Screen>
    );
  }
  return (
    <Screen title={t('staff.ciTitle')} header={{ back: false, right: <Button small full={false} title={t('staff.visitsTitle')} variant="outline" onPress={() => router.push('/staff/visits')} /> }}>
      <View style={{ height: 280, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' }}>
        {cam ? <CameraView style={{ position: 'absolute', width: '100%', height: '100%' }} barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={({ data }) => { if (lock.current) return; lock.current = true; go(data); }} /> : (
          <Col gap={10} style={{ alignItems: 'center', padding: 20 }}>
            <Icon name="qr-code-outline" size={40} color={colors.gold} />
            <T v="body" center color={colors.onDarkMuted}>{t('staff.ciScan')}</T>
            {Platform.OS !== 'web' ? <Button small full={false} title={t('machines.allow')} onPress={request} /> : null}
          </Col>
        )}
        <View pointerEvents="none" style={{ width: 190, height: 190, borderRadius: 24, borderWidth: 3, borderColor: colors.yellow }} />
      </View>
      <T v="h3">{t('staff.ciManual')}</T>
      <Input testID="ci-id" icon="id-card-outline" autoCapitalize="characters" placeholder={t('staff.ciPh')} value={id} onChangeText={setId} hint={t('staff.ciTry')} />
      <Button testID="ci-go" title={t('staff.ciBtn')} loading={busy} onPress={() => id.trim() && go(id)} />
    </Screen>
  );
}
