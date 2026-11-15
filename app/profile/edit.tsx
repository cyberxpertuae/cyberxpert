import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Img, Button, Input, Chip, useToast } from '../../src/components';
import { colors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { images } from '../../src/data/images';
import { profileService } from '../../src/services/profileService';
import { isEmail, isUaePhone, formatPhone } from '../../src/utils/validate';

/** P02 Edit profile */
export default function EditProfile() {
  const { t, tr } = useI18n();
  const toast = useToast();
  const u = useApp((s) => s.user)!;
  const [f, setF] = useState({ name: tr(u.fullName), email: u.email, phone: u.phone, gender: u.gender, eName: u.emergency.name, ePhone: u.emergency.phone });
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const save = async () => {
    const e: Record<string, string> = {};
    if (f.name.trim().length < 3) e.name = t('common.required');
    if (!isEmail(f.email)) e.email = t('common.invalidEmail');
    if (!isUaePhone(f.phone)) e.phone = t('common.invalidPhone');
    if (f.ePhone && !isUaePhone(f.ePhone)) e.ePhone = t('common.invalidPhone');
    setErr(e); if (Object.keys(e).length) return;
    setBusy(true);
    await profileService.update({ fullName: { en: f.name, ar: f.name }, firstName: { en: f.name.split(' ')[0], ar: f.name.split(' ')[0] }, email: f.email, phone: f.phone, gender: f.gender, emergency: { name: f.eName, phone: f.ePhone } });
    setBusy(false); toast(t('profile.saved')); router.back();
  };
  return (
    <Screen title={t('profile.editTitle')} footer={<Button testID="ep-save" title={t('common.save')} loading={busy} onPress={save} />}>
      <Col style={{ alignItems: 'center' }} gap={8}>
        <View><Img src={images[u.avatar]} style={{ width: 100, height: 100 }} radius={50} /><Pressable onPress={() => toast(t('profile.photoNote'), 'info')} style={{ position: 'absolute', bottom: 0, right: 0, width: 34, height: 34, borderRadius: 17, backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.bg }}><Icon name="camera" size={16} /></Pressable></View>
        <T v="captionStrong" color={colors.yellowDark} onPress={() => toast(t('profile.photoNote'), 'info')}>{t('profile.changePhoto')}</T>
      </Col>
      <Input testID="ep-name" label={t('auth.fullName')} icon="person-outline" value={f.name} onChangeText={(v) => setF({ ...f, name: v })} error={err.name} />
      <Input testID="ep-email" label={t('auth.email')} icon="mail-outline" keyboardType="email-address" autoCapitalize="none" value={f.email} onChangeText={(v) => setF({ ...f, email: v })} error={err.email} />
      <Input label={t('auth.phone')} prefix="+971" keyboardType="phone-pad" value={f.phone} onChangeText={(v) => setF({ ...f, phone: formatPhone(v) })} error={err.phone} />
      <Col gap={6}><T v="captionStrong" color={colors.textMuted}>{t('auth.gender')}</T><Row gap={8}>{['male', 'female'].map((g) => <Chip key={g} label={t(`gender.${g}`)} selected={f.gender === g} onPress={() => setF({ ...f, gender: g })} />)}</Row></Col>
      <T v="h3">{t('profile.emergency')}</T>
      <Input label={t('profile.emergencyName')} icon="people-outline" value={f.eName} onChangeText={(v) => setF({ ...f, eName: v })} />
      <Input label={t('profile.emergencyPhone')} prefix="+971" keyboardType="phone-pad" value={f.ePhone} onChangeText={(v) => setF({ ...f, ePhone: formatPhone(v) })} error={err.ePhone} />
    </Screen>
  );
}
