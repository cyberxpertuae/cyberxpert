import React from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing } from '../theme';
import { Header, HeaderProps } from './Header';

type Props = {
  children: React.ReactNode;
  title?: string;
  header?: Partial<HeaderProps> | false;
  scroll?: boolean;
  padded?: boolean;
  bg?: string;
  dark?: boolean;
  footer?: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
};

export function Screen({ children, title, header, scroll = true, padded = true, bg = colors.bg, dark, footer, refreshing, onRefresh, edges = ['top'], contentStyle }: Props) {
  const content = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[{ padding: padded ? spacing.md : 0, paddingBottom: 32, gap: spacing.md }, contentStyle]}
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.yellowDark} colors={[colors.yellowDark]} /> : undefined}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, padding: padded ? spacing.md : 0 }, contentStyle]}>{children}</View>
  );
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      {header !== false && (title || header) ? <Header title={title} dark={dark} {...(header || {})} /> : null}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {content}
        {footer ? (
          <SafeAreaView edges={['bottom']} style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.sm, backgroundColor: bg, borderTopWidth: 1, borderTopColor: colors.border }}>
            {footer}
          </SafeAreaView>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
