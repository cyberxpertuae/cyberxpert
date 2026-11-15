import React, { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useI18n } from '../../../src/i18n';
import { Screen, T, Row, Col, Card, Button, Segmented, Ring, Skeleton, useToast } from '../../../src/components';
import { colors } from '../../../src/theme';
import { Meal } from '../../../src/store/app';
import { nutritionService } from '../../../src/services/nutritionService';
import { useAsync } from '../../../src/utils/useAsync';

/** N03 Food detail */
export default function FoodDetail() {
  const { id, meal: m0 } = useLocalSearchParams<{ id: string; meal?: Meal }>();
  const { t, tr, num } = useI18n();
  const toast = useToast();
  const { data: fd, loading } = useAsync(() => nutritionService.getFood(id!), [id]);
  const [meal, setMeal] = useState<Meal>(m0 ?? 'snacks');
  const [qty, setQty] = useState(1);
  if (loading || !fd) return <Screen title=" "><Skeleton h={200} r={24} /></Screen>;
  const total = fd.p * 4 + fd.c * 4 + fd.f * 9 || 1;
  const box = (label: string, g: number, color: string) => (
    <Col gap={4} style={{ flex: 1, alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, padding: 12 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <T v="h3">{num(Math.round(g * qty))} g</T>
      <T v="micro" color={colors.textMuted}>{label}</T>
    </Col>
  );
  return (
    <Screen title={tr(fd.name)} footer={<Button testID="food-add" title={t('nutrition.addToMeal', { meal: t(`meal.${meal}`) })} onPress={() => { nutritionService.addFood(meal, fd.id, qty); toast(t('nutrition.addedTo', { meal: t(`meal.${meal}`) })); router.back(); }} />}>
      <Card style={{ alignItems: 'center', gap: 6 }}>
        <Ring size={150} stroke={14} value={(fd.p * 4) / total} color={colors.protein}>
          <T v="number">{num(Math.round(fd.kcal * qty))}</T>
          <T v="micro" color={colors.textMuted}>{t('common.kcal')}</T>
        </Ring>
        <T v="caption" color={colors.textMuted}>{t('nutrition.per', { s: tr(fd.serving) })}</T>
      </Card>
      <Row gap={10}>{box(t('setup.protein'), fd.p, colors.protein)}{box(t('setup.carbs'), fd.c, colors.carbs)}{box(t('setup.fat'), fd.f, colors.fat)}</Row>
      <T v="h3">{t('nutrition.servings')}</T>
      <Segmented items={[0.5, 1, 1.5, 2, 3].map((n) => ({ key: String(n) as any, label: `${n}×` }))} value={String(qty) as any} onChange={(v: any) => setQty(parseFloat(v))} />
      <T v="h3">{t('nutrition.addTo')}</T>
      <Segmented items={(['breakfast', 'lunch', 'dinner', 'snacks'] as Meal[]).map((k) => ({ key: k, label: t(`meal.${k}`) }))} value={meal} onChange={setMeal} />
    </Screen>
  );
}
