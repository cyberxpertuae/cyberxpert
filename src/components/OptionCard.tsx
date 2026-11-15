import React from 'react';
import { Pressable, View } from 'react-native';
import { colors, radius } from '../theme';
import { T } from './T';
import { Row, Col } from './Layout';
import { Icon, IconName } from './Icon';

export function OptionCard({ icon, title, sub, selected, onPress, testID }: { icon?: IconName; title: string; sub?: string; selected?: boolean; onPress?: () => void; testID?: string }) {
  return (
    <Pressable testID={testID} onPress={onPress}>
      <Row gap={14} style={{ backgroundColor: selected ? colors.black : colors.surface, borderRadius: radius.xl, padding: 16, borderWidth: 1.5, borderColor: selected ? colors.yellow : colors.border }}>
        {icon ? (
          <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: selected ? colors.yellow : colors.yellowSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={icon} size={22} color={colors.black} />
          </View>
        ) : null}
        <Col style={{ flex: 1 }}>
          <T v="h3" color={selected ? colors.onDark : colors.text}>{title}</T>
          {sub ? <T v="caption" color={selected ? colors.onDarkMuted : colors.textMuted}>{sub}</T> : null}
        </Col>
        <Icon name={selected ? 'checkmark-circle' : 'ellipse-outline'} color={selected ? colors.yellow : colors.textSubtle} />
      </Row>
    </Pressable>
  );
}
