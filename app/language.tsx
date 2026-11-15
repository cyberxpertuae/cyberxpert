import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useI18n, Lang } from '../src/i18n';
import { Screen, T, Row, Col, Icon, Button } from '../src/components';
import { colors, radius } from '../src/theme';
import { images } from '../src/data/images';

/** A02 Language selection */
export default function Language() {
  const { t, lang, setLang } = useI18n();
  const opt = (l: Lang, label: string, sub: string, flag: string) => (
    <Pressable testID={`lang-${l}`} onPress={() => setLang(l)}>
      <Row gap={14} style={{ backgroundColor: lang === l ? colors.black : colors.surface, borderRadius: radius.xl, padding: 18, borderWidth: 1.5, borderColor: lang === l ? colors.yellow : colors.border }}>
        <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: lang === l ? colors.ink3 : colors.surface2, alignItems: 'center', justifyContent: 'center' }}>
          <T v="h3" color={lang === l ? colors.yellow : colors.text}>{flag}</T>
        </View>
        <Col style={{ flex: 1 }}>
          <T v="h3" color={lang === l ? colors.onDark : colors.text}>{label}</T>
          <T v="caption" color={lang === l ? colors.onDarkMuted : colors.textMuted}>{sub}</T>
        </Col>
        <Icon name={lang === l ? 'radio-button-on' : 'radio-button-off'} color={lang === l ? colors.yellow : colors.textSubtle} />
      </Row>
    </Pressable>
  );
  return (
    <Screen scroll={false} footer={<Button testID="lang-continue" title={t('common.continue')} onPress={() => router.replace('/onboarding')} />}>
      <Col gap={14} style={{ flex: 1, justifyContent: 'center' }}>
        <Image source={images.icon} style={{ width: 84, height: 84, borderRadius: 22, alignSelf: 'center', marginBottom: 12 }} />
        <T v="display" center>{t('lang.title')}</T>
        <T v="body" center color={colors.textMuted} style={{ marginBottom: 12 }}>{t('lang.subtitle')}</T>
        {opt('ar', 'العربية', 'Arabic', 'ع')}
        {opt('en', 'English', 'الإنجليزية', 'En')}
      </Col>
    </Screen>
  );
}
