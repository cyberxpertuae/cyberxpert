import React, { useState } from 'react';
import { Switch } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Button, Input, Chip, useToast } from '../../src/components';
import { colors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { shopService } from '../../src/services/shopService';

const EMIRATES = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'];
const EMIRATES_AR: Record<string, string> = { 'Abu Dhabi': 'أبوظبي', Dubai: 'دبي', Sharjah: 'الشارقة', Ajman: 'عجمان', 'Umm Al Quwain': 'أم القيوين', 'Ras Al Khaimah': 'رأس الخيمة', Fujairah: 'الفجيرة' };

/** S07 Add / edit address */
export default function AddressForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { t, tr, lang } = useI18n();
  const toast = useToast();
  const ex = useApp((s) => s.addresses.find((a) => a.id === id));
  const [f, setF] = useState({ label: ex?.label.en ?? 'Home', emirate: ex?.emirate ?? 'Abu Dhabi', area: ex ? tr(ex.area) : '', building: ex?.building ?? '', flat: ex?.flat ?? '', def: ex?.default ?? false });
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const labels: Record<string, { en: string; ar: string }> = { Home: { en: 'Home', ar: 'المنزل' }, Work: { en: 'Work', ar: 'العمل' }, Other: { en: 'Other', ar: 'أخرى' } };
  const save = async () => {
    const e: Record<string, string> = {};
    if (!f.area.trim()) e.area = t('common.required');
    if (!f.building.trim()) e.building = t('common.required');
    setErr(e); if (Object.keys(e).length) return;
    setBusy(true);
    await shopService.saveAddress({ id: ex?.id, label: labels[f.label], emirate: f.emirate, area: { en: f.area, ar: f.area }, building: f.building, flat: f.flat, default: f.def });
    setBusy(false); toast(t('shop.addrSaved')); router.back();
  };
  return (
    <Screen title={ex ? t('shop.addrTitleEdit') : t('shop.addrTitleNew')} footer={<Button testID="addr-save" title={t('common.save')} loading={busy} onPress={save} />}>
      <Col gap={6}><T v="captionStrong" color={colors.textMuted}>{t('shop.label')}</T><Row gap={8}>{['Home', 'Work', 'Other'].map((l) => <Chip key={l} label={t(`shop.l_${l.toLowerCase()}`)} selected={f.label === l} onPress={() => setF({ ...f, label: l })} />)}</Row></Col>
      <Col gap={6}><T v="captionStrong" color={colors.textMuted}>{t('shop.emirate')}</T><Row gap={8} wrap>{EMIRATES.map((e) => <Chip key={e} label={lang === 'ar' ? EMIRATES_AR[e] : e} selected={f.emirate === e} onPress={() => setF({ ...f, emirate: e })} />)}</Row></Col>
      <Input testID="addr-area" label={t('shop.area')} icon="map-outline" value={f.area} onChangeText={(v) => setF({ ...f, area: v })} placeholder={lang === 'ar' ? 'مثال: مدينة محمد بن زايد' : 'e.g. Mohammed Bin Zayed City'} error={err.area} />
      <Input testID="addr-building" label={t('shop.building')} icon="business-outline" value={f.building} onChangeText={(v) => setF({ ...f, building: v })} error={err.building} />
      <Input label={t('shop.flat')} value={f.flat} onChangeText={(v) => setF({ ...f, flat: v })} placeholder={t('common.optional')} />
      <Row gap={10}><T v="bodyStrong" style={{ flex: 1 }}>{t('shop.makeDefault')}</T><Switch value={f.def} onValueChange={(v) => setF({ ...f, def: v })} trackColor={{ true: colors.yellow, false: colors.border }} thumbColor="#fff" /></Row>
    </Screen>
  );
}
