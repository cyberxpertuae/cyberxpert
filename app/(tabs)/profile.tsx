import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, TierBadge, ListRow, Divider, Dialog, Button, Stat, IconButton, ProgressBar } from '../../src/components';
import { colors, radius, shadow } from '../../src/theme';
import { useApp, TODAY } from '../../src/store/app';
import { images } from '../../src/data/images';
import { authService } from '../../src/services/authService';
import { rewardsService } from '../../src/services/rewardsService';
import { addDays } from '../../src/services/api';
import { useFmt } from '../../src/utils/format';

/** P01 Profile — the member's big profile */
export default function Profile() {
  const { t, tr, num, lang, setLang } = useI18n();
  const f = useFmt();
  const user = useApp((s) => s.user);
  const history = useApp((s) => s.history);
  const cartCount = useApp((s) => s.cart.length);
  useApp((s) => s.points);
  const [logout, setLogout] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <Screen contentStyle={{ paddingBottom: 110 }}>
        <T v="display">{t('profile.title')}</T>
        <Card style={{ alignItems: 'center', gap: 10, paddingVertical: 28 }}>
          <Img src={images.icon} style={{ width: 84, height: 84 }} radius={42} />
          <T v="h2">{t('profile.guestTitle')}</T>
          <T v="body" center color={colors.textMuted}>{t('profile.guestBody')}</T>
          <Button testID="pf-register" title={t('guest.create')} onPress={() => router.push('/auth/register')} />
          <Button testID="pf-login" title={t('auth.login')} variant="outline" onPress={() => router.push('/auth/login')} />
        </Card>
        <Card>
          <ListRow icon="globe-outline" title={t('common.language')} right={<T v="captionStrong" color={colors.textMuted}>{lang === 'ar' ? 'العربية' : 'English'}</T>} onPress={() => setLang(lang === 'ar' ? 'en' : 'ar')} />
          <Divider />
          <ListRow icon="information-circle-outline" title={t('profile.about')} onPress={() => router.push('/info/about')} />
          <Divider />
          <ListRow icon="help-circle-outline" title={t('profile.help')} onPress={() => router.push('/info/faq')} />
          <Divider />
          <ListRow icon="call-outline" title={t('profile.contact')} onPress={() => router.push('/info/contact')} />
        </Card>
      </Screen>
    );
  }

  const r = rewardsService.summary();
  const weekKcal = history.filter((h) => h.date >= addDays(TODAY, -6)).reduce((a, h) => a + h.kcal, 0);
  const bmi = user.weight / Math.pow(user.height / 100, 2);
  const section = (title: string, rows: React.ReactNode[]) => (
    <Col gap={6}>
      <T v="captionStrong" color={colors.textMuted} style={{ marginStart: 4 }}>{title.toUpperCase()}</T>
      <Card style={{ paddingVertical: 4 }}>
        {rows.map((x, i) => (
          <View key={i}>{i ? <Divider /> : null}{x}</View>
        ))}
      </Card>
    </Col>
  );
  return (
    <Screen contentStyle={{ paddingBottom: 110 }}>
      <Row justify="space-between">
        <T v="display">{t('profile.title')}</T>
        <IconButton testID="pf-settings" name="settings-outline" onPress={() => router.push('/settings')} />
      </Row>
      <View style={[{ borderRadius: radius.xl, overflow: 'hidden' }, shadow.raised]}>
        <LinearGradient colors={[colors.black, '#1E1A10']} style={{ padding: 18, gap: 14 }}>
          <Row gap={14}>
            <View>
              <Img src={images[user.avatar]} style={{ width: 76, height: 76, borderWidth: 2, borderColor: colors.gold }} radius={38} />
              <Pressable testID="pf-edit" onPress={() => router.push('/profile/edit')} style={{ position: 'absolute', bottom: -2, end: -2, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="pencil" size={14} color={colors.black} />
              </Pressable>
            </View>
            <Col style={{ flex: 1 }} gap={4}>
              <T v="h1" color={colors.onDark} numberOfLines={1}>{tr(user.fullName)}</T>
              <T v="caption" color={colors.onDarkMuted}>{user.id} · {t('profile.memberSince', { d: f.short(user.joined) })}</T>
              <TierBadge tier={user.tier} />
            </Col>
          </Row>
          <Pressable testID="pf-rewards" onPress={() => router.push('/rewards')}>
            <Col gap={6}>
              <Row justify="space-between">
                <T v="captionStrong" color={colors.onDark}>{num(r.points)} {t('common.pts')}</T>
                <T v="micro" color={colors.gold}>{r.next ? t('rewards.toNext', { p: num(r.toNext), tier: t(`tier.${r.next.id}`) }) : t('rewards.maxTier')}</T>
              </Row>
              <ProgressBar value={r.progress} track={colors.ink3} color={colors.gold} />
            </Col>
          </Pressable>
        </LinearGradient>
      </View>
      <Row gap={10}>
        <Stat icon="barbell-outline" value={num(user.workouts)} label={t('profile.workouts')} />
        <Stat icon="flame-outline" value={num(user.streak)} label={t('profile.streak')} />
        <Stat icon="pulse-outline" value={num(weekKcal)} label={t('profile.kcalWeek')} />
      </Row>
      <Card testID="pf-body" onPress={() => router.push('/progress/body')}>
        <Row justify="space-between" style={{ marginBottom: 10 }}>
          <T v="h3">{t('profile.body')}</T>
          <Icon name="chevron-forward" size={18} color={colors.textSubtle} />
        </Row>
        <Row justify="space-between">
          {[[t('profile.height'), `${user.height} ${t('common.cm')}`], [t('profile.weight'), `${user.weight} ${t('common.kg')}`], [t('profile.target'), `${user.target} ${t('common.kg')}`], [t('profile.bmi'), bmi.toFixed(1)]].map(([k, v]) => (
            <Col key={k} style={{ alignItems: 'center', flex: 1 }}>
              <T v="bodyStrong">{v}</T>
              <T v="micro" color={colors.textMuted}>{k}</T>
            </Col>
          ))}
        </Row>
      </Card>
      {section(t('profile.sMembership'), [
        <ListRow key="m" testID="pf-membership" icon="card-outline" title={t('profile.myMembership')} onPress={() => router.push('/membership')} />,
        <ListRow key="c" testID="pf-card" icon="qr-code-outline" title={t('profile.memberCard')} onPress={() => router.push('/member-card')} />,
        <ListRow key="r" icon="gift-outline" title={t('profile.rewards')} onPress={() => router.push('/rewards')} />,
        <ListRow key="v" icon="ticket-outline" title={t('profile.vouchers')} onPress={() => router.push('/rewards/vouchers')} />,
      ])}
      {section(t('profile.sActivity'), [
        <ListRow key="b" testID="pf-bookings" icon="calendar-outline" title={t('profile.bookings')} onPress={() => router.push('/bookings')} />,
        <ListRow key="p" icon="trending-up-outline" title={t('profile.progress')} onPress={() => router.push('/progress')} />,
        <ListRow key="n" icon="restaurant-outline" title={t('profile.nutrition')} onPress={() => router.push('/(tabs)/nutrition')} />,
        <ListRow key="ch" testID="pf-chat" icon="chatbubbles-outline" title={t('profile.coachChat')} onPress={() => router.push('/coach-chat')} />,
      ])}
      {section(t('profile.sShop'), [
        <ListRow key="o" testID="pf-orders" icon="receipt-outline" title={t('profile.orders')} onPress={() => router.push('/shop/orders')} />,
        <ListRow key="cart" icon="bag-handle-outline" title={t('shop.cart')} right={cartCount ? <T v="captionStrong" color={colors.yellowDark}>{cartCount}</T> : null} onPress={() => router.push('/shop/cart')} />,
        <ListRow key="f" icon="heart-outline" title={t('profile.favorites')} onPress={() => router.push('/shop/favorites')} />,
        <ListRow key="a" icon="location-outline" title={t('profile.addresses')} onPress={() => router.push('/shop/addresses')} />,
        <ListRow key="pm" testID="pf-payments" icon="wallet-outline" title={t('profile.payments')} onPress={() => router.push('/profile/payment-methods')} />,
      ])}
      {section(t('profile.sAccount'), [
        <ListRow key="e" icon="person-outline" title={t('profile.editProfile')} onPress={() => router.push('/profile/edit')} />,
        <ListRow key="g" testID="pf-fitness" icon="fitness-outline" title={t('profile.fitness')} onPress={() => router.push('/profile/fitness')} />,
        <ListRow key="s" icon="settings-outline" title={t('profile.settings')} onPress={() => router.push('/settings')} />,
        <ListRow key="l" icon="globe-outline" title={t('common.language')} right={<T v="captionStrong" color={colors.textMuted}>{lang === 'ar' ? 'العربية' : 'English'}</T>} onPress={() => setLang(lang === 'ar' ? 'en' : 'ar')} />,
      ])}
      {section(t('profile.sSupport'), [
        <ListRow key="h" icon="help-circle-outline" title={t('profile.help')} onPress={() => router.push('/info/faq')} />,
        <ListRow key="c" icon="call-outline" title={t('profile.contact')} onPress={() => router.push('/info/contact')} />,
        <ListRow key="a" icon="information-circle-outline" title={t('profile.about')} onPress={() => router.push('/info/about')} />,
        <ListRow key="t" icon="document-text-outline" title={t('profile.terms')} onPress={() => router.push('/info/terms')} />,
        <ListRow key="p" icon="shield-checkmark-outline" title={t('profile.privacy')} onPress={() => router.push('/info/privacy')} />,
      ])}
      <Card style={{ paddingVertical: 4 }}>
        <ListRow testID="pf-logout" icon="log-out-outline" title={t('profile.logout')} danger chevron={false} onPress={() => setLogout(true)} />
      </Card>
      <T v="micro" center color={colors.textSubtle}>{t('profile.version')}</T>
      <Dialog visible={logout} onClose={() => setLogout(false)} icon="log-out-outline" title={t('profile.logoutQ')} body={t('profile.logoutBody')} confirm={t('profile.logout')} cancel={t('common.cancel')} danger loading={busy}
        onConfirm={async () => { setBusy(true); await authService.logout(); setBusy(false); setLogout(false); router.replace('/welcome'); }} />
    </Screen>
  );
}
