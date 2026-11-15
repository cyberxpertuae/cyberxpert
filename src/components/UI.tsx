import React, { useEffect, useRef } from 'react';
import { Animated, Easing, FlatList, Pressable, ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGrad, Path, Stop, Line, Circle as Dot } from 'react-native-svg';
import { Image, ImageSource } from 'expo-image';
import { colors, radius, shadow, spacing, tierColors } from '../theme';
import { useI18n } from '../i18n';
import { T } from './T';
import { Row, Col } from './Layout';
import { Icon, IconName } from './Icon';
import { Button } from './Button';

/* ---------- Card ---------- */
export function Card({ children, style, onPress, padded = true, testID }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; padded?: boolean; testID?: string }) {
  const s: StyleProp<ViewStyle> = [{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: padded ? spacing.md : 0, overflow: 'hidden' }, shadow.card, style];
  if (!onPress) return <View style={s}>{children}</View>;
  return (
    <Pressable testID={testID} onPress={onPress} style={({ pressed }) => [s, { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] }]}>
      {children}
    </Pressable>
  );
}

/* ---------- Img ---------- */
export function Img({ src, style, radius: r = 0, contentFit = 'cover' }: { src: ImageSource | number; style?: any; radius?: number; contentFit?: 'cover' | 'contain' }) {
  return <Image source={src} style={[{ borderRadius: r, backgroundColor: colors.surface2 }, style]} contentFit={contentFit} transition={200} />;
}

/* ---------- Chips ---------- */
export function Chip({ label, selected, onPress, icon, testID }: { label: string; selected?: boolean; onPress?: () => void; icon?: IconName; testID?: string }) {
  return (
    <Pressable testID={testID} onPress={onPress} style={{ paddingHorizontal: 16, height: 38, borderRadius: radius.pill, backgroundColor: selected ? colors.black : colors.surface, borderWidth: selected ? 0 : 1, borderColor: colors.border, justifyContent: 'center' }}>
      <Row gap={6}>
        {icon ? <Icon name={icon} size={15} color={selected ? colors.yellow : colors.textMuted} /> : null}
        <T v="captionStrong" size={13} color={selected ? colors.onDark : colors.text}>{label}</T>
      </Row>
    </Pressable>
  );
}

export function ChipRow<K extends string>({ items, value, onChange, style }: { items: { key: K; label: string; icon?: IconName }[]; value: K; onChange: (k: K) => void; style?: StyleProp<ViewStyle> }) {
  const { isRTL } = useI18n();
  return (
    <FlatList
      horizontal
      inverted={isRTL}
      data={items}
      keyExtractor={(i) => i.key}
      showsHorizontalScrollIndicator={false}
      style={[{ flexGrow: 0, marginHorizontal: -spacing.md }, style]}
      contentContainerStyle={{ paddingHorizontal: spacing.md, gap: 8 }}
      renderItem={({ item }) => <Chip testID={`chip-${item.key}`} label={item.label} icon={item.icon} selected={item.key === value} onPress={() => onChange(item.key)} />}
    />
  );
}

/* ---------- Horizontal list (RTL aware) ---------- */
export function HList<T>({ data, renderItem, gap = 12, keyExtractor }: { data: T[]; renderItem: (item: T, index: number) => React.ReactElement; gap?: number; keyExtractor: (item: T, i: number) => string }) {
  const { isRTL } = useI18n();
  return (
    <FlatList
      horizontal
      inverted={isRTL}
      data={data}
      keyExtractor={keyExtractor}
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -spacing.md, flexGrow: 0 }}
      contentContainerStyle={{ paddingHorizontal: spacing.md, gap }}
      renderItem={({ item, index }) => renderItem(item, index)}
    />
  );
}

