import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { useI18n } from '../i18n';

type RowProps = ViewProps & { gap?: number; align?: ViewStyle['alignItems']; justify?: ViewStyle['justifyContent']; wrap?: boolean };

/** Direction-aware horizontal stack: flips automatically in Arabic. */
export function Row({ gap = 0, align = 'center', justify, wrap, style, ...rest }: RowProps) {
  const { row } = useI18n();
  return <View {...rest} style={[{ flexDirection: row, alignItems: align, justifyContent: justify, gap, flexWrap: wrap ? 'wrap' : 'nowrap' }, style]} />;
}

export function Col({ gap = 0, style, ...rest }: ViewProps & { gap?: number }) {
  return <View {...rest} style={[{ gap }, style]} />;
}

export const Spacer = ({ h = 0, w = 0, flex }: { h?: number; w?: number; flex?: boolean }) => <View style={flex ? { flex: 1 } : { height: h, width: w }} />;

/** Wrapping grid that starts from the right in Arabic. */
export function Wrap({ gap = 0, style, ...rest }: ViewProps & { gap?: number }) {
  const { row } = useI18n();
  return <View {...rest} style={[{ flexDirection: row, flexWrap: 'wrap', gap }, style]} />;
}

/** Keep phone numbers / codes left-to-right inside Arabic text. */
export const ltr = (s: string) => `⁦${s}⁩`;
