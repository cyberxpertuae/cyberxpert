import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Button, Steps, HList } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { catalogService } from '../../src/services/catalogService';
import { bookingService } from '../../src/services/bookingService';
import { addMonths, addDays } from '../../src/services/api';
import { useFmt } from '../../src/utils/format';

/** M03 Checkout step 1: start date & add-ons */
export default function CheckoutStart() {
  const { t, tr, money } = useI18n();
  const f = useFmt();
  const d = useApp((s) => s.checkout);
  const set = (p: Partial<typeof d>) => useApp.getState().set({ checkout: { ...d, ...p } });
  const plan = catalogService.planSync(d.planId);
  if (!plan) return null;
  const dates = bookingService.week().concat(bookingService.week(addDays(bookingService.week()[6], 1)));
  const end = plan.months ? addMonths(d.start, plan.months) : addDays(d.start, 90);
  return (
    <Screen title={t('checkout.title')} footer={<Button testID="co-next" title={t('common.next')} onPress={() => router.push('/checkout/review')} />}>
      <Steps total={3} current={0} />
      <T v="captionStrong" color={colors.yellowDark}>{t('checkout.step1')}</T>
      <Card style={{ backgroundColor: colors.black }}>
        <Row justify="space-between"><T v="h2" color={colors.onDark}>{tr(plan.name)}</T><T v="h2" color={colors.yellow}>{money(plan.price)}</T></Row>
        <T v="caption" color={colors.onDarkMuted}>{t('checkout.ends', { d: f.date(end) })}</T>
      </Card>
      <T v="h3">{t('checkout.startDate')}</T>
      <HList data={dates} keyExtractor={(x) => x} renderItem={(x) => {
        const on = x === d.start;
        return (
          <Pressable testID={`co-date-${x}`} onPress={() => set({ start: x })} style={{ width: 62, height: 78, borderRadius: radius.lg, backgroundColor: on ? colors.black : colors.surface, alignItems: 'center', justifyContent: 'center', gap: 2, borderWidth: on ? 0 : 1, borderColor: colors.border }}>
            <T v="micro" color={on ? colors.onDarkMuted : colors.textMuted}>{f.dow(x)}</T>
            <T v="h2" color={on ? colors.yellow : colors.text}>{f.dayNum(x)}</T>
          </Pressable>
        );
      }} />
      <Col gap={2}><T v="h3">{t('checkout.addons')}</T><T v="caption" color={colors.textMuted}>{t('checkout.addonsSub')}</T></Col>
      {catalogService.addonsSync().map((a) => {
        const on = d.addons.includes(a.id);
        return (
          <Pressable testID={`addon-${a.id}`} key={a.id} onPress={() => set({ addons: on ? d.addons.filter((x) => x !== a.id) : [...d.addons, a.id] })}>
            <Row gap={12} style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, borderWidth: 1.5, borderColor: on ? colors.yellow : colors.border }}>
              <View style={{ width: 24, height: 24, borderRadius: 7, backgroundColor: on ? colors.black : colors.surface, borderWidth: 1.5, borderColor: on ? colors.black : colors.border, alignItems: 'center', justifyContent: 'center' }}>{on ? <Icon name="checkmark" size={15} color={colors.yellow} /> : null}</View>
              <T v="bodyStrong" style={{ flex: 1 }}>{tr(a.name)}</T>
              <T v="bodyStrong">{money(a.price)}{a.perMonth ? t('checkout.perMonthShort') : ''}</T>
            </Row>
          </Pressable>
        );
      })}
    </Screen>
  );
}
