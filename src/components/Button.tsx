import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, View, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, shadow } from '../theme';
import { T } from './T';
import { Row } from './Layout';
import { Icon, IconName } from './Icon';

type Variant = 'primary' | 'dark' | 'outline' | 'ghost' | 'danger' | 'soft';
const V: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.yellow, fg: colors.text },
  dark: { bg: colors.black, fg: colors.onDark },
  outline: { bg: colors.surface, fg: colors.text, border: colors.border },
  ghost: { bg: 'transparent', fg: colors.text },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  soft: { bg: colors.yellowSoft, fg: colors.text },
};

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: IconName;
  iconEnd?: IconName;
  loading?: boolean;
  disabled?: boolean;
  small?: boolean;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Button({ title, onPress, variant = 'primary', icon, iconEnd, loading, disabled, small, full = true, style, testID }: Props) {
  const c = V[variant];
  const off = disabled || loading;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      disabled={off}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress?.();
      }}
      style={({ pressed }) => [
        {
          height: small ? 40 : 54,
          paddingHorizontal: small ? 16 : 20,
          borderRadius: small ? radius.md : radius.lg,
          backgroundColor: disabled ? colors.surface2 : c.bg,
          borderWidth: c.border ? 1.5 : 0,
          borderColor: c.border,
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: full ? 'stretch' : 'flex-start',
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        variant === 'primary' && !disabled ? shadow.glow : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={c.fg} />
      ) : (
        <Row gap={8} justify="center">
          {icon ? <Icon name={icon} size={small ? 16 : 20} color={disabled ? colors.textSubtle : c.fg} /> : null}
          <T v={small ? 'captionStrong' : 'bodyStrong'} size={small ? 13 : 16} color={disabled ? colors.textSubtle : c.fg}>
            {title}
          </T>
          {iconEnd ? <Icon name={iconEnd} size={small ? 16 : 20} color={disabled ? colors.textSubtle : c.fg} /> : null}
        </Row>
      )}
    </Pressable>
  );
}

export function IconButton({ name, onPress, color = colors.text, bg = colors.surface, size = 40, badge, testID }: { name: IconName; onPress?: () => void; color?: string; bg?: string; size?: number; badge?: number; testID?: string }) {
  return (
    <Pressable testID={testID} onPress={onPress} hitSlop={8} style={({ pressed }) => ({ width: size, height: size, borderRadius: size / 3.2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}>
      <Icon name={name} size={size * 0.5} color={color} />
      {badge ? (
        <View style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: colors.bg }}>
          <T v="micro" color="#fff" size={10} weight="bold">{badge > 9 ? '9+' : String(badge)}</T>
        </View>
      ) : null}
    </Pressable>
  );
}
