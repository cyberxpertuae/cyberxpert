import React from 'react';
import { Linking, View } from 'react-native';
import { Image } from 'expo-image';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, Button, KV, IconName } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { images } from '../../src/data/images';
import { gym } from '../../src/services/catalogService';

/** P07 About Empire Gym */
export default function About() {
  const { t, tr } = useI18n();
  const facilities: { i: IconName; k: string }[] = [{ i: 'resize-outline', k: 'f1' }, { i: 'woman-outline', k: 'f2' }, { i: 'leaf-outline', k: 'f3' }, { i: 'car-outline', k: 'f4' }, { i: 'water-outline', k: 'f5' }, { i: 'flask-outline', k: 'f6' }];
  return (
    <Screen title={t('info.aboutTitle')}>
      <View style={{ height: 200, borderRadius: radius.xl, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
        <Img src={images['hero-gym']} style={{ position: 'absolute', width: '100%', height: '100%' }} />
        <View style={{ backgroundColor: 'rgba(11,11,12,0.55)', position: 'absolute', width: '100%', height: '100%' }} />
        <Image source={images.logo} style={{ width: 120, height: 120 }} contentFit="contain" />
      </View>
      <T v="display">{tr(gym.name)}</T>
      <T v="captionStrong" color={colors.gold}>{tr(gym.tagline)}</T>
      <T v="body" color={colors.textMuted}>{tr(gym.about)}</T>
      <T v="h3">{t('info.facilities')}</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {facilities.map((f) => <Row key={f.k} gap={8} style={{ width: '48%', backgroundColor: colors.surface, borderRadius: radius.md, padding: 10 }}><Icon name={f.i} size={18} color={colors.yellowDark} /><T v="caption" style={{ flex: 1 }}>{t(`info.${f.k}`)}</T></Row>)}
      </View>
      <Card style={{ gap: 4 }}><T v="h3">{t('info.hours')}</T>{gym.hours.map((h, i) => <KV key={i} k={tr(h.days)} v={tr(h.time)} />)}</Card>
      <Card style={{ gap: 8 }}>
        <T v="h3">{t('info.location')}</T>
        <Row gap={8} align="flex-start"><Icon name="location" color={colors.danger} /><T v="body" style={{ flex: 1 }}>{tr(gym.address)}</T></Row>
        <Button testID="about-directions" small title={t('info.directions')} icon="navigate-outline" variant="dark" onPress={() => Linking.openURL('https://maps.google.com/?q=Mussafah+Shabiya+11+Abu+Dhabi')} />
      </Card>
      <Col />
    </Screen>
  );
}
