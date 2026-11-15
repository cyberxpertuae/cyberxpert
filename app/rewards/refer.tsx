import React from 'react';
import { Share, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Button, Img, useToast, IconName } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { images } from '../../src/data/images';

/** L06 Refer a friend */
export default function Refer() {
  const { t, lang } = useI18n();
  const toast = useToast();
  const user = useApp((s) => s.user);
  const code = user?.referral ?? 'EMPIRE-FRIEND';
  const friends = [{ en: 'Saeed Al Mazrouei', ar: 'سعيد المزروعي', d: '5 Nov' }, { en: 'Ali Raza', ar: 'علي رضا', d: '18 Sep' }];
  const steps: { i: IconName; l: string }[] = [{ i: 'share-social-outline', l: t('rewards.how1') }, { i: 'person-add-outline', l: t('rewards.how2') }, { i: 'gift-outline', l: t('rewards.how3') }];
  return (
    <Screen title={t('rewards.refer')} footer={<Button testID="ref-share" title={t('common.share')} icon="share-social" onPress={() => Share.share({ message: t('rewards.shareMsg', { c: code }) })} />}>
      <Img src={images['c-hiit']} style={{ height: 170, width: '100%' }} radius={radius.xl} />
      <T v="display">{t('rewards.referTitle')}</T>
      <T v="body" color={colors.textMuted}>{t('rewards.referBody')}</T>
      <Card style={{ backgroundColor: colors.black }}>
        <T v="micro" color={colors.onDarkMuted}>{t('rewards.yourCode').toUpperCase()}</T>
        <Row justify="space-between" style={{ marginTop: 6 }}>
          <T v="h1" color={colors.yellow} style={{ letterSpacing: 2 }}>{code}</T>
          <Button testID="ref-copy" small full={false} title={t('common.copy')} icon="copy-outline" onPress={async () => { await Clipboard.setStringAsync(code); toast(t('common.copied')); }} />
        </Row>
      </Card>
      <Row gap={8}>
        {steps.map((s, k) => (
          <Col key={k} gap={6} style={{ flex: 1, alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.yellowSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name={s.i} size={19} /></View>
            <T v="micro" center>{`${k + 1}. ${s.l}`}</T>
          </Col>
        ))}
      </Row>
      <T v="h3">{t('rewards.friends')}</T>
      <Card style={{ paddingVertical: 4 }}>
        {friends.map((fr, k) => (
          <Row key={k} gap={12} style={{ paddingVertical: 12, borderTopWidth: k ? 1 : 0, borderTopColor: colors.border }}>
            <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}><Icon name="person" size={18} color={colors.textMuted} /></View>
            <Col style={{ flex: 1 }}><T v="bodyStrong">{lang === 'ar' ? fr.ar : fr.en}</T><T v="caption" color={colors.textMuted}>{fr.d}</T></Col>
            <T v="bodyStrong" color={colors.success}>+500</T>
          </Row>
        ))}
      </Card>
    </Screen>
  );
}
