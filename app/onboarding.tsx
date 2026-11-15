import React, { useRef, useState } from 'react';
import { FlatList, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useI18n } from '../src/i18n';
import { T, Row, Col, Button, Img } from '../src/components';
import { colors } from '../src/theme';
import { images } from '../src/data/images';

/** A03 Onboarding (3 slides) */
export default function Onboarding() {
  const { t, isRTL } = useI18n();
  const { width } = useWindowDimensions();
  const [i, setI] = useState(0);
  const ref = useRef<FlatList>(null);
  const slides = [
    { img: images['hero-gym'], title: t('onb.t1'), body: t('onb.b1') },
    { img: images['s-nutrition'], title: t('onb.t2'), body: t('onb.b2') },
    { img: images['hero-deadlift'], title: t('onb.t3'), body: t('onb.b3') },
  ];
  const next = () => { if (i < 2) { ref.current?.scrollToIndex({ index: i + 1 }); setI(i + 1); } else router.replace('/welcome'); };
  return (
    <View style={{ flex: 1, backgroundColor: colors.black }}>
      <StatusBar style="light" />
      <FlatList
        ref={ref}
        data={slides}
        horizontal
        pagingEnabled
        inverted={isRTL}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, k) => String(k)}
        onMomentumScrollEnd={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={{ width, flex: 1 }}>
            <Img src={item.img} style={{ position: 'absolute', width: '100%', height: '100%' }} />
            <LinearGradient colors={['rgba(11,11,12,0.1)', 'rgba(11,11,12,0.55)', colors.black]} locations={[0, 0.45, 0.78]} style={{ position: 'absolute', width: '100%', height: '100%' }} />
          </View>
        )}
      />
      <SafeAreaView edges={['bottom']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20, gap: 14 }}>
        <Row gap={6}>
          {slides.map((_, k) => <View key={k} style={{ height: 6, width: k === i ? 26 : 8, borderRadius: 3, backgroundColor: k === i ? colors.yellow : 'rgba(255,255,255,0.3)' }} />)}
        </Row>
        <Col gap={8} style={{ minHeight: 150 }}>
          <T v="display" color={colors.onDark}>{slides[i].title}</T>
          <T v="body" color={colors.onDarkMuted}>{slides[i].body}</T>
        </Col>
        <Row gap={10}>
          {i < 2 ? <Button testID="onb-skip" title={t('common.skip')} variant="ghost" full={false} style={{ flex: 1 }} onPress={() => router.replace('/welcome')} /> : null}
          <Button testID="onb-next" title={i < 2 ? t('common.next') : t('onb.start')} onPress={next} full={false} style={{ flex: 2 }} iconEnd="arrow-forward" />
        </Row>
      </SafeAreaView>
    </View>
  );
}
