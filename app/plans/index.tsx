import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Segmented, Pill, TierBadge, SkeletonList, ErrorState, Button } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { catalogService } from '../../src/services/catalogService';
import { useAsync } from '../../src/utils/useAsync';

/** M01 Plans */
export default function Plans() {
  const { t, tr, money } = useI18n();
  const [type, setType] = useState<'gym' | 'online' | 'pass'>('gym');
  const membership = useApp((s) => s.membership);
  const { data, loading, error, reload, refreshing, refresh } = useAsync(() => catalogService.getPlans(type), [type]);
  return (
    <Screen title={t('plans.title')} refreshing={refreshing} onRefresh={refresh}>
      <Segmented items={[{ key: 'gym', label: t('plans.gym') }, { key: 'online', label: t('plans.online') }, { key: 'pass', label: t('plans.pass') }]} value={type} onChange={setType} />
      <Row gap={8} style={{ backgroundColor: colors.yellowSoft, borderRadius: radius.md, padding: 10 }}>
        <Icon name="storefront-outline" size={18} color={colors.yellowDark} />
        <T v="caption" style={{ flex: 1 }}>{t('plans.walkin')}</T>
      </Row>
      {loading ? <SkeletonList rows={4} card={110} /> : error ? <ErrorState onRetry={reload} /> : (data ?? []).map((p) => {
        const current = membership?.plan === p.id;
        return (
          <Card key={p.id} testID={`plan-${p.id}`} onPress={() => router.push(`/plans/${p.id}`)} style={{ borderWidth: p.popular ? 2 : 0, borderColor: colors.yellow }}>
            <Row justify="space-between" align="flex-start">
              <Col gap={6} style={{ flex: 1 }}>
                <Row gap={6} wrap>
                  {p.popular ? <Pill label={t('common.popular')} icon="flame" /> : null}
                  {current ? <Pill label={t('plans.current')} bg={colors.successSoft} fg={colors.success} /> : null}
                </Row>
                <T v="h2">{tr(p.name)}</T>
                <TierBadge tier={p.tier} small />
              </Col>
              <Col style={{ alignItems: 'flex-end' }}>
                {p.old ? <T v="caption" color={colors.textSubtle} style={{ textDecorationLine: 'line-through' }}>{money(p.old)}</T> : null}
                <T v="h1">{money(p.price)}</T>
                <T v="micro" color={colors.textMuted}>{p.months ? t('plans.perMonths', { n: p.months }) : t('plans.perOnce')}</T>
                {p.old ? <Pill label={t('plans.save', { n: Math.round((1 - p.price / p.old) * 100) })} bg={colors.successSoft} fg={colors.success} /> : null}
              </Col>
            </Row>
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 12 }} />
            <Col gap={6}>
              {p.features.slice(0, 3).map((f, i) => (
                <Row key={i} gap={8}><Icon name="checkmark-circle" size={18} color={colors.success} /><T v="caption" style={{ flex: 1 }}>{tr(f)}</T></Row>
              ))}
            </Col>
            <Button small title={t('plans.subscribe')} variant={p.popular ? 'primary' : 'dark'} style={{ marginTop: 12 }} onPress={() => router.push(`/plans/${p.id}`)} />
          </Card>
        );
      })}
    </Screen>
  );
}
