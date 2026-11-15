import React from 'react';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, Button, KV, SkeletonList, useToast } from '../../src/components';
import { colors } from '../../src/theme';
import { Meal } from '../../src/store/app';
import { images } from '../../src/data/images';
import { nutritionService, foodSync } from '../../src/services/nutritionService';
import { coachSync } from '../../src/services/bookingService';
import { useAsync } from '../../src/utils/useAsync';
import { useFmt } from '../../src/utils/format';

/** N05 Meal plan from nutritionist */
export default function MealPlan() {
  const { t, tr, num } = useI18n();
  const f = useFmt();
  const toast = useToast();
  const { data, loading } = useAsync(() => nutritionService.getMealPlan(), []);
  const coach = coachSync('co-sophie')!;
  const total = (data ?? []).reduce((a, m) => a + m.items.reduce((s, i) => s + foodSync(i).kcal, 0), 0);
  return (
    <Screen title={t('nutrition.planTitle')} footer={<Button testID="mp-consult" title={t('nutrition.bookConsult')} variant="dark" icon="calendar-outline" onPress={() => router.push('/services/sv-nutrition')} />}>
      <Card><Row gap={12}><Img src={images[coach.img]} style={{ width: 48, height: 48 }} radius={24} /><Col style={{ flex: 1 }}><T v="bodyStrong">{t('nutrition.planBy', { name: tr(coach.name) })}</T><T v="caption" color={colors.textMuted}>{t('nutrition.planNote')}</T></Col></Row></Card>
      {loading ? <SkeletonList rows={4} /> : (data ?? []).map((m) => (
        <Card key={m.meal} testID={`mp-${m.meal}`}>
          <Row justify="space-between" style={{ marginBottom: 6 }}>
            <Row gap={8}><Icon name="time-outline" size={16} color={colors.yellowDark} /><T v="h3">{t(`meal.${m.meal}`)}</T><T v="caption" color={colors.textMuted}>{f.time(m.time)}</T></Row>
            <T v="captionStrong" color={colors.yellowDark} onPress={() => { m.items.forEach((i) => nutritionService.addFood(m.meal as Meal, i, 1)); toast(t('nutrition.logged')); }}>{t('nutrition.logAll')}</T>
          </Row>
          {m.items.map((i) => <KV key={i} k={tr(foodSync(i).name)} v={`${num(foodSync(i).kcal)} ${t('common.kcal')}`} />)}
        </Card>
      ))}
      <Card style={{ backgroundColor: colors.black }}><KV k={t('nutrition.dayTotal')} v={`${num(total)} ${t('common.kcal')}`} color={colors.yellow} labelColor={colors.onDark} strong /></Card>
    </Screen>
  );
}
