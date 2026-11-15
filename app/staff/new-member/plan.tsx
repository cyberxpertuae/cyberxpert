import React from 'react';
import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../../src/i18n';
import { Screen, T, Row, Col, Icon, Button, Steps, TierBadge, DateStrip } from '../../../src/components';
import { colors, radius } from '../../../src/theme';
import { useStaffDraft } from '../../../src/store/staffDraft';
import { useApp } from '../../../src/store/app';
import catalog from '../../../src/data/mock/catalog.json';
import { bookingService } from '../../../src/services/bookingService';

/** R04 Walk-in: choose plan (2/3) — also used for renewals */
export default function ChoosePlan() {
  const { t, tr, money } = useI18n();
  const d = useStaffDraft();
  const renewing = d.renewId ? useApp.getState().members.find((m) => m.id === d.renewId) : null;
  return (
    <Screen title={renewing ? t('staff.renewTitle') : t('staff.a_new')} header={{ subtitle: renewing ? tr(renewing.name) : d.name }} footer={<Button testID="nm-next" title={t('common.next')} onPress={() => router.push('/staff/new-member/payment')} />}>
      <Steps total={3} current={1} />
      <T v="captionStrong" color={colors.yellowDark}>{t('staff.nmPlan')}</T>
      {catalog.plans.filter((p) => p.type !== 'online').map((p) => {
        const on = d.planId === p.id;
        return (
          <Pressable testID={`nm-plan-${p.id}`} key={p.id} onPress={() => d.set({ planId: p.id })}>
            <Row gap={12} style={{ backgroundColor: on ? colors.black : colors.surface, borderRadius: radius.lg, padding: 14, borderWidth: 1.5, borderColor: on ? colors.yellow : colors.border }}>
              <Icon name={on ? 'radio-button-on' : 'radio-button-off'} color={on ? colors.yellow : colors.textSubtle} />
              <Col style={{ flex: 1 }} gap={4}><T v="bodyStrong" color={on ? colors.onDark : colors.text}>{tr(p.name)}</T><TierBadge tier={p.tier} small /></Col>
              <T v="h3" color={on ? colors.yellow : colors.text}>{money(p.price)}</T>
            </Row>
          </Pressable>
        );
      })}
      {!renewing ? <><T v="h3">{t('checkout.startDate')}</T><DateStrip dates={bookingService.week()} value={d.start} onChange={(x) => d.set({ start: x })} /></> : null}
    </Screen>
  );
}
