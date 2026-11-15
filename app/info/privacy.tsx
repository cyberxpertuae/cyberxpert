import React from 'react';
import { useI18n } from '../../src/i18n';
import { Screen, T, Card } from '../../src/components';
import { colors } from '../../src/theme';

/** P11 Privacy policy */
export default function Privacy() {
  const { t } = useI18n();
  return (
    <Screen title={t('info.privacyTitle')}>
      <T v="caption" color={colors.textMuted}>{t('info.updated')}</T>
      {[1, 2, 3].map((n) => <Card key={n} style={{ gap: 6 }}><T v="h3">{t(`info.p${n}h`)}</T><T v="body" color={colors.textMuted}>{t(`info.p${n}`)}</T></Card>)}
    </Screen>
  );
}
