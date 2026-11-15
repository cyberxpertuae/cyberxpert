import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Button, EmptyState, Pill, Dialog, useToast } from '../../src/components';
import { colors } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { shopService } from '../../src/services/shopService';

/** S06 Addresses */
export default function Addresses() {
  const { t, tr } = useI18n();
  const toast = useToast();
  const list = useApp((s) => s.addresses);
  const [del, setDel] = useState<string | null>(null);
  return (
    <Screen title={t('shop.addresses')} footer={<Button testID="addr-add" title={t('shop.addAddr')} icon="add" onPress={() => router.push('/shop/address-form')} />}>
      {!list.length ? <EmptyState icon="location-outline" title={t('shop.addrEmpty')} /> : list.map((a) => (
        <Card key={a.id} testID={`addr-${a.id}`}>
          <Row gap={12} align="flex-start">
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.yellowSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name={a.label.en === 'Work' ? 'briefcase-outline' : 'home-outline'} size={19} /></View>
            <Col style={{ flex: 1 }} gap={2}>
              <Row gap={8}><T v="bodyStrong">{tr(a.label)}</T>{a.default ? <Pill label={t('shop.addrDefault')} bg={colors.successSoft} fg={colors.success} /> : null}</Row>
              <T v="caption" color={colors.textMuted}>{a.building}{a.flat ? `, ${a.flat}` : ''}</T>
              <T v="caption" color={colors.textMuted}>{tr(a.area)} · {a.emirate}</T>
            </Col>
            <Pressable testID={`addr-edit-${a.id}`} onPress={() => router.push(`/shop/address-form?id=${a.id}`)} hitSlop={8}><Icon name="create-outline" size={20} color={colors.textMuted} /></Pressable>
            <Pressable testID={`addr-del-${a.id}`} onPress={() => setDel(a.id)} hitSlop={8}><Icon name="trash-outline" size={20} color={colors.danger} /></Pressable>
          </Row>
        </Card>
      ))}
      <Dialog visible={!!del} onClose={() => setDel(null)} danger icon="trash-outline" title={t('shop.deleteAddr')} confirm={t('common.delete')} cancel={t('common.cancel')} onConfirm={async () => { await shopService.deleteAddress(del!); setDel(null); toast(t('common.done'), 'info'); }} />
    </Screen>
  );
}
