import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Image } from 'expo-image';
import { useI18n } from '../src/i18n';
import { Screen, T, Row, Col, TierBadge, StatusBadge, Button, EmptyState, Icon } from '../src/components';
import { colors, radius, shadow } from '../src/theme';
import { useApp } from '../src/store/app';
import { images } from '../src/data/images';
import { catalogService } from '../src/services/catalogService';
import { useFmt } from '../src/utils/format';

/** H04 Digital member card / check-in QR */
export default function MemberCard() {
  const { t, tr, num } = useI18n();
  const f = useFmt();
  const user = useApp((s) => s.user);
  const m = useApp((s) => s.membership);
  if (!user || !m) {
    return (
      <Screen title={t('card.title')}>
        <EmptyState icon="qr-code-outline" title={user ? t('card.noMembership') : t('guest.title')} body={user ? t('card.noMembershipBody') : t('guest.body')} action={user ? t('home.joinCta') : t('guest.create')} onAction={() => router.push(user ? '/plans' : '/auth/register')} />
      </Screen>
    );
  }
  const plan = catalogService.planSync(m.plan);
  return (
    <Screen title={t('card.title')} dark bg={colors.black}>
      <View style={[{ backgroundColor: colors.ink2, borderRadius: 28, padding: 22, alignItems: 'center', gap: 14, borderWidth: 1, borderColor: 'rgba(212,162,43,0.35)' }, shadow.raised]} testID="member-card">
        <Row gap={10} style={{ alignSelf: 'stretch' }} justify="space-between">
          <Row gap={10}>
            <Image source={images.logo} style={{ width: 40, height: 40 }} contentFit="contain" />
            <Col><T v="bodyStrong" color={colors.onDark}>EMPIRE GYM</T><T v="micro" color={colors.gold}>{tr(m.branch)}</T></Col>
          </Row>
          <TierBadge tier={user.tier} small />
        </Row>
        <View style={{ backgroundColor: '#fff', padding: 18, borderRadius: 24 }}>
          <QRCode value={`EMPIRE:${user.id}:${m.id}`} size={200} color={colors.black} backgroundColor="#fff" />
        </View>
        <T v="h2" color={colors.onDark}>{tr(user.fullName)}</T>
        <StatusBadge status={m.status} />
        <Row style={{ alignSelf: 'stretch', backgroundColor: colors.ink3, borderRadius: radius.lg, padding: 12 }} justify="space-between">
          <Col style={{ alignItems: 'center', flex: 1 }}><T v="micro" color={colors.onDarkMuted}>{t('card.memberId')}</T><T v="captionStrong" color={colors.onDark}>{user.id}</T></Col>
          <Col style={{ alignItems: 'center', flex: 1 }}><T v="micro" color={colors.onDarkMuted}>{t('card.plan')}</T><T v="captionStrong" color={colors.onDark} numberOfLines={1}>{tr(plan?.name)}</T></Col>
          <Col style={{ alignItems: 'center', flex: 1 }}><T v="micro" color={colors.onDarkMuted}>{t('card.valid')}</T><T v="captionStrong" color={colors.onDark}>{f.short(m.end)}</T></Col>
        </Row>
      </View>
      <T v="body" center color={colors.onDarkMuted}>{m.status === 'pending' ? t('membership.pendingNote') : t('card.scan')}</T>
      <Row gap={8} justify="center"><Icon name="sunny-outline" size={16} color={colors.gold} /><T v="caption" color={colors.gold}>{t('card.brightness')}</T></Row>
      <Row gap={10}>
        <Col style={{ flex: 1, alignItems: 'center', backgroundColor: colors.ink2, borderRadius: radius.lg, padding: 12 }}><T v="h2" color={colors.onDark}>{num(m.visits)}</T><T v="micro" color={colors.onDarkMuted}>{t('card.visits')}</T></Col>
        <Col style={{ flex: 1, alignItems: 'center', backgroundColor: colors.ink2, borderRadius: radius.lg, padding: 12 }}><T v="h2" color={colors.onDark}>{num(user.streak)}</T><T v="micro" color={colors.onDarkMuted}>{t('profile.streak')}</T></Col>
      </Row>
      <Button testID="card-membership" title={t('profile.myMembership')} variant="outline" style={{ backgroundColor: colors.ink2, borderColor: colors.ink3 }} onPress={() => router.push('/membership')} />
    </Screen>
  );
}
