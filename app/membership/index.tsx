import React, { useState } from 'react';
import { Switch, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Button, Ring, StatusBadge, TierBadge, ListRow, Divider, EmptyState, KV, Skeleton, useToast } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { useApp, TODAY } from '../../src/store/app';
import { catalogService } from '../../src/services/catalogService';
import { membershipService } from '../../src/services/membershipService';
import { daysBetween } from '../../src/services/api';
import { useAsync } from '../../src/utils/useAsync';
import { useFmt } from '../../src/utils/format';

/** M08 My membership */
export default function Membership() {
  const { t, tr, num } = useI18n();
  const f = useFmt();
  const toast = useToast();
  const m = useApp((s) => s.membership);
  const user = useApp((s) => s.user);
  const { loading } = useAsync(() => membershipService.getMembership(), []);
  const [busy, setBusy] = useState(false);
  if (loading) return <Screen title={t('membership.title')}><Skeleton h={220} r={24} /><Skeleton h={120} r={24} /></Screen>;
  if (!m || !user) return <Screen title={t('membership.title')}><EmptyState icon="card-outline" title={t('membership.none')} body={t('membership.noneBody')} action={t('home.joinCta')} onAction={() => router.push('/plans')} /></Screen>;
  const plan = catalogService.planSync(m.plan)!;
  const left = Math.max(0, daysBetween(TODAY, m.end));
  const total = Math.max(1, daysBetween(m.start, m.end));
  return (
    <Screen title={t('membership.title')}>
      <View style={{ borderRadius: radius.xl, overflow: 'hidden' }}>
        <LinearGradient colors={[colors.black, '#221C0D']} style={{ padding: 18, gap: 16 }}>
          <Row gap={14}>
            <Col style={{ flex: 1 }} gap={6}>
              <T v="h1" color={colors.onDark}>{tr(plan.name)}</T>
              <Row gap={6}><StatusBadge status={m.status} /><TierBadge tier={user.tier} small /></Row>
              <T v="caption" color={colors.onDarkMuted}>{m.id} · {tr(m.branch)}</T>
            </Col>
            <Ring size={104} stroke={10} value={left / total} track={colors.ink3}>
              <T v="h1" color={colors.onDark}>{num(left)}</T>
              <T v="micro" color={colors.onDarkMuted}>{t('membership.daysLeft')}</T>
            </Ring>
          </Row>
          <Row justify="space-between" style={{ backgroundColor: colors.ink3, borderRadius: radius.lg, padding: 12 }}>
            {[[t('membership.started'), f.short(m.start)], [t('membership.ends'), f.short(m.end)], [t('membership.visits'), num(m.visits)], [t('membership.freezeLeft'), num(m.freezeLeft)]].map(([k, v]) => (
              <Col key={k} style={{ alignItems: 'center', flex: 1 }}><T v="bodyStrong" color={colors.onDark}>{v}</T><T v="micro" color={colors.onDarkMuted} center>{k}</T></Col>
            ))}
          </Row>
        </LinearGradient>
      </View>
      {m.status === 'pending' ? <Row gap={8} style={{ backgroundColor: colors.warningSoft, borderRadius: radius.md, padding: 12 }}><Icon name="storefront-outline" color={colors.warning} /><T v="caption" style={{ flex: 1 }}>{t('membership.pendingNote')}</T></Row> : null}
      {m.status === 'frozen' && m.freeze ? <Row gap={8} style={{ backgroundColor: colors.infoSoft, borderRadius: radius.md, padding: 12 }}><Icon name="snow-outline" color={colors.info} /><T v="caption" style={{ flex: 1 }}>{t('membership.frozenNote', { d: f.date(m.freeze.from), n: m.freeze.days })}</T></Row> : null}
      <Row gap={10}>
        <Button testID="mb-renew" small full={false} style={{ flex: 1 }} title={t('membership.renew')} icon="refresh" onPress={() => router.push(`/plans/${m.plan}`)} />
        <Button testID="mb-upgrade" small full={false} style={{ flex: 1 }} variant="dark" title={t('membership.upgrade')} icon="arrow-up" onPress={() => router.push('/plans')} />
      </Row>
      {m.status === 'frozen' ? (
        <Button testID="mb-unfreeze" variant="outline" icon="play" title={t('membership.unfreeze')} loading={busy} onPress={async () => { setBusy(true); await membershipService.unfreeze(); setBusy(false); toast(t('membership.unfreezed')); }} />
      ) : m.status === 'active' && m.freezeLeft > 0 ? (
        <Button testID="mb-freeze" variant="outline" icon="snow-outline" title={t('membership.freeze')} onPress={() => router.push('/membership/freeze')} />
      ) : null}
      <Card>
        <Row gap={12}>
          <Col style={{ flex: 1 }}><T v="bodyStrong">{t('membership.autoRenew')}</T><T v="caption" color={colors.textMuted}>{t('membership.autoRenewSub')}</T></Col>
          <Switch testID="mb-autorenew" value={m.autoRenew} onValueChange={() => membershipService.toggleAutoRenew()} trackColor={{ true: colors.yellow, false: colors.border }} thumbColor="#fff" />
        </Row>
      </Card>
      <Card style={{ paddingVertical: 4 }}>
        <ListRow testID="mb-invoices" icon="receipt-outline" title={t('membership.invoices')} onPress={() => router.push('/membership/invoices')} />
        <Divider />
        <ListRow icon="qr-code-outline" title={t('profile.memberCard')} onPress={() => router.push('/member-card')} />
        <Divider />
        <ListRow icon="gift-outline" title={t('membership.tier')} subtitle={t(`tier.${user.tier}`)} onPress={() => router.push('/rewards')} />
      </Card>
      <Card><T v="h3" style={{ marginBottom: 6 }}>{t('plans.whatsIncluded')}</T>{plan.features.map((x, i) => <KV key={i} k={tr(x)} v="✓" />)}</Card>
    </Screen>
  );
}
