import React, { useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Button, Input } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { machinesService } from '../../src/services/machinesService';

/** E05 Scan machine QR (+ manual code) */
export default function Scan() {
  const { t } = useI18n();
  const [perm, request] = useCameraPermissions();
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const find = async (c: string) => {
    setBusy(true); setErr('');
    const m = await machinesService.findByCode(c.replace(/^EMPIRE-MACHINE:/, ''));
    setBusy(false);
    if (m) router.replace(`/machines/${m.id}`); else { setErr(t('machines.notFound')); lock.current = false; }
  };
  const cam = Platform.OS !== 'web' && perm?.granted;
  return (
    <Screen title={t('machines.scanTitle')}>
      <View style={{ height: 300, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' }}>
        {cam ? (
          <CameraView style={{ position: 'absolute', width: '100%', height: '100%' }} barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={({ data }) => { if (lock.current) return; lock.current = true; find(data); }} />
        ) : (
          <Col gap={10} style={{ alignItems: 'center', padding: 20 }}>
            <Icon name="camera-outline" size={40} color={colors.gold} />
            <T v="body" center color={colors.onDarkMuted}>{t('machines.permission')}</T>
            {Platform.OS !== 'web' ? <Button testID="cam-allow" small full={false} title={t('machines.allow')} onPress={request} /> : null}
          </Col>
        )}
        <View pointerEvents="none" style={{ width: 200, height: 200, borderRadius: 24, borderWidth: 3, borderColor: colors.yellow }} />
      </View>
      <T v="body" center color={colors.textMuted}>{t('machines.scanHint')}</T>
      <T v="h3">{t('machines.manual')}</T>
      <Row gap={10} align="flex-start">
        <Col style={{ flex: 1 }}><Input testID="mc-code" icon="qr-code-outline" placeholder={t('machines.codePh')} autoCapitalize="characters" value={code} onChangeText={(v) => { setCode(v); setErr(''); }} error={err} hint={t('machines.tryCodes')} /></Col>
        <Button testID="mc-find" title={t('machines.find')} full={false} variant="dark" loading={busy} onPress={() => code && find(code)} />
      </Row>
    </Screen>
  );
}