/* ---------- Segmented tabs ---------- */
export function Segmented<K extends string>({ items, value, onChange, dark }: { items: { key: K; label: string; count?: number }[]; value: K; onChange: (k: K) => void; dark?: boolean }) {
  return (
    <Row gap={4} style={{ backgroundColor: dark ? colors.ink3 : colors.surface, borderRadius: radius.pill, padding: 4 }}>
      {items.map((i) => {
        const on = i.key === value;
        return (
          <Pressable testID={`tab-${i.key}`} key={i.key} onPress={() => onChange(i.key)} style={{ flex: 1, height: 38, borderRadius: radius.pill, backgroundColor: on ? colors.yellow : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
            <T v="captionStrong" size={13} numberOfLines={1} color={on ? colors.text : dark ? colors.onDarkMuted : colors.textMuted}>
              {i.label}{i.count != null ? ` (${i.count})` : ''}
            </T>
          </Pressable>
        );
      })}
    </Row>
  );
}

/* ---------- Badges ---------- */
const STATUS: Record<string, { bg: string; fg: string }> = {
  active: { bg: colors.successSoft, fg: colors.success },
  completed: { bg: colors.successSoft, fg: colors.success },
  delivered: { bg: colors.successSoft, fg: colors.success },
  confirmed: { bg: colors.successSoft, fg: colors.success },
  paid: { bg: colors.successSoft, fg: colors.success },
  allowed: { bg: colors.successSoft, fg: colors.success },
  pending: { bg: colors.warningSoft, fg: colors.warning },
  expiring: { bg: colors.warningSoft, fg: colors.warning },
  processing: { bg: colors.warningSoft, fg: colors.warning },
  upcoming: { bg: colors.infoSoft, fg: colors.info },
  frozen: { bg: colors.infoSoft, fg: colors.info },
  ready: { bg: colors.infoSoft, fg: colors.info },
  shipped: { bg: colors.infoSoft, fg: colors.info },
  expired: { bg: colors.dangerSoft, fg: colors.danger },
  denied: { bg: colors.dangerSoft, fg: colors.danger },
  cancelled: { bg: colors.surface2, fg: colors.textMuted },
  used: { bg: colors.surface2, fg: colors.textMuted },
  refunded: { bg: colors.surface2, fg: colors.textMuted },
};
export function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const c = STATUS[status] ?? STATUS.pending;
  return (
    <Row gap={6} style={{ backgroundColor: c.bg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.fg }} />
      <T v="micro" color={c.fg} weight="semibold">{t(`status.${status}`)}</T>
    </Row>
  );
}

export function TierBadge({ tier, small }: { tier: string; small?: boolean }) {
  const { t } = useI18n();
  const c = tierColors[tier] ?? colors.gold;
  return (
    <Row gap={5} style={{ backgroundColor: colors.black, borderWidth: 1.2, borderColor: c, paddingHorizontal: small ? 8 : 12, paddingVertical: small ? 2 : 4, borderRadius: radius.pill, alignSelf: 'flex-start' }}>
      <Icon name="star" size={small ? 11 : 13} color={c} />
      <T v="micro" size={small ? 10 : 11} weight="bold" color={c}>{t(`tier.${tier}`).toUpperCase()}</T>
    </Row>
  );
}

export function Pill({ label, bg = colors.yellow, fg = colors.text, icon }: { label: string; bg?: string; fg?: string; icon?: IconName }) {
  return (
    <Row gap={4} style={{ backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill, alignSelf: 'flex-start' }}>
      {icon ? <Icon name={icon} size={12} color={fg} /> : null}
      <T v="micro" weight="bold" color={fg}>{label}</T>
    </Row>
  );
}

/* ---------- Section header ---------- */
export function SectionHeader({ title, action, onAction, testID }: { title: string; action?: string; onAction?: () => void; testID?: string }) {
  return (
    <Row justify="space-between" style={{ marginTop: 4 }}>
      <T v="h3">{title}</T>
      {action ? (
        <Pressable testID={testID} onPress={onAction} hitSlop={10}>
          <Row gap={2}>
            <T v="captionStrong" color={colors.yellowDark}>{action}</T>
            <Icon name="chevron-forward" size={14} color={colors.yellowDark} />
          </Row>
        </Pressable>
      ) : null}
    </Row>
  );
}

/* ---------- List row ---------- */
export function ListRow({ icon, title, subtitle, onPress, right, danger, iconBg = colors.yellowSoft, iconColor = colors.text, chevron = true, testID }: { icon?: IconName; title: string; subtitle?: string; onPress?: () => void; right?: React.ReactNode; danger?: boolean; iconBg?: string; iconColor?: string; chevron?: boolean; testID?: string }) {
  return (
    <Pressable testID={testID} onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      <Row gap={12} style={{ paddingVertical: 12 }}>
        {icon ? (
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: danger ? colors.dangerSoft : iconBg, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={icon} size={20} color={danger ? colors.danger : iconColor} />
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          <T v="bodyStrong" color={danger ? colors.danger : colors.text}>{title}</T>
          {subtitle ? <T v="caption" color={colors.textMuted} numberOfLines={2}>{subtitle}</T> : null}
        </View>
        {right}
        {chevron && onPress ? <Icon name="chevron-forward" size={18} color={colors.textSubtle} /> : null}
      </Row>
    </Pressable>
  );
}

export const Divider = ({ style }: { style?: StyleProp<ViewStyle> }) => <View style={[{ height: 1, backgroundColor: colors.border }, style]} />;

/* ---------- Skeleton ---------- */
export function Skeleton({ h = 16, w = '100%', r = 10, style }: { h?: number; w?: number | `${number}%`; r?: number; style?: StyleProp<ViewStyle> }) {
  const a = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([Animated.timing(a, { toValue: 1, duration: 650, useNativeDriver: true }), Animated.timing(a, { toValue: 0.45, duration: 650, useNativeDriver: true })]));
    loop.start();
    return () => loop.stop();
  }, [a]);
  return <Animated.View style={[{ height: h, width: w, borderRadius: r, backgroundColor: '#E6E6E1', opacity: a }, style]} />;
}

