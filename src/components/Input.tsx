import React, { useState } from 'react';
import { Pressable, TextInput, TextInputProps, View } from 'react-native';
import { colors, fonts, radius } from '../theme';
import { useI18n } from '../i18n';
import { T } from './T';
import { Row } from './Layout';
import { Icon, IconName } from './Icon';

type Props = TextInputProps & { label?: string; error?: string | null; prefix?: string; icon?: IconName; secure?: boolean; hint?: string; onPressField?: () => void; rightText?: string };

export function Input({ label, error, prefix, icon, secure, hint, multiline, onPressField, rightText, style, ...rest }: Props) {
  const { isRTL, align, row } = useI18n();
  const [focus, setFocus] = useState(false);
  const [hidden, setHidden] = useState(true);
  const borderColor = error ? colors.danger : focus ? colors.yellow : colors.border;
  const field = (
    <Row
      gap={10}
      align={multiline ? 'flex-start' : 'center'}
      style={{ minHeight: multiline ? 110 : 54, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: focus || error ? 1.5 : 1, borderColor, paddingHorizontal: 16, paddingVertical: multiline ? 12 : 0 }}
    >
      {icon ? <Icon name={icon} size={20} color={colors.textMuted} /> : null}
      {prefix ? (
        <View style={{ flexDirection: row, alignItems: 'center', gap: 8 }}>
          <T v="bodyStrong">{prefix}</T>
          <View style={{ width: 1, height: 22, backgroundColor: colors.border }} />
        </View>
      ) : null}
      <TextInput
        {...rest}
        editable={onPressField ? false : rest.editable}
        pointerEvents={onPressField ? 'none' : 'auto'}
        multiline={multiline}
        secureTextEntry={secure && hidden}
        placeholderTextColor={colors.textSubtle}
        onFocus={(e) => { setFocus(true); rest.onFocus?.(e); }}
        onBlur={(e) => { setFocus(false); rest.onBlur?.(e); }}
        style={[{ flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.text, textAlign: prefix && rest.keyboardType === 'phone-pad' ? 'left' : align, writingDirection: isRTL ? 'rtl' : 'ltr', paddingVertical: multiline ? 0 : 12, textAlignVertical: multiline ? 'top' : 'center', minHeight: multiline ? 86 : undefined }, style]}
      />
      {rightText ? <T v="captionStrong" color={colors.textMuted}>{rightText}</T> : null}
      {secure ? (
        <Pressable onPress={() => setHidden(!hidden)} hitSlop={10}>
          <Icon name={hidden ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
        </Pressable>
      ) : null}
      {onPressField ? <Icon name="chevron-down" size={18} color={colors.textMuted} /> : null}
    </Row>
  );
  return (
    <View style={{ gap: 6 }}>
      {label ? <T v="captionStrong" color={colors.textMuted}>{label}</T> : null}
      {onPressField ? <Pressable onPress={onPressField}>{field}</Pressable> : field}
      {error ? <T v="caption" color={colors.danger}>{error}</T> : hint ? <T v="caption" color={colors.textSubtle}>{hint}</T> : null}
    </View>
  );
}
