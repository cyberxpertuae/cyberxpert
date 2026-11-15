import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { colors, fonts, type, TypeVariant, FontWeight } from '../theme';
import { useI18n } from '../i18n';

type Props = TextProps & {
  v?: TypeVariant;
  color?: string;
  weight?: FontWeight;
  center?: boolean;
  /** force alignment to the logical end (right in LTR, left in RTL) */
  alignEnd?: boolean;
  size?: number;
};

export function T({ v = 'body', color = colors.text, weight, center, alignEnd, size, style, children, ...rest }: Props) {
  const { align, end, isRTL } = useI18n();
  const base = type[v];
  const fs = size ?? base.fontSize;
  const s: TextStyle = {
    fontFamily: fonts[weight ?? base.weight],
    fontSize: fs,
    lineHeight: size ? Math.round(size * 1.4) : base.lineHeight,
    color,
    textAlign: center ? 'center' : alignEnd ? end : align,
    writingDirection: isRTL ? 'rtl' : 'ltr',
    includeFontPadding: false,
  };
  return (
    <Text {...rest} style={[s, style]}>
      {children}
    </Text>
  );
}
