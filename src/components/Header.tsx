import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing } from '../theme';
import { T } from './T';
import { Row } from './Layout';
import { IconButton } from './Button';

export type HeaderProps = { title?: string; subtitle?: string; back?: boolean; onBack?: () => void; right?: React.ReactNode; dark?: boolean; transparent?: boolean };

export function Header({ title, subtitle, back = true, onBack, right, dark }: HeaderProps) {
  return (
    <Row gap={12} style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.xs, minHeight: 56 }}>
      {back ? (
        <IconButton
          testID="back"
          name="chevron-back"
          bg={dark ? colors.ink3 : colors.surface}
          color={dark ? colors.onDark : colors.text}
          onPress={() => (onBack ? onBack() : router.canGoBack() ? router.back() : router.replace('/'))}
        />
      ) : null}
      <View style={{ flex: 1 }}>
        {title ? (
          <T v="h2" color={dark ? colors.onDark : colors.text} numberOfLines={1}>
            {title}
          </T>
        ) : null}
        {subtitle ? (
          <T v="caption" color={dark ? colors.onDarkMuted : colors.textMuted} numberOfLines={1}>
            {subtitle}
          </T>
        ) : null}
      </View>
      {right ? <Row gap={8}>{right}</Row> : null}
    </Row>
  );
}
