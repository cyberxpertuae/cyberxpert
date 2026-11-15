import React from 'react';
import { Pressable } from 'react-native';
import { colors, radius } from '../theme';
import { useFmt } from '../utils/format';
import { T } from './T';
import { HList } from './UI';

export function DateStrip({ dates, value, onChange }: { dates: string[]; value: string | null; onChange: (d: string) => void }) {
  const f = useFmt();
  return (
    <HList data={dates} keyExtractor={(x) => x} renderItem={(x) => {
      const on = x === value;
      return (
        <Pressable testID={`date-${x}`} onPress={() => onChange(x)} style={{ width: 60, height: 76, borderRadius: radius.lg, backgroundColor: on ? colors.black : colors.surface, alignItems: 'center', justifyContent: 'center', gap: 2, borderWidth: on ? 0 : 1, borderColor: colors.border }}>
          <T v="micro" color={on ? colors.onDarkMuted : colors.textMuted}>{f.dow(x)}</T>
          <T v="h2" color={on ? colors.yellow : colors.text}>{f.dayNum(x)}</T>
        </Pressable>
      );
    }} />
  );
}
