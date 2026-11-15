import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Card, Img, Button, SkeletonList, IconName } from '../../src/components';
import { colors } from '../../src/theme';
import { images } from '../../src/data/images';
import { machinesService } from '../../src/services/machinesService';
import { useAsync } from '../../src/utils/useAsync';

/** E01 Gym zones / sections */
export default function Machines() {
  const { t, tr } = useI18n();
  const { data, loading } = useAsync(() => machinesService.getZones(), []);
  return (
    <Screen title={t('machines.title')} header={{ subtitle: t('machines.sub') }}>
      <Button testID="mc-scan" title={t('machines.scan')} icon="scan-outline" variant="dark" onPress={() => router.push('/machines/scan')} />
      {loading ? <SkeletonList rows={6} card={110} /> : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {(data ?? []).map((z) => (
            <Card key={z.id} testID={`zone-${z.id}`} padded={false} style={{ width: '47.5%', height: 190 }} onPress={() => router.push(`/machines/zone/${z.id}`)}>
              <Img src={images[z.img]} style={{ position: 'absolute', width: '100%', height: '100%' }} />
              <LinearGradient colors={['rgba(11,11,12,0)', 'rgba(11,11,12,0.92)']} style={{ flex: 1, justifyContent: 'flex-end', padding: 12, gap: 2 }}>
                <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}><Icon name={z.icon as IconName} size={18} color={colors.black} /></View>
                <T v="bodyStrong" color={colors.onDark}>{tr(z.name)}</T>
                <T v="micro" color={colors.gold}>{t('machines.count', { n: z.count })}</T>
              </LinearGradient>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
