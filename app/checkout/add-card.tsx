import React, { useState } from 'react';
import { Switch, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Button, Input, useToast } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { isCard, isExpiry, formatCard } from '../../src/utils/validate';
import { shopService } from '../../src/services/shopService';

/** M06 Add card */
export default function AddCard() {
  const { t } = useI18n();
  const toast = useToast();
  const [f, setF] = useState({ num: '', name: '', exp: '', cvv: '' });
  const [save, setSave] = useState(true);
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const brand = f.num.startsWith('5') ? 'mastercard' : 'visa';
  const submit = async () => {
    const e: Record<string, string> = {};
    if (!isCard(f.num)) e.num = t('checkout.cardErr');
    if (f.name.trim().length < 3) e.name = t('common.required');
    if (!isExpiry(f.exp)) e.exp = t('checkout.expiryErr');
    if (!/^\d{3}$/.test(f.cvv)) e.cvv = t('checkout.cvvErr');
    setErr(e); if (Object.keys(e).length) return;
    setBusy(true);
    await shopService.addCard({ brand, last4: f.num.replace(/\s/g, '').slice(-4), exp: f.exp, name: f.name.toUpperCase() }, save);
    setBusy(false); toast(t('checkout.cardAdded')); router.back();
  };
  return (
    <Screen title={t('checkout.cardTitle')} footer={<Button testID="card-save" title={t('common.save')} loading={busy} onPress={submit} />}>
      <View style={{ borderRadius: radius.xl, overflow: 'hidden' }}>
        <LinearGradient colors={[colors.black, '#3A2F10']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 190, padding: 20, justifyContent: 'space-between' }}>
          <Row justify="space-between"><Icon name="card" size={28} color={colors.gold} /><T v="h3" color={colors.onDark}>{brand === 'visa' ? 'VISA' : 'Mastercard'}</T></Row>
          <T v="h2" color={colors.onDark} style={{ letterSpacing: 2, textAlign: 'left', writingDirection: 'ltr' }}>{f.num || '•••• •••• •••• ••••'}</T>
          <Row justify="space-between"><T v="captionStrong" color={colors.onDarkMuted}>{f.name.toUpperCase() || 'NAME SURNAME'}</T><T v="captionStrong" color={colors.onDarkMuted}>{f.exp || 'MM/YY'}</T></Row>
        </LinearGradient>
      </View>
      <Input testID="card-num" label={t('checkout.cardNumber')} icon="card-outline" keyboardType="number-pad" value={f.num} onChangeText={(v) => setF({ ...f, num: formatCard(v) })} placeholder="4242 4242 4242 4242" error={err.num} />
      <Input testID="card-name" label={t('checkout.cardName')} icon="person-outline" autoCapitalize="characters" value={f.name} onChangeText={(v) => setF({ ...f, name: v })} error={err.name} />
      <Row gap={12} align="flex-start">
        <Col style={{ flex: 1 }}><Input testID="card-exp" label={t('checkout.expiry')} keyboardType="number-pad" placeholder="08/28" value={f.exp} onChangeText={(v) => { const d = v.replace(/\D/g, '').slice(0, 4); setF({ ...f, exp: d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d }); }} error={err.exp} /></Col>
        <Col style={{ flex: 1 }}><Input testID="card-cvv" label={t('checkout.cvv')} keyboardType="number-pad" secure maxLength={3} value={f.cvv} onChangeText={(v) => setF({ ...f, cvv: v.replace(/\D/g, '') })} error={err.cvv} /></Col>
      </Row>
      <Row gap={10}><T v="bodyStrong" style={{ flex: 1 }}>{t('checkout.saveCard')}</T><Switch value={save} onValueChange={setSave} trackColor={{ true: colors.yellow, false: colors.border }} thumbColor="#fff" /></Row>
      <Row gap={8}><Icon name="lock-closed" size={16} color={colors.success} /><T v="caption" color={colors.textMuted}>{t('checkout.secure')}</T></Row>
    </Screen>
  );
}
