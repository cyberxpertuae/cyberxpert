import React from 'react';
import { Pressable, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '../../../src/i18n';
import { T, Icon, IconName } from '../../../src/components';
import { colors } from '../../../src/theme';

const ITEMS: { name: string; icon: IconName; label: string }[] = [
  { name: 'dashboard', icon: 'grid', label: 'tabs.dashboard' },
  { name: 'members', icon: 'people', label: 'tabs.members' },
  { name: 'checkin', icon: 'scan', label: 'tabs.checkin' },
  { name: 'pos', icon: 'cart', label: 'tabs.pos' },
  { name: 'account', icon: 'person-circle', label: 'tabs.account' },
];

function Bar({ state, navigation }: any) {
  const { t, isRTL } = useI18n();
  const insets = useSafeAreaInsets();
  const items = isRTL ? [...ITEMS].reverse() : ITEMS;
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.black, paddingBottom: Math.max(insets.bottom, 10), paddingTop: 10 }}>
      {items.map((it) => {
        const on = state.routes[state.index]?.name === it.name;
        return (
          <Pressable testID={`stab-${it.name}`} key={it.name} onPress={() => navigation.navigate(it.name)} style={{ flex: 1, alignItems: 'center', gap: 3 }}>
            <Icon name={(on ? it.icon : `${it.icon}-outline`) as IconName} size={22} color={on ? colors.yellow : colors.onDarkMuted} />
            <T v="micro" color={on ? colors.yellow : colors.onDarkMuted} center>{t(it.label)}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function StaffTabs() {
  return (
    <Tabs tabBar={(p) => <Bar {...p} />} screenOptions={{ headerShown: false }}>
      {ITEMS.map((i) => <Tabs.Screen key={i.name} name={i.name} />)}
    </Tabs>
  );
}
