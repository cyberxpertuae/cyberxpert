import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../theme';
import { T } from './T';
import { Row, Col } from './Layout';
import { Icon, IconName } from './Icon';
import { Button } from './Button';

/* ---------- Bottom sheet ---------- */
export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={onClose} />
      <View style={{ backgroundColor: colors.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: spacing.md, paddingBottom: Math.max(insets.bottom, 16) + 8, maxHeight: '88%' }} testID="sheet">
        <View style={{ width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 12 }} />
        {title ? (
          <Row justify="space-between" style={{ marginBottom: 12 }}>
            <T v="h2">{title}</T>
            <Pressable onPress={onClose} hitSlop={10} testID="sheet-close">
              <Icon name="close" size={22} color={colors.textMuted} />
            </Pressable>
          </Row>
        ) : null}
        {children}
      </View>
    </Modal>
  );
}

/* ---------- Confirm dialog ---------- */
export function Dialog({ visible, onClose, title, body, icon = 'alert-circle-outline', confirm, cancel, onConfirm, danger, loading }: { visible: boolean; onClose: () => void; title: string; body?: string; icon?: IconName; confirm: string; cancel?: string; onConfirm: () => void; danger?: boolean; loading?: boolean }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Col gap={12} style={{ backgroundColor: colors.surface, borderRadius: 28, padding: 24, width: '100%', maxWidth: 400 }} testID="dialog">
          <View style={{ width: 64, height: 64, borderRadius: 32, alignSelf: 'center', backgroundColor: danger ? colors.dangerSoft : colors.yellowSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={icon} size={30} color={danger ? colors.danger : colors.yellowDark} />
          </View>
          <T v="h2" center>{title}</T>
          {body ? <T v="body" center color={colors.textMuted}>{body}</T> : null}
          <Col gap={8} style={{ marginTop: 8 }}>
            <Button testID="dialog-confirm" title={confirm} variant={danger ? 'danger' : 'primary'} onPress={onConfirm} loading={loading} />
            {cancel ? <Button testID="dialog-cancel" title={cancel} variant="ghost" onPress={onClose} /> : null}
          </Col>
        </Col>
      </View>
    </Modal>
  );
}

/* ---------- Toast ---------- */
type ToastKind = 'success' | 'info' | 'error';
const ToastCtx = createContext<(msg: string, kind?: ToastKind) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<{ text: string; kind: ToastKind } | null>(null);
  const a = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();
  const show = useCallback((text: string, kind: ToastKind = 'success') => {
    setMsg({ text, kind });
    if (timer.current) clearTimeout(timer.current);
    Animated.spring(a, { toValue: 1, useNativeDriver: true }).start();
    timer.current = setTimeout(() => Animated.timing(a, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setMsg(null)), 2200);
  }, [a]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const icon: IconName = msg?.kind === 'error' ? 'alert-circle' : msg?.kind === 'info' ? 'information-circle' : 'checkmark-circle';
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg ? (
        <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 90, opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }} testID="toast">
          <Row gap={10} style={{ backgroundColor: colors.black, borderRadius: radius.lg, paddingHorizontal: 16, paddingVertical: 14 }}>
            <Icon name={icon} size={20} color={msg.kind === 'error' ? colors.danger : colors.yellow} />
            <T v="bodyStrong" color={colors.onDark} style={{ flex: 1 }}>{msg.text}</T>
          </Row>
        </Animated.View>
      ) : null}
    </ToastCtx.Provider>
  );
}
