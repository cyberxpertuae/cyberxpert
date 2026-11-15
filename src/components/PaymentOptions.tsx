import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../i18n';
import { colors, radius } from '../theme';
import { useApp } from '../store/app';
import { T } from './T';
import { Row, Col } from './Layout';
import { Icon, IconName } from './Icon';

/** Shared payment-method picker (saved cards, wallets, pay at gym). */
export function PaymentOptions({ value, onChange, allowGym, gymLabel }: { value: string | null; onChange: (v: string) => void; allowGym?: boolean; gymLabel?: string }) {
  const { t } = useI18n();
  const cards = useApp((s) => s.cards);
  const opt = (key: string, icon: IconName, title: string, sub?: string) => {
    const on = value === key;
    return (
      <Pressable testID={`pay-${key}`} key={key} onPress={() => onChange(key)}>
        <Row gap={12} style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, borderWidth: 1.5, borderColor: on ? colors.yellow : colors.border }}>
          <View style={{ width: 44, height: 32, borderRadius: 8, backgroundColor: on ? colors.black : colors.surface2, alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={18} color={on ? colors.yellow : colors.text} /></View>
          <Col style={{ flex: 1 }}><T v="bodyStrong">{title}</T>{sub ? <T v="caption" color={colors.textMuted}>{sub}</T> : null}</Col>
          <Icon name={on ? 'radio-button-on' : 'radio-button-off'} color={on ? colors.yellowDark : colors.textSubtle} />
        </Row>
      </Pressable>
    );
  };
  return (
    <Col gap={10}>
      {cards.map((c) => opt(c.id, 'card', `${t(`pay.${c.brand}`)} •••• ${c.last4}`, t('profile.expires', { d: c.exp })))}
      <Pressable testID="pay-addcard" onPress={() => router.push('/checkout/add-card')}>
        <Row gap={12} style={{ borderRadius: radius.lg, padding: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border }}>
          <Icon name="add-circle-outline" color={colors.yellowDark} />
          <T v="bodyStrong" color={colors.yellowDark}>{t('checkout.addCard')}</T>
        </Row>
      </Pressable>
      {opt('apple', 'logo-apple', t('pay.apple'))}
      {opt('google', 'logo-google', t('pay.google'))}
      {allowGym ? opt('gym', 'storefront-outline', t('pay.gym'), gymLabel) : null}
    </Col>
  );
}
