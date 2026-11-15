import React, { useEffect, useState } from 'react';
import { Pressable, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Segmented, SkeletonList, EmptyState, useToast } from '../../src/components';
import { colors, fonts, radius } from '../../src/theme';
import { Meal } from '../../src/store/app';
import { nutritionService, Food } from '../../src/services/nutritionService';

/** N02 Add food */
export default function AddFood() {
  const { t, tr, align, isRTL, num } = useI18n();
  const toast = useToast();
  const { meal: m0 } = useLocalSearchParams<{ meal?: Meal }>();
  const [meal, setMeal] = useState<Meal>(m0 ?? 'snacks');
  const [q, setQ] = useState('');
  const [list, setList] = useState<Food[] | null>(null);
  useEffect(() => { setList(null); const id = setTimeout(() => nutritionService.searchFoods(q).then(setList), 200); return () => clearTimeout(id); }, [q]);
  return (
    <Screen title={t('nutrition.addTitle')}>
      <T v="captionStrong" color={colors.textMuted}>{t('nutrition.addTo')}</T>
      <Segmented items={(['breakfast', 'lunch', 'dinner', 'snacks'] as Meal[]).map((k) => ({ key: k, label: t(`meal.${k}`) }))} value={meal} onChange={setMeal} />
      <Row gap={10} style={{ backgroundColor: colors.surface, borderRadius: radius.lg, height: 50, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border }}>
        <Icon name="search-outline" size={19} color={colors.textMuted} />
        <TextInput testID="food-search" value={q} onChangeText={setQ} placeholder={t('nutrition.searchPh')} placeholderTextColor={colors.textSubtle} style={{ flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.text, textAlign: align, writingDirection: isRTL ? 'rtl' : 'ltr' }} />
      </Row>
      {!list ? <SkeletonList rows={6} card={60} /> : !list.length ? <EmptyState icon="restaurant-outline" title={t('nutrition.noFood')} /> : (
        <Card style={{ paddingVertical: 4 }}>
          {list.map((fd, i) => (
            <Pressable testID={`food-${fd.id}`} key={fd.id} onPress={() => router.push(`/nutrition/food/${fd.id}?meal=${meal}`)}>
              <Row gap={12} style={{ paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}>
                <Col style={{ flex: 1 }}><T v="bodyStrong">{tr(fd.name)}</T><T v="micro" color={colors.textMuted}>{tr(fd.serving)} · P {fd.p} · C {fd.c} · F {fd.f}</T></Col>
                <T v="captionStrong">{num(fd.kcal)}</T>
                <Pressable testID={`quick-add-${fd.id}`} hitSlop={8} onPress={() => { nutritionService.addFood(meal, fd.id, 1); toast(t('nutrition.addedTo', { meal: t(`meal.${meal}`) })); }} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="add" size={18} />
                </Pressable>
              </Row>
            </Pressable>
          ))}
        </Card>
      )}
    </Screen>
  );
}