export function SkeletonList({ rows = 5, card = 76 }: { rows?: number; card?: number }) {
  return (
    <Col gap={12} testID="skeleton">
      {Array.from({ length: rows }).map((_, i) => (
        <Row key={i} gap={12} style={{ backgroundColor: colors.surface, padding: 12, borderRadius: radius.xl }}>
          <Skeleton h={card - 24} w={card - 24} r={14} />
          <Col gap={8} style={{ flex: 1 }}>
            <Skeleton h={14} w="70%" />
            <Skeleton h={12} w="45%" />
          </Col>
        </Row>
      ))}
    </Col>
  );
}

/* ---------- Empty / Error ---------- */
export function EmptyState({ icon = 'file-tray-outline', title, body, action, onAction }: { icon?: IconName; title: string; body?: string; action?: string; onAction?: () => void }) {
  return (
    <Col gap={10} style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 }} testID="empty">
      <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: colors.yellowSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={38} color={colors.yellowDark} />
      </View>
      <T v="h3" center>{title}</T>
      {body ? <T v="body" center color={colors.textMuted}>{body}</T> : null}
      {action ? <Button title={action} onPress={onAction} full={false} small style={{ alignSelf: 'center', marginTop: 6 }} /> : null}
    </Col>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const { t } = useI18n();
  return <EmptyState icon="cloud-offline-outline" title={t('common.errorTitle')} body={t('common.errorBody')} action={t('common.retry')} onAction={onRetry} />;
}

/* ---------- Progress ---------- */
export function ProgressBar({ value, color = colors.yellow, track = colors.surface2, h = 8 }: { value: number; color?: string; track?: string; h?: number }) {
  const { isRTL } = useI18n();
  return (
    <View style={{ height: h, borderRadius: h, backgroundColor: track, overflow: 'hidden', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
      <View style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, backgroundColor: color, borderRadius: h }} />
    </View>
  );
}

