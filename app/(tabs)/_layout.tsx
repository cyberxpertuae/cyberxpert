import React from 'react';
import { Pressable, View } from 'react-native';
import { Tabs, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '../../src/i18n';
import { T, Icon, IconName } from '../../src/components';
import { colors, shadow } from '../../src/theme';

const ITEMS: { name: string; icon: IconName; label: string }[] = [
  { name: 'home', icon: 'home', label: 'tabs.home' },
  { name: 'training', icon: 'barbell', label: 'tabs.training' },
  { name: 'checkin', icon: 'qr-code', label: 'tabs.checkin' },
  { name: 'nutrition', icon: 'restaurant', label: 'tabs.nutrition' },
  { name: 'profile', icon: 'person', label: 'tabs.profile' },
];

function TabBar({ state, navigation }: any) {
  const { t, isRTL } = useI18n();
  const insets = useSafeAreaInsets();
  const routes = ITEMS.map((i) => ({ ...i, route: state.routes.find((r: any) => r.name === i.name) }));
  const ordered = isRTL ? [...routes].reverse() : routes;
  return (
    <View style={[{ flexDirection: 'row', backgroundColor: colors.surface, paddingBottom: Math.max(insets.bottom, 10), paddingTop: 8, borderTopLeftRadius: 24, borderTopRightRadius: 24 }, shadow.raised]}>
      {ordered.map((it) => {
        const focused = state.routes[state.index]?.name === it.name;
        if (it.name === 'checkin')
          return (
            <Pressable testID="tab-checkin" key={it.name} onPress={() => router.push('/member-card')} style={{ flex: 1, alignItems: 'center' }}>
              <View style={[{ width: 58, height: 58, borderRadius: 29, backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center', marginTop: -26, borderWidth: 5, borderColor: colors.bg }, shadow.glow]}>
                <Icon name="qr-code" size={24} color={colors.black} />
              </View>
              <T v="micro" color={colors.textMuted} center style={{ marginTop: 2 }}>{t(it.label)}</T>
            </Pressable>
          );
        return (
          <Pressable testID={`tab-${it.name}`} key={it.name} onPress={() => navigation.navigate(it.name)} style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: 4 }}>
            <Icon name={(focused ? it.icon : `${it.icon}-outline`) as IconName} size={23} color={focused ? colors.black : colors.textSubtle} />
            <T v="micro" weight={focused ? 'bold' : 'medium'} color={focused ? colors.text : colors.textSubtle} center>{t(it.label)}</T>
            {focused ? <View style={{ width: 18, height: 3, borderRadius: 2, backgroundColor: colors.yellow }} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="training" />
      <Tabs.Screen name="checkin" />
      <Tabs.Screen name="nutrition" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
