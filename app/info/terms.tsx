import React from 'react';
import { useI18n } from '../../src/i18n';
import { Screen, T, Card } from '../../src/components';
import { colors } from '../../src/theme';

/** P10 Terms & conditions */
export default function Terms() {
  const { t } = useI18n();
  return (
    <Screen title={t('info.termsTitle')}>
      <T v="caption" color={colors.textMuted}>{t('info.updated')}</T>
      {[1, 2, 3, 4, 5].map((n) => <Card key={n} style={{ gap: 6 }}><T v="h3">{t(`info.t${n}h`)}</T><T v="body" color={colors.textMuted}>{t(`info.t${n}`)}</T></Card>)}
    </Screen>
  );
}