export function Ring({ size = 120, stroke = 12, value, color = colors.yellow, track = colors.surface2, children }: { size?: number; stroke?: number; value: number; color?: string; track?: string; children?: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${c} ${c}`} strokeDashoffset={c * (1 - v)} />
      </Svg>
      {children}
    </View>
  );
}

/* ---------- Steps indicator ---------- */
export function Steps({ total, current }: { total: number; current: number }) {
  return (
    <Row gap={6}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: i <= current ? colors.yellow : colors.border }} />
      ))}
    </Row>
  );
}

/* ---------- Qty stepper ---------- */
export function QtyStepper({ value, onChange, min = 1, max = 99, small }: { value: number; onChange: (n: number) => void; min?: number; max?: number; small?: boolean }) {
  const s = small ? 30 : 38;
  return (
    <Row gap={small ? 8 : 12} style={{ backgroundColor: colors.surface2, borderRadius: radius.pill, padding: 4 }}>
      <Pressable testID="qty-minus" onPress={() => onChange(Math.max(min, value - 1))} style={{ width: s, height: s, borderRadius: s / 2, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="remove" size={16} />
      </Pressable>
      <T v="bodyStrong" style={{ minWidth: 20 }} center>{String(value)}</T>
      <Pressable testID="qty-plus" onPress={() => onChange(Math.min(max, value + 1))} style={{ width: s, height: s, borderRadius: s / 2, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="add" size={16} color={colors.yellow} />
      </Pressable>
    </Row>
  );
}

/* ---------- Line chart ---------- */
export function LineChart({ data, height = 160, color = colors.yellow, labels, unit = '' }: { data: number[]; height?: number; color?: string; labels?: string[]; unit?: string }) {
  const [w, setW] = React.useState(300);
  const { isRTL } = useI18n();
  if (!data.length) return null;
  const pad = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => {
    const xi = data.length === 1 ? 0.5 : i / (data.length - 1);
    const x = pad + (isRTL ? 1 - xi : xi) * (w - pad * 2);
    const y = 12 + (1 - (v - min) / span) * (height - 40);
    return [x, y];
  });
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = `${d} L ${pts[pts.length - 1][0]} ${height - 22} L ${pts[0][0]} ${height - 22} Z`;
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height }}>
      <Svg width={w} height={height}>
        <Defs>
          <SvgGrad id="g" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.35" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </SvgGrad>
        </Defs>
        {[0, 0.5, 1].map((f) => (
          <Line key={f} x1={pad} x2={w - pad} y1={12 + f * (height - 40)} y2={12 + f * (height - 40)} stroke={colors.border} strokeDasharray="4 4" />
        ))}
        <Path d={area} fill="url(#g)" />
        <Path d={d} stroke={color} strokeWidth={3} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <Dot key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 6 : 4} fill="#fff" stroke={color} strokeWidth={3} />
        ))}
      </Svg>
      {labels ? (
        <Row justify="space-between" style={{ position: 'absolute', bottom: 0, left: pad - 12, right: pad - 12 }}>
          {labels.map((l, i) => (
            <T key={i} v="micro" color={colors.textSubtle}>{l}</T>
          ))}
        </Row>
      ) : null}
      <View style={{ position: 'absolute', top: 0, [isRTL ? 'left' : 'right']: 0 }}>
        <T v="micro" color={colors.textSubtle}>{`${max}${unit}`}</T>
      </View>
    </View>
  );
}

/* ---------- Bars ---------- */
export function Bars({ data, labels, height = 120, color = colors.yellow, highlight }: { data: number[]; labels: string[]; height?: number; color?: string; highlight?: number }) {
  const max = Math.max(...data, 1);
  return (
    <Row align="flex-end" justify="space-between" style={{ height }}>
      {data.map((v, i) => (
        <Col key={i} gap={6} style={{ alignItems: 'center', flex: 1 }}>
          <View style={{ width: 18, height: Math.max(6, (v / max) * (height - 26)), borderRadius: 9, backgroundColor: i === highlight ? colors.black : color }} />
          <T v="micro" color={colors.textSubtle}>{labels[i]}</T>
        </Col>
      ))}
    </Row>
  );
}

/* ---------- Success burst ---------- */
export function SuccessBurst({ icon = 'checkmark', color = colors.yellow, size = 120 }: { icon?: IconName; color?: string; size?: number }) {
  const scale = useRef(new Animated.Value(0.3)).current;
  const ring = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
      Animated.loop(Animated.timing(ring, { toValue: 1, duration: 1600, easing: Easing.out(Easing.ease), useNativeDriver: true })),
    ]).start();
  }, [scale, ring]);
  return (
    <View style={{ width: size * 1.8, height: size * 1.8, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }} testID="success">
      <Animated.View style={{ position: 'absolute', width: size, height: size, borderRadius: size, backgroundColor: color, opacity: ring.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }), transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }] }} />
      <Animated.View style={{ width: size, height: size, borderRadius: size, backgroundColor: color, alignItems: 'center', justifyContent: 'center', transform: [{ scale }] }}>
        <Icon name={icon} size={size * 0.5} color={colors.black} />
      </Animated.View>
    </View>
  );
}

/* ---------- Key/value row ---------- */
export function KV({ k, v, strong, color, labelColor }: { k: string; v: string; strong?: boolean; color?: string; labelColor?: string }) {
  return (
    <Row justify="space-between" gap={12} style={{ paddingVertical: 5 }}>
      <T v={strong ? 'bodyStrong' : 'body'} color={labelColor ?? (strong ? colors.text : colors.textMuted)} style={{ flexShrink: 1 }}>{k}</T>
      <T v={strong ? 'h3' : 'bodyStrong'} color={color ?? colors.text}>{v}</T>
    </Row>
  );
}

/* ---------- Stat tile ---------- */
export function Stat({ icon, value, label, dark, color = colors.yellowDark }: { icon: IconName; value: string; label: string; dark?: boolean; color?: string }) {
  return (
    <Col gap={4} style={{ flex: 1, backgroundColor: dark ? colors.ink3 : colors.surface, borderRadius: radius.lg, padding: 12 }}>
      <Icon name={icon} size={18} color={color} />
      <T v="h3" color={dark ? colors.onDark : colors.text} numberOfLines={1}>{value}</T>
      <T v="micro" color={dark ? colors.onDarkMuted : colors.textMuted} numberOfLines={1}>{label}</T>
    </Col>
  );
}

export function ScrollX({ children }: { children: React.ReactNode }) {
  const { isRTL } = useI18n();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -spacing.md, flexGrow: 0, transform: isRTL ? [{ scaleX: -1 }] : undefined }} contentContainerStyle={{ paddingHorizontal: spacing.md, gap: 10 }}>
      {React.Children.map(children, (c) => (isRTL ? <View style={{ transform: [{ scaleX: -1 }] }}>{c}</View> : c))}
    </ScrollView>
  );
}
