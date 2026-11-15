import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, IconButton, Card, Img, TierBadge, SectionHeader, HList, Ring, Button, Pill, Skeleton, IconName, StatusBadge, Wrap } from '../../src/components';
import { colors, radius, shadow, spacing } from '../../src/theme';
import { useApp, TODAY } from '../../src/store/app';
import { images } from '../../src/data/images';
import { catalogService } from '../../src/services/catalogService';
import { trainingService } from '../../src/services/trainingService';
import { nutritionService } from '../../src/services/nutritionService';
import { offersService } from '../../src/services/offersService';
import { bookingService } from '../../src/services/bookingService';
import { shopService } from '../../src/services/shopService';
import { daysBetween } from '../../src/services/api';
import { useAsync } from '../../src/utils/useAsync';
import { useFmt } from '../../src/utils/format';
import { requireAuth } from '../../src/utils/guard';

/** H01 Home */
export default function Home() {
  const { t, tr, num, money } = useI18n();
  const f = useFmt();
  const user = useApp((s) => s.user);
  const guest = useApp((s) => s.guest);
  const membership = useApp((s) => s.membership);
  const unread = useApp((s) => s.notifications.filter((n) => !n.read).length);
  const cartCount = useApp((s) => s.cart.reduce((a, c) => a + c.qty, 0));
  useApp((s) => s.diary);
  useApp((s) => s.history);
  const [tick, setTick] = useState(0);
  const classes = useAsync(() => bookingService.getClasses(TODAY), [tick]);
  const products = useAsync(() => shopService.getProducts({ sort: 'popular' }), [tick]);
  const offers = offersService.sync();
  const today = trainingService.todayWorkout();
  const nut = nutritionService.dayTotals();
  const plan = membership ? catalogService.planSync(membership.plan) : null;
  const left = membership ? Math.max(0, daysBetween(TODAY, membership.end)) : 0;
  const total = membership ? Math.max(1, daysBetween(membership.start, membership.end)) : 1;

  const quick: { icon: IconName; label: string; to: string }[] = [
    { icon: 'card-outline', label: t('home.q_plans'), to: '/plans' },
    { icon: 'bag-handle-outline', label: t('home.q_shop'), to: '/shop' },
    { icon: 'sparkles-outline', label: t('home.q_services'), to: '/services' },
    { icon: 'calendar-outline', label: t('home.q_classes'), to: '/classes' },
    { icon: 'construct-outline', label: t('home.q_machines'), to: '/machines' },
    { icon: 'gift-outline', label: t('home.q_rewards'), to: '/rewards' },
    { icon: 'pricetags-outline', label: t('home.q_offers'), to: '/offers' },
    { icon: 'trending-up-outline', label: t('home.q_progress'), to: '/progress' },
  ];

  return (
    <Screen refreshing={classes.refreshing} onRefresh={() => setTick(tick + 1)} contentStyle={{ paddingBottom: 110 }}>
      {/* Header */}
      <Row gap={12}>
        <Pressable onPress={() => router.push('/(tabs)/profile')}>
          <Img src={user ? images[user.avatar] : images.icon} style={{ width: 48, height: 48 }} radius={24} />
        </Pressable>
        <Col style={{ flex: 1 }} gap={2}>
          <T v="h2" numberOfLines={1}>{user ? t('home.hi', { name: tr(user.firstName) }) : t('home.hiGuest')}</T>
          {user ? <TierBadge tier={user.tier} small /> : <T v="caption" color={colors.textMuted}>{t('home.ready')}</T>}
        </Col>
        <IconButton testID="home-cart" name="bag-handle-outline" badge={cartCount} onPress={() => router.push('/shop/cart')} />
        <IconButton testID="home-notif" name="notifications-outline" badge={user ? unread : 0} onPress={() => requireAuth(() => router.push('/notifications'))} />
      </Row>

      <Pressable testID="home-search" onPress={() => router.push('/search')}>
        <Row gap={10} style={{ backgroundColor: colors.surface, borderRadius: radius.lg, height: 50, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border }}>
          <Icon name="search-outline" size={20} color={colors.textMuted} />
          <T v="body" color={colors.textSubtle} style={{ flex: 1 }} numberOfLines={1}>{t('home.searchPh')}</T>
          <Icon name="options-outline" size={20} color={colors.textMuted} />
        </Row>
      </Pressable>

      {guest && !user ? (
        <Row gap={10} style={{ backgroundColor: colors.yellowSoft, borderRadius: radius.lg, padding: 12 }}>
          <Icon name="person-circle-outline" size={22} color={colors.yellowDark} />
          <T v="bodyStrong" style={{ flex: 1 }}>{t('guest.banner')}</T>
          <Button small full={false} title={t('guest.bannerCta')} variant="dark" onPress={() => router.push('/auth/register')} />
        </Row>
      ) : null}

      {/* Membership */}
      {membership && user ? (
        <Pressable testID="home-membership" onPress={() => router.push('/membership')}>
          <View style={[{ borderRadius: radius.xl, overflow: 'hidden' }, shadow.raised]}>
            <LinearGradient colors={[colors.black, '#1D1A12']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 18 }}>
              <View style={{ position: 'absolute', right: -50, top: -50, width: 190, height: 190, borderRadius: 95, borderWidth: 14, borderColor: 'rgba(212,162,43,0.25)' }} />
              <Row gap={14}>
                <Col style={{ flex: 1 }} gap={4}>
                  <T v="micro" color={colors.gold}>{t('home.memberCard').toUpperCase()}</T>
                  <T v="h1" color={colors.onDark}>{tr(plan?.name)}</T>
                  <StatusBadge status={membership.status} />
                  <T v="caption" color={colors.onDarkMuted} style={{ marginTop: 4 }}>
                    {membership.status === 'pending' ? t('home.pendingPay') : membership.status === 'frozen' ? t('home.frozenUntil', { d: f.short(membership.end) }) : t('home.validUntil', { d: f.date(membership.end) })}
                  </T>
                </Col>
                <Ring size={92} stroke={9} value={left / total} track={colors.ink3} color={colors.yellow}>
                  <T v="h2" color={colors.onDark}>{num(left)}</T>
                  <T v="micro" color={colors.onDarkMuted}>{t('common.days')}</T>
                </Ring>
              </Row>
              <Row gap={10} style={{ marginTop: 14 }}>
                <Button testID="home-checkin" small full={false} style={{ flex: 1 }} icon="qr-code" title={t('home.showQr')} onPress={() => router.push('/member-card')} />
                <Row gap={6} style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.ink3, borderRadius: radius.md, height: 40 }}>
                  <Icon name="flame" size={16} color={colors.yellow} />
                  <T v="captionStrong" color={colors.onDark}>{t('home.streak', { n: user.streak })}</T>
                </Row>
              </Row>
            </LinearGradient>
          </View>
        </Pressable>
      ) : (
        <Pressable testID="home-join" onPress={() => router.push('/plans')}>
          <View style={[{ borderRadius: radius.xl, overflow: 'hidden', height: 168 }, shadow.raised]}>
            <Img src={images['hero-gym']} style={{ position: 'absolute', width: '100%', height: '100%' }} />
            <LinearGradient colors={['rgba(11,11,12,0.92)', 'rgba(11,11,12,0.35)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, padding: 18, justifyContent: 'center', gap: 6 }}>
              <T v="h1" color={colors.onDark} style={{ maxWidth: 230 }}>{t('home.joinTitle')}</T>
              <T v="caption" color={colors.onDarkMuted} style={{ maxWidth: 230 }}>{t('home.joinBody')}</T>
              <Button small full={false} title={t('home.joinCta')} iconEnd="arrow-forward" onPress={() => router.push('/plans')} />
            </LinearGradient>
          </View>
        </Pressable>
      )}

      {/* Quick actions */}
      <Wrap style={{ rowGap: 14, backgroundColor: colors.surface, borderRadius: radius.xl, paddingVertical: 16 }}>
        {quick.map((q) => (
          <Pressable testID={`quick-${q.to.slice(1)}`} key={q.to} onPress={() => router.push(q.to as any)} style={{ width: '25%', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: colors.yellowSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={q.icon} size={23} color={colors.black} />
            </View>
            <T v="micro" center numberOfLines={1}>{q.label}</T>
          </Pressable>
        ))}
      </Wrap>

      {/* Today's workout + calories */}
      <Row gap={12} align="stretch">
        <Card testID="home-workout" style={{ flex: 1.25, padding: 0 }} onPress={() => router.push(`/training/workout/${today.program.id}?day=${today.day.id}`)}>
          <Img src={images[today.program.img]} style={{ height: 92, width: '100%' }} />
          <Col gap={2} style={{ padding: 12 }}>
            <T v="micro" color={colors.yellowDark}>{t('home.today').toUpperCase()}</T>
            <T v="bodyStrong" numberOfLines={1}>{tr(today.day.name)}</T>
            <T v="caption" color={colors.textMuted}>{t('home.exercises', { n: today.day.ex.length })} · {t('common.week', { n: today.week })}</T>
          </Col>
        </Card>
        <Card testID="home-calories" style={{ flex: 1, alignItems: 'center', gap: 6 }} onPress={() => router.push('/(tabs)/nutrition')}>
          <T v="micro" color={colors.textMuted}>{t('home.calories').toUpperCase()}</T>
          <Ring size={92} stroke={9} value={nut.eaten / nut.goal}>
            <T v="h3">{num(Math.max(0, nut.left))}</T>
            <T v="micro" color={colors.textMuted}>{t('home.left')}</T>
          </Ring>
          <Row gap={8}>
            <T v="micro" color={colors.textMuted}>🍽 {num(nut.eaten)}</T>
            <T v="micro" color={colors.textMuted}>🔥 {num(nut.burned)}</T>
          </Row>
        </Card>
      </Row>

      {/* Offers */}
      <SectionHeader title={t('home.offers')} action={t('common.seeAll')} onAction={() => router.push('/offers')} testID="home-offers-all" />
      <HList
        data={offers}
        keyExtractor={(o) => o.id}
        renderItem={(o) => (
          <Pressable testID={`offer-${o.id}`} onPress={() => router.push(`/offers/${o.id}`)} style={{ width: 280, height: 150, borderRadius: radius.xl, overflow: 'hidden' }}>
            <Img src={images[o.img]} style={{ position: 'absolute', width: '100%', height: '100%' }} />
            <LinearGradient colors={['rgba(11,11,12,0.9)', 'rgba(11,11,12,0.2)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, padding: 14, justifyContent: 'flex-end', gap: 4 }}>
              <Pill label={tr(o.badge)} />
              <T v="bodyStrong" color={colors.onDark} numberOfLines={2} style={{ maxWidth: 210 }}>{tr(o.title)}</T>
              <T v="micro" color={colors.gold}>{t('offers.ends', { d: f.short(o.until) })}</T>
            </LinearGradient>
          </Pressable>
        )}
      />

      {/* Classes today */}
      <SectionHeader title={t('home.classesToday')} action={t('common.seeAll')} onAction={() => router.push('/classes')} />
      {classes.loading ? (
        <Row gap={10}><Skeleton h={120} w={150} r={20} /><Skeleton h={120} w={150} r={20} /></Row>
      ) : (
        <HList
          data={classes.data ?? []}
          keyExtractor={(c) => c.id}
          renderItem={(c) => (
            <Card testID={`class-${c.id}`} padded={false} style={{ width: 160 }} onPress={() => router.push(`/classes/${c.id}`)}>
              <Img src={images[c.type.img]} style={{ height: 84, width: '100%' }} />
              <Col gap={2} style={{ padding: 10 }}>
                <T v="captionStrong" numberOfLines={1}>{tr(c.type.name)}</T>
                <T v="micro" color={colors.textMuted}>{f.time(c.time)} · {tr(c.coach.name).split(' ')[0]}</T>
                <T v="micro" color={c.spotsLeft ? colors.success : colors.danger}>{c.spotsLeft ? t('home.spots', { n: c.spotsLeft }) : t('home.full')}</T>
              </Col>
            </Card>
          )}
        />
      )}

      {/* Shop picks */}
      <SectionHeader title={t('home.shopPicks')} action={t('common.seeAll')} onAction={() => router.push('/shop')} />
      {products.loading ? (
        <Row gap={10}><Skeleton h={190} w={150} r={20} /><Skeleton h={190} w={150} r={20} /></Row>
      ) : (
        <HList
          data={(products.data ?? []).slice(0, 8)}
          keyExtractor={(p) => p.id}
          renderItem={(p) => (
            <Card testID={`product-${p.id}`} padded={false} style={{ width: 150 }} onPress={() => router.push(`/shop/${p.id}`)}>
              <Img src={images[p.img]} style={{ height: 120, width: '100%' }} />
              <Col gap={2} style={{ padding: 10 }}>
                <T v="captionStrong" numberOfLines={2} style={{ minHeight: 38 }}>{tr(p.name)}</T>
                <T v="bodyStrong" color={colors.text}>{money(p.price)}</T>
              </Col>
            </Card>
          )}
        />
      )}
      <View style={{ height: spacing.md }} />
    </Screen>
  );
}
