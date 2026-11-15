import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { useI18n } from '../i18n';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];
const DIRECTIONAL = /(chevron-(forward|back)|arrow-(forward|back)|caret-(forward|back)|return-|exit-outline|log-out|send|trending)/;

/** One icon family (Ionicons). Directional icons are mirrored in RTL. */
export function Icon({ name, size = 22, color = colors.text, noFlip }: { name: IconName; size?: number; color?: string; noFlip?: boolean }) {
  const { isRTL } = useI18n();
  const flip = isRTL && !noFlip && DIRECTIONAL.test(String(name));
  return <Ionicons name={name} size={size} color={color} style={flip ? { transform: [{ scaleX: -1 }] } : undefined} />;
}
