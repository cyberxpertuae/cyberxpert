import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Button, EmptyState, Dialog, Pill, useToast } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { shopService } from '../../src/services/shopService';

/** P04 Payment methods */
export default function PaymentMethods() {
  const { t } = useI18n();
  const toast = useToast();
  const cards = useApp((s) => s.cards);
  const [del, setDel] = useState<string | null>(null);
  return (
    <Screen title={t('profile.payTitle')} footer={<Button testID="pm-add" title={t('checkout.addCard')} icon="add" onPress={() => router.push('/checkout/add-card')} />}>
      {!cards.length ? <EmptyState icon="card-outline" title={t('profile.noCards')} /> : cards.map((c) => (
        <View key={c.id} style={{ borderRadius: radius.xl, overflow: 'hidden' }} testID={`pm-${c.id}`}>
          <LinearGradient colors={c.brand === 'visa' ? [colors.black, '#2A2410'] : ['#1E1E24', '#3A1F1F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 18, gap: 18 }}>
            <Row justify="space-between"><T v="h3" color={colors.onDark}>{t(`pay.${c.brand}`)}</T>{c.default ? <Pill label={t('shop.addrDefault')} /> : null}</Row>
            <T v="h2" color={colors.onDark} style={{ letterSpacing: 2, writingDirection: 'ltr', textAlign: 'left' }}>•••• •••• •••• {c.last4}</T>
            <Row justify="space-between">
              <T v="caption" color={colors.onDarkMuted}>{t('profile.expires', { d: c.exp })}</T>
              <Row gap={16}>
                {!c.default ? <Pressable testID={`pm-default-${c.id}`} onPress={() => shopService.setDefaultCard(c.id)}><T v="captionStrong" color={colors.yellow}>{t('profile.makeDefault')}</T></Pressable> : null}
                <Pressable testID={`pm-del-${c.id}`} onPress={() => setDel(c.id)}><Icon name="trash-outline" size={18} color={colors.danger} /></Pressable>
              </Row>
            </Row>
          </LinearGradient>
        </View>
      ))}
      <Col />
      <Dialog visible={!!del} onClose={() => setDel(null)} danger icon="card-outline" title={t('profile.deleteCard')} confirm={t('common.remove')} cancel={t('common.cancel')} onConfirm={async () => { await shopService.deleteCard(del!); setDel(null); toast(t('profile.cardRemoved'), 'info'); }} />
    </Screen>
  );
}
