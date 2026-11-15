import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Ring, ProgressBar, IconButton, Divider, Button, useToast } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { useApp, Meal } from '../../src/store/app';
import { nutritionService, foodSync } from '../../src/services/nutritionService';

/** N01 Calories today */
export default function Nutrition() {
  const { t, tr, num } = useI18n();
  const toast = useToast();
  const diary = useApp((s) => s.diary);
  const water = useApp((s) => s.water);
  useApp((s) => s.calorieGoal);
  useApp((s) => s.burnedToday);
  const n = nutritionService.dayTotals();
  const macro = (label: string, v: number, goal: number, color: string) => (
    <Col gap={6} style={{ flex: 1 }}>
      <T v="micro" color={colors.textMuted}>{label}</T>
      <ProgressBar value={v / goal} color={color} />
      <T v="captionStrong">{num(v)}<T v="micro" color={colors.textMuted}> / {num(goal)} g</T></T>
    </Col>
  );
  const meals: Meal[] = ['breakfast', 'lunch', 'dinner', 'snacks'];
  return (
    <Screen contentStyle={{ paddingBottom: 110 }}>
      <Row justify="space-between">
        <T v="display">{t('nutrition.title')}</T>
        <Row gap={8}>
          <IconButton testID="nut-calc" name="calculator-outline" onPress={() => router.push('/nutrition/calculator')} />
          <IconButton testID="nut-plan" name="document-text-outline" onPress={() => router.push('/nutrition/meal-plan')} />
        </Row>
      </Row>
      <Card style={{ backgroundColor: colors.black, gap: 16 }}>
        <Row justify="space-around">
          <Col style={{ alignItems: 'center' }}><T v="h2" color={colors.onDark}>{num(n.eaten)}</T><T v="micro" color={colors.onDarkMuted}>{t('nutrition.eaten')}</T></Col>
          <Ring size={150} stroke={14} value={n.eaten / (n.goal + n.burned)} track={colors.ink3} color={n.left < 0 ? colors.danger : colors.yellow}>
            <T v="number" color={colors.onDark}>{num(Math.abs(n.left))}</T>
            <T v="micro" color={colors.onDarkMuted}>{n.left < 0 ? t('nutrition.over') : t('nutrition.leftOf')}</T>
          </Ring>
          <Col style={{ alignItems: 'center' }}><T v="h2" color={colors.onDark}>{num(n.burned)}</T><T v="micro" color={colors.onDarkMuted}>{t('nutrition.burned')}</T></Col>
        </Row>
        <T v="caption" center color={colors.gold}>{t('nutrition.goal')}: {num(n.goal)} {t('common.kcal')}</T>
      </Card>
      <Card><Row gap={14}>{macro(t('setup.protein'), n.p, n.pGoal, colors.protein)}{macro(t('setup.carbs'), n.c, n.cGoal, colors.carbs)}{macro(t('setup.fat'), n.f, n.fGoal, colors.fat)}</Row></Card>
      {meals.map((m) => (
        <Card key={m} testID={`meal-${m}`}>
          <Row justify="space-between">
            <Col><T v="h3">{t(`meal.${m}`)}</T><T v="caption" color={colors.textMuted}>{num(nutritionService.mealKcal(m))} {t('common.kcal')}</T></Col>
            <IconButton testID={`add-${m}`} name="add" bg={colors.yellow} onPress={() => router.push(`/nutrition/add-food?meal=${m}`)} />
          </Row>
          {diary[m].length ? <Divider style={{ marginVertical: 8 }} /> : null}
          {diary[m].length === 0 ? <T v="caption" color={colors.textSubtle} style={{ marginTop: 6 }}>{t('nutrition.emptyMeal')}</T> : null}
          {diary[m].map((e) => {
            const food = foodSync(e.food);
            return (
              <Row key={e.uid} gap={10} style={{ paddingVertical: 6 }}>
                <Col style={{ flex: 1 }}>
                  <T v="bodyStrong">{tr(food.name)}</T>
                  <T v="micro" color={colors.textMuted}>{e.qty} × {tr(food.serving)}</T>
                </Col>
                <T v="captionStrong">{num(Math.round(food.kcal * e.qty))}</T>
                <Pressable testID={`rm-${e.uid}`} hitSlop={8} onPress={() => { nutritionService.removeFood(m, e.uid); toast(t('nutrition.removed'), 'info'); }}>
                  <Icon name="close-circle" size={20} color={colors.textSubtle} />
                </Pressable>
              </Row>
            );
          })}
        </Card>
      ))}
      <Card>
        <Row justify="space-between">
          <Row gap={8}><Icon name="water" color={colors.info} /><T v="h3">{t('nutrition.water')}</T></Row>
          <T v="caption" color={colors.textMuted}>{t('nutrition.glasses', { n: water })}</T>
        </Row>
        <Row gap={6} style={{ marginTop: 12 }} wrap>
          {Array.from({ length: 8 }).map((_, i) => (
            <Pressable testID={`water-${i}`} key={i} onPress={() => nutritionService.setWater(i < water ? i : i + 1)} style={{ width: 34, height: 44, borderRadius: 10, backgroundColor: i < water ? colors.infoSoft : colors.surface2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: i < water ? colors.info : colors.border }}>
              <Icon name={i < water ? 'water' : 'water-outline'} size={18} color={i < water ? colors.info : colors.textSubtle} />
            </Pressable>
          ))}
        </Row>
      </Card>
      <Button testID="nut-addfood" title={t('nutrition.addFood')} icon="add" onPress={() => router.push('/nutrition/add-food?meal=snacks')} />
      <View />
    </Screen>
  );
}
