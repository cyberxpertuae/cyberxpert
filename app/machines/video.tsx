import React from 'react';
import { Linking, Platform, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useI18n } from '../../src/i18n';
import { Screen, T, Row, Col, Icon, Button, Img } from '../../src/components';
import { colors, radius } from '../../src/theme';
import { images } from '../../src/data/images';
import { machineSync } from '../../src/services/machinesService';

/** E04 Video player — YouTube inside the app (embed when an ID is set, otherwise YouTube search for the machine). */
export default function Video() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tr, lang } = useI18n();
  const m = machineSync(id)!;
  const videoId = (m as any).videoId as string | undefined;
  const q = encodeURIComponent(m.video + (lang === 'ar' ? ' شرح' : ''));
  const url = videoId ? `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0` : `https://m.youtube.com/results?search_query=${q}`;
  return (
    <Screen title={tr(m.name)} header={{ subtitle: t('machines.videoTitle') }} scroll={false} padded={false} dark bg={colors.black}>
      {Platform.OS === 'web' ? (
        <Col gap={14} style={{ padding: 16 }}>
          <Img src={images[m.img]} style={{ height: 220, width: '100%' }} radius={radius.xl} />
          <Button title={t('machines.video')} icon="logo-youtube" onPress={() => Linking.openURL(url.replace('/embed/', '/watch?v='))} />
        </Col>
      ) : (
        <View style={{ flex: 1 }} testID="video">
          <WebView source={{ uri: url }} allowsInlineMediaPlayback mediaPlaybackRequiresUserAction={false} allowsFullscreenVideo style={{ flex: 1, backgroundColor: colors.black }} />
        </View>
      )}
      <Row gap={8} style={{ padding: 12 }}><Icon name="logo-youtube" size={18} color={colors.danger} /><T v="caption" color={colors.onDarkMuted} style={{ flex: 1 }}>{t('machines.videoNote')}</T></Row>
    </Screen>
  );
}
